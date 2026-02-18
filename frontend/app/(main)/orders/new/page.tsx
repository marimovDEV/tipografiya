"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, AlertTriangle, CheckCircle, XCircle, Loader2, AlertCircle, Clock, FileText } from "lucide-react"
import { getProductTemplates, validateOrderMaterials, getCompatibleMaterials } from "@/lib/api/printery"
import { fetchWithAuth, fetchDielinePreview, fetchNestingOptimization, fetchPricingCalculation } from "@/lib/api-client"
import type { ProductTemplate, Client, MaterialValidationResult } from "@/lib/types"
import { VisualCanvas } from "@/components/visual-engine/VisualCanvas"
import ThreeDViewer from "@/components/ThreeDViewer"

type WizardStep = "template" | "client" | "specifications" | "validation" | "confirmation"

export default function NewOrderWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>("template")
  const [loading, setLoading] = useState(false)

  // Form data
  const [selectedTemplate, setSelectedTemplate] = useState<ProductTemplate | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [specifications, setSpecifications] = useState({
    width_cm: 0,
    height_cm: 0,
    depth_cm: 5,
    quantity: 1000,
    color_count: 4,
    has_lacquer: false,
    has_gluing: false,
    deadline: "",
    notes: "",
    // New 3D props
    sides: 4,
    lid_type: 'hinged',
    handle_type: 'none',
  })
  const [validationResult, setValidationResult] = useState<MaterialValidationResult | null>(null)

  const steps: { key: WizardStep; label: string }[] = [
    { key: "template", label: "Shablon" },
    { key: "client", label: "Mijoz" },
    { key: "specifications", label: "Spetsifikatsiya" },
    { key: "validation", label: "Tekshirish" },
    { key: "confirmation", label: "Tasdiqlash" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  async function handleNext() {
    if (currentStep === "template" && selectedTemplate) {
      setSpecifications({
        ...specifications,
        width_cm: selectedTemplate.default_width || 20,
        height_cm: selectedTemplate.default_height || 15,
        depth_cm: selectedTemplate.default_depth || 5,
        // Map category to 3D props
        sides: selectedTemplate.category === 'cookie_box' ? 6 : 4,
        lid_type: selectedTemplate.category === 'gift_bag' ? 'flat' : 'hinged',
        handle_type: selectedTemplate.category === 'gift_bag' ? 'rope' : 'none',
      })
      setCurrentStep("client")
    } else if (currentStep === "client" && selectedClient) {
      setCurrentStep("specifications")
    } else if (currentStep === "specifications") {
      // Skip validation, go directly to confirmation
      setCurrentStep("confirmation")
    } else if (currentStep === "validation") {
      // Allow proceeding even if validation failed
      setCurrentStep("confirmation")
    }
  }

  async function validateMaterials() {
    if (!selectedTemplate) return

    try {
      setLoading(true)
      const result = await validateOrderMaterials({
        product_template_id: selectedTemplate.id,
        width_cm: specifications.width_cm,
        height_cm: specifications.height_cm,
        quantity: specifications.quantity,
        color_count: specifications.color_count,
        has_lacquer: specifications.has_lacquer,
        has_gluing: specifications.has_gluing,
      })

      setValidationResult(result.validation)
      setCurrentStep("validation")
    } catch (error) {
      console.error("Validation failed:", error)
      // Don't stop - allow user to proceed anyway
      setCurrentStep("confirmation")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    try {
      setLoading(true)

      // Load pricing config from localStorage
      let pricingConfig = {
        base_price_per_sqm: 50,
        color_markup_percent: 10,
        lacquer_markup_percent: 15,
        gluing_markup_percent: 10
      }

      try {
        const stored = localStorage.getItem('pricing_config')
        if (stored) {
          pricingConfig = JSON.parse(stored)
        }
      } catch (e) {
        console.warn('Could not load pricing config, using defaults')
      }

      // Calculate price using config
      const area = (specifications.width_cm * specifications.height_cm) / 10000 // m²
      const basePrice = area * specifications.quantity * pricingConfig.base_price_per_sqm
      const colorMultiplier = 1 + (specifications.color_count * pricingConfig.color_markup_percent / 100)
      const lacquerPrice = specifications.has_lacquer ? basePrice * (pricingConfig.lacquer_markup_percent / 100) : 0
      const gluingPrice = specifications.has_gluing ? basePrice * (pricingConfig.gluing_markup_percent / 100) : 0
      const subtotal = basePrice * colorMultiplier
      const totalPrice = subtotal + lacquerPrice + gluingPrice

      const orderData = {
        client_id: selectedClient!.id,
        product_template: selectedTemplate!.id,
        box_type: selectedTemplate!.name,
        paper_width: specifications.width_cm,
        paper_height: specifications.height_cm,
        quantity: specifications.quantity,
        print_colors: specifications.color_count.toString(),
        lacquer_type: specifications.has_lacquer ? "matt" : "none",
        additional_processing: specifications.has_gluing ? "gluing" : "",
        deadline: specifications.deadline || undefined,
        notes: specifications.notes,
        total_price: Math.round(totalPrice), // Send calculated price
      }

      const response = await fetchWithAuth("/api/orders/", {
        method: "POST",
        body: JSON.stringify(orderData),
      })

      if (!response.ok) throw new Error("Failed to create order")

      const order = await response.json()
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Failed to create order:", error)
      alert("Buyurtma yaratishda xatolik")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Yangi Buyurtma</h1>
          <p className="text-slate-400 mt-1">
            Material tekshiruvi bilan aqlli buyurtma yaratish
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${index < currentStepIndex
                    ? "bg-green-500 text-white"
                    : index === currentStepIndex
                      ? "bg-primary text-white"
                      : "bg-slate-700 text-slate-400"
                    }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm mt-2 font-medium text-slate-300">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${index < currentStepIndex ? "bg-green-500" : "bg-slate-700"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 min-h-[400px]">
        {currentStep === "template" && (
          <TemplateStep
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        )}
        {currentStep === "client" && (
          <ClientStep
            selectedClient={selectedClient}
            onSelect={setSelectedClient}
          />
        )}
        {currentStep === "specifications" && (
          <SpecificationsStep
            template={selectedTemplate!}
            specifications={specifications}
            onChange={setSpecifications}
          />
        )}
        {currentStep === "validation" && validationResult && (
          <ValidationStep
            result={validationResult}
            onRetry={() => setCurrentStep("specifications")}
          />
        )}
        {currentStep === "confirmation" && (
          <ConfirmationStep
            template={selectedTemplate!}
            client={selectedClient!}
            specifications={specifications}
            validation={validationResult!}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            const prevIndex = currentStepIndex - 1
            if (prevIndex >= 0) {
              setCurrentStep(steps[prevIndex].key)
            }
          }}
          disabled={currentStepIndex === 0}
          className="px-6 py-2 border border-slate-700 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Orqaga
        </button>

        {currentStep === "confirmation" ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Yaratilmoqda...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Buyurtma Yaratish
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={
              (currentStep === "template" && !selectedTemplate) ||
              (currentStep === "client" && !selectedClient) ||
              (currentStep === "validation" && !validationResult?.is_valid) ||
              loading
            }
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              <>
                Keyingi
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function TemplateStep({
  selectedTemplate,
  onSelect,
}: {
  selectedTemplate: ProductTemplate | null
  onSelect: (template: ProductTemplate) => void
}) {
  const [templates, setTemplates] = useState<ProductTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      const response = await getProductTemplates({ is_active: true })
      console.log('Order wizard templates:', response)

      // Handle both array and {results: []} response formats
      const templatesArray = Array.isArray(response) ? response : (response.results || [])
      setTemplates(templatesArray)
      console.log('Loaded templates in wizard:', templatesArray.length)
    } catch (error) {
      console.error("Failed to load templates:", error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">Faol shablonlar topilmadi</p>
        <p className="text-sm text-slate-500">
          Shablonlar yaratish uchun <a href="/templates" className="text-blue-400 underline">bu yerga</a> bosing
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-50">Mahsulot Shablonini Tanlang</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`text-left border rounded-lg p-4 transition-all ${selectedTemplate?.id === template.id
              ? "border-blue-500 bg-blue-950/50 ring-2 ring-blue-500"
              : "border-slate-700 bg-slate-800 hover:border-blue-500/50 hover:bg-slate-750"
              }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-slate-50">{template.name}</h4>
              {selectedTemplate?.id === template.id && (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              )}</div>
            <p className="text-sm text-slate-400 mb-2">
              {template.category_display}
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <span>{template.layer_count} qatlam</span>
              <span>{template.default_waste_percent}% chiqindi</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ClientStep({
  selectedClient,
  onSelect,
}: {
  selectedClient: Client | null
  onSelect: (client: Client) => void
}) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    try {
      const response = await fetchWithAuth("/api/customers/")
      const data = await response.json()
      console.log('Clients response:', data)

      // Handle both array and {results: []} response formats
      const clientsArray = Array.isArray(data) ? data : (data.results || [])
      setClients(clientsArray)
      console.log('Loaded clients:', clientsArray.length)
    } catch (error) {
      console.error("Failed to load clients:", error)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Mijozlar topilmadi</p>
        <p className="text-sm text-muted-foreground">
          Mijoz qo'shish uchun <a href="/clients/new" className="text-primary underline">bu yerga</a> bosing
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Mijozni Tanlang</h3>

      <input
        type="text"
        placeholder="Mijoz ismi bo'yicha qidirish..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {filteredClients.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Qidiruv natijasi topilmadi
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => onSelect(client)}
              className={`text-left border rounded-lg p-4 transition-all ${selectedClient?.id === client.id
                ? "border-primary bg-primary/5 ring-2 ring-primary"
                : "hover:border-primary/50 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{client.full_name}</h4>
                  {client.company && (
                    <p className="text-sm text-muted-foreground">{client.company}</p>
                  )}
                  {client.phone && (
                    <p className="text-xs text-muted-foreground mt-1">{client.phone}</p>
                  )}
                </div>
                {selectedClient?.id === client.id && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


// Imports moved to top

function SpecificationsStep({
  template,
  specifications,
  onChange,
}: {
  template: ProductTemplate
  specifications: any
  onChange: (specs: any) => void
}) {
  const [dielineData, setDielineData] = useState<{ path: string, viewBox: string } | null>(null)
  const [nestingData, setNestingData] = useState<any>(null)
  const [priceData, setPriceData] = useState<any>(null)
  const [foldAngle, setFoldAngle] = useState(0) // 0 - 100
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [materialType, setMaterialType] = useState<'craft' | 'white' | 'glossy'>('craft')

  // Phase 7: Nesting State
  const [viewMode, setViewMode] = useState<'product' | 'sheet' | 'flat'>('product')

  // Auto-generate Dieline and Nesting
  useEffect(() => {
    if (specifications.width_cm && specifications.height_cm) {
      const timer = setTimeout(async () => {
        try {
          // 1. Dieline Preview
          // Use template category as style (mapped in backend or defaulted)
          const style = template.category || 'mailer_box'
          const response = await fetchDielinePreview({
            style: style,
            W: specifications.width_cm,
            L: specifications.height_cm,
            H: specifications.depth_cm || 5
          })

          if (response.ok) {
            const data = await response.json()
            setDielineData({
              path: data.svg_path,
              viewBox: data.viewbox
            })
          }

          // 2. Nesting Optimization (Phase 3)
          const nestingRes = await fetchNestingOptimization({
            style: style,
            L: specifications.height_cm,
            W: specifications.width_cm,
            H: specifications.depth_cm || 5,
            quantity: specifications.quantity,
            sheet_w: 100, // Standard Sheet
            sheet_h: 70,
            material_type: materialType
          })

          if (nestingRes.ok) {
            const nData = await nestingRes.json()
            setNestingData(nData.result)

            // 3. Pricing Calculation (Phase 3)
            // Use nesting result (sheets needed) + machine analysis logic
            const priceRes = await fetchPricingCalculation({
              style: style,
              L: specifications.height_cm,
              W: specifications.width_cm,
              H: specifications.depth_cm || 5,
              quantity: specifications.quantity
            })
            if (priceRes.ok) {
              const pData = await priceRes.json()
              setPriceData(pData.price)
            }
          }

        } catch (e) {
          console.error("Gen failed", e)
        }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [specifications.width_cm, specifications.height_cm, specifications.depth_cm])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Spetsifikatsiya & Chizma</h3>
        <p className="text-sm text-muted-foreground">
          Shablon: <span className="font-medium">{template.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kenglik (cm) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={specifications.width_cm || ''}
                onChange={(e) =>
                  onChange({ ...specifications, width_cm: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Balandlik (cm) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={specifications.height_cm || ''}
                onChange={(e) =>
                  onChange({ ...specifications, height_cm: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Chuqurlik (cm) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={specifications.depth_cm || ''}
                onChange={(e) =>
                  onChange({ ...specifications, depth_cm: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Miqdor *</label>
            <input
              type="number"
              required
              min="1"
              value={specifications.quantity || ''}
              onChange={(e) =>
                onChange({ ...specifications, quantity: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ranglar soni</label>
              <input
                type="number"
                required
                min="0"
                max="8"
                value={specifications.color_count || ''}
                onChange={(e) =>
                  onChange({ ...specifications, color_count: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Muddat</label>
              <input
                type="date"
                value={specifications.deadline}
                onChange={(e) =>
                  onChange({ ...specifications, deadline: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={specifications.has_lacquer}
                onChange={(e) =>
                  onChange({ ...specifications, has_lacquer: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Lak qo'llash</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={specifications.has_gluing}
                onChange={(e) =>
                  onChange({ ...specifications, has_gluing: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Yelimlash</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Izohlar</label>
            <textarea
              value={specifications.notes}
              onChange={(e) =>
                onChange({ ...specifications, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Qo'shimcha ma'lumot..."
            />
          </div>
        </div>

        {/* Right Column: Visual Preview */}
        <div className="h-[350px] lg:h-auto lg:pl-4 lg:border-l pl-0 border-l-0 mt-6 lg:mt-0 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Smart Preview
            </h4>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('product')}
                className={`px-3 py-1 text-xs rounded-md transition ${viewMode === 'product' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
              >
                3D View
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`px-3 py-1 text-xs rounded-md transition ${viewMode === 'flat' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
              >
                Flat (2D)
              </button>
              <button
                onClick={() => setViewMode('sheet')}
                className={`px-3 py-1 text-xs rounded-md transition ${viewMode === 'sheet' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
              >
                Layout
              </button>
            </div>
          </div>

          {viewMode === 'product' ? (
            <ThreeDViewer
              foldAngle={foldAngle}
              logoUrl={logoUrl}
              materialType={materialType}
              dimensions={{
                L: specifications.height_cm || 20,
                W: specifications.width_cm || 15,
                H: specifications.depth_cm || 5
              }}
              sides={specifications.sides || 4}
              lidType={specifications.lid_type || 'hinged'}
              handleType={specifications.handle_type || 'none'}
            />
          ) : (
            <VisualCanvas
              widthCm={specifications.width_cm || 0}
              heightCm={specifications.height_cm || 0}
              // Phase 5 props
              svgPath={dielineData?.path}
              svgViewBox={dielineData?.viewBox}
              // Phase 7 props: Only pass nestingData if we are in 'sheet' mode
              nestingData={viewMode === 'sheet' ? nestingData : null}
            />

          )}

          {viewMode === 'product' && (
            <>
              {/* SHAPE & LID CONTROLS */}
              <div className="mt-3 grid grid-cols-2 gap-2 px-2">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Shakl</label>
                  <select
                    value={specifications.sides || 4}
                    onChange={(e) => onChange({ ...specifications, sides: parseInt(e.target.value) })}
                    className="w-full text-xs p-1 border rounded bg-white text-slate-900"
                  >
                    <option value={4}>To'rtburchak</option>
                    <option value={6}>Oltiburchak</option>
                    <option value={8}>Sakkizburchak</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Qopqoq</label>
                  <select
                    value={specifications.lid_type || 'hinged'}
                    onChange={(e) => onChange({ ...specifications, lid_type: e.target.value })}
                    className="w-full text-xs p-1 border rounded bg-white text-slate-900"
                  >
                    <option value="hinged">Yopishadigan</option>
                    <option value="separate">Alohida</option>
                    <option value="flat">Tekis</option>
                  </select>
                </div>
              </div>

              <div className="mt-2 px-2">
                <label className="text-xs text-slate-500 font-medium block mb-1">Tutqich (Ruchka)</label>
                <select
                  value={specifications.handle_type || 'none'}
                  onChange={(e) => onChange({ ...specifications, handle_type: e.target.value })}
                  className="w-full text-xs p-1 border rounded bg-white text-slate-900"
                >
                  <option value="none">Yo'q</option>
                  <option value="rope">Arqon</option>
                  <option value="ribbon">Lenta</option>
                </select>
              </div>

              <div className="mt-3 px-2">
                <label className="text-xs text-slate-500 font-medium">Qadoqni Ochish / Yopish ({(foldAngle / 100).toFixed(2)})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={foldAngle}
                  onChange={(e) => setFoldAngle(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1 accent-primary"
                />
              </div>

              <div className="mt-3 px-2">
                <label className="text-xs text-slate-500 font-medium block mb-1">Logotip Yuklash (Qopqoq uchun)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const url = URL.createObjectURL(e.target.files[0])
                      setLogoUrl(url)
                    }
                  }}
                  className="block w-full text-xs text-slate-500
                        file:mr-2 file:py-1 file:px-2
                        file:rounded-md file:border-0
                        file:text-xs file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                    "
                />
              </div>

              <div className="mt-3 px-2">
                <label className="text-xs text-slate-500 font-medium block mb-1">Material Fakturasi</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMaterialType('craft')}
                    className={`flex-1 py-1 text-xs rounded border ${materialType === 'craft' ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-slate-200 text-slate-700'} `}
                  >
                    Craft
                  </button>
                  <button
                    onClick={() => setMaterialType('white')}
                    className={`flex-1 py-1 text-xs rounded border ${materialType === 'white' ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-700'} `}
                  >
                    Oq
                  </button>
                  <button
                    onClick={() => setMaterialType('glossy')}
                    className={`flex-1 py-1 text-xs rounded border ${materialType === 'glossy' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-slate-200 text-slate-700'} `}
                  >
                    Yaltiroq
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500 font-mono flex justify-between">
            <span>DXF/SVG Export mavjud</span>
            {nestingData && (
              <span className="font-bold text-blue-600">
                {nestingData.total_items} items/sheet •
                {nestingData.sheets_needed} sheets
              </span>
            )}
          </div>

          {nestingData?.inventory_analysis && (
            <div className={`mt-2 p-3 rounded text-sm font-semibold flex items-center gap-2 border ${nestingData.inventory_analysis.is_low_stock
              ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
              : 'bg-green-50 border-green-200 text-green-700'
              }`}>
              {nestingData.inventory_analysis.is_low_stock ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <div className="flex-1">
                <div className="flex justify-between">
                  <span>{nestingData.inventory_analysis.message}</span>
                  {nestingData.inventory_analysis.is_low_stock && (
                    <span className="text-xs font-normal opacity-80">
                      (Mavjud: {nestingData.inventory_analysis.available_quantity}, Kerak: {nestingData.inventory_analysis.required_quantity})
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {nestingData?.machine_analysis && (
            <div className="mt-2 text-xs text-slate-600 font-mono space-y-2">
              <div className="p-3 bg-blue-50 rounded">
                <div className="flex justify-between font-bold text-blue-800 border-b border-blue-200 pb-1 mb-1">
                  <span>Est. Machine Time</span>
                  <span>{nestingData.machine_analysis.total_minutes || nestingData.machine_analysis.total_time_min} min</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <span>Setup: {nestingData.machine_analysis.setup_min}m</span>
                  <span>Load: {nestingData.machine_analysis.loading_min}m</span>
                  <span>Cut: {nestingData.machine_analysis.cutting_min}m</span>
                  <span>Crease: {nestingData.machine_analysis.creasing_min}m</span>
                </div>
              </div>

              {nestingData.predicted_deadline && (
                <div className="p-3 bg-indigo-50 rounded border border-indigo-100 animate-in fade-in zoom-in duration-500">
                  <div className="flex flex-col">
                    <span className="text-indigo-600 font-semibold mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Tahminiy Bitish Vaqti:
                    </span>
                    <span className="text-lg font-bold text-indigo-900">
                      {new Date(nestingData.predicted_deadline).toLocaleString('uz-UZ', {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <span className="text-[10px] text-indigo-400 mt-1">
                      * Navbat va stanok yuklamasiga qarab hisoblandi
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {priceData && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-bold text-gray-800 mb-2">Pricing Breakdown (v4.2)</h4>
              <div className="bg-emerald-50 p-3 rounded border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-600">Base Price (Total)</span>
                  <span className="text-lg font-bold text-emerald-700">{(priceData.total_price).toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-emerald-200 pt-2">
                  <span>Unit Price</span>
                  <span className="font-semibold">{(priceData.price_per_unit).toLocaleString()} so'm / dona</span>
                </div>

                <div className="mt-3 text-[10px] text-gray-400 font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Material Cost ({priceData.breakdown.sheets_used} sheets)</span>
                    <span>{(priceData.breakdown.material_cost).toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Production ({priceData.breakdown.machine_hours} hrs)</span>
                    <span>{(priceData.breakdown.production_cost).toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margin ({priceData.breakdown.margin_percent}%)</span>
                    <span>Included</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PDF Quote Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                if (!priceData) return;

                const date = new Date().toLocaleDateString('uz-UZ');
                const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('uz-UZ');

                // Simple HTML generation for the Offer
                const htmlContent = `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>Tijorat Taklifi</title>
                                <style>
                                    body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                                    .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
                                    .meta { text-align: right; font-size: 14px; color: #666; }
                                    .title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1px; }
                                    .grid { display: flex; gap: 40px; margin-bottom: 30px; }
                                    .col { flex: 1; }
                                    .label { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 5px; }
                                    .value { font-size: 16px; font-weight: 500; margin-bottom: 15px; }
                                    .price-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px; }
                                    .price-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
                                    .total-row { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #cbd5e1; font-weight: bold; font-size: 18px; color: #1e40af; }
                                    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
                                    .specs-table { width: 100%; border-collapse: collapse; }
                                    .specs-table td { padding: 8px 0; border-bottom: 1px solid #eee; }
                                    .specs-table td:first-child { color: #666; width: 40%; }
                                </style>
                            </head>
                            <body>
                                <div class="header">
                                    <div class="logo">Art Pack</div>
                                    <div class="meta">
                                        Sana: ${date}<br>
                                        Amal qiladi: ${validUntil} gacha
                                    </div>
                                </div>
                                
                                <div class="title">TIJORAT TAKLIFI</div>
                                
                                <div class="grid">
                                    <div class="col">
                                        <div class="label">Mahsulot</div>
                                        <div class="value">${template.name}</div>
                                        
                                        <div class="label">O'lchamlari</div>
                                        <div class="value">${specifications.width_cm} x ${specifications.height_cm} x ${specifications.depth_cm} sm</div>
                                        
                                        <img src="https://placehold.co/400x300/f1f5f9/3b82f6?text=3D+Model" style="width: 100%; border-radius: 8px; margin-top: 10px;">
                                    </div>
                                    <div class="col">
                                        <div class="label">Texnik Xususiyatlar</div>
                                        <table class="specs-table">
                                            <tr><td>Material</td><td>${materialType === 'craft' ? 'Kraft Karton' : materialType === 'white' ? 'Oq Karton' : 'Yaltiroq'}</td></tr>
                                            <tr><td>Pechat</td><td>Full Color (CMYK)</td></tr>
                                            <tr><td>Laminatsiya</td><td>Matte / Glossy</td></tr>
                                            <tr><td>Adad (Tiraj)</td><td>${specifications.quantity || 1000} dona</td></tr>
                                        </table>
                                        
                                        <div class="price-box">
                                            <div class="price-row">
                                                <span>Dona narxi:</span>
                                                <span>${(priceData.price_per_unit).toLocaleString()} so'm</span>
                                            </div>
                                            <div class="price-row">
                                                <span>Qolip va Sozlash:</span>
                                                <span>Kiritilgan</span>
                                            </div>
                                            <div class="total-row">
                                                <span>JAMI:</span>
                                                <span>${(priceData.total_price).toLocaleString()} so'm</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="footer">
                                    Ushbu taklif 7 kun davomida o'z kuchini yo'qotmaydi.<br>
                                    Tel: +998 90 123 45 67 | Manzil: Toshkent sh, Chilonzor
                                </div>
                                
                                <script>
                                    window.onload = function() { window.print(); }
                                </script>
                            </body>
                            </html>
                        `;

                const win = window.open('', '_blank');
                win?.document.write(htmlContent);
                win?.document.close();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs rounded hover:bg-slate-700 transition"
            >
              <FileText className="w-4 h-4" />
              Download Offer (PDF)
            </button>
          </div>
        </div>
      </div>

    </div>

  )
}


function ValidationStep({
  result,
  onRetry,
}: {
  result: MaterialValidationResult
  onRetry: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {result.is_valid ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Materiallar Mavjud!
              </h3>
              <p className="text-sm text-muted-foreground">{result.message}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Materiallar Yetarli Emas
              </h3>
              <p className="text-sm text-muted-foreground">{result.message}</p>
            </div>
          </>
        )}
      </div>

      {/* Missing Materials */}
      {result.missing_materials.length > 0 && (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Yetarli Emas ({result.missing_materials.length})
          </h4>
          <div className="space-y-2">
            {result.missing_materials.map((material, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="font-medium">{material.type}</span>
                <span className="text-red-700">
                  Kerak: {material.needed.toFixed(2)} {material.unit} |
                  Mavjud: {material.available.toFixed(2)} {material.unit} |
                  Yetishmaydi: {material.shortage.toFixed(2)} {material.unit}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onRetry}
            className="mt-4 w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100"
          >
            Spetsifikatsiyani O'zgartirish
          </button>
        </div>
      )}

      {/* Available Materials */}
      {result.available_materials.length > 0 && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3">
            ✓ Mavjud Materiallar ({result.available_materials.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {result.available_materials.map((material, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{material.type}</div>
                <div className="text-green-700">
                  {material.needed.toFixed(2)} / {material.available.toFixed(2)} {material.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ConfirmationStep({
  template,
  client,
  specifications,
  validation,
}: {
  template: ProductTemplate
  client: Client
  specifications: any
  validation: MaterialValidationResult | null
}) {
  // Simple price calculation
  const calculatePrice = () => {
    const area = (specifications.width_cm * specifications.height_cm) / 10000 // m²
    const basePrice = area * specifications.quantity * 50 // 50 so'm per m²
    const colorMultiplier = 1 + (specifications.color_count * 0.1) // +10% per color
    const lacquerPrice = specifications.has_lacquer ? basePrice * 0.15 : 0
    const gluingPrice = specifications.has_gluing ? basePrice * 0.1 : 0

    const subtotal = basePrice * colorMultiplier
    const total = subtotal + lacquerPrice + gluingPrice

    return {
      basePrice,
      colorMultiplier: (colorMultiplier - 1) * 100,
      lacquerPrice,
      gluingPrice,
      subtotal,
      total
    }
  }

  const price = calculatePrice()

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-50">Buyurtmani Tasdiqlash</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">Shablon</p>
            <p className="font-semibold text-slate-50">{template.name}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Mijoz</p>
            <p className="font-semibold text-slate-50">{client.full_name}</p>
            {client.company && <p className="text-sm text-slate-300">{client.company}</p>}
          </div>

          <div>
            <p className="text-sm text-slate-400">O'lchamlar</p>
            <p className="font-semibold text-slate-50">
              {specifications.width_cm}×{specifications.height_cm} cm
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Miqdor</p>
            <p className="font-semibold text-slate-50">{specifications.quantity.toLocaleString()} dona</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">Ranglar</p>
            <p className="font-semibold text-slate-50">{specifications.color_count} rang</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Qo'shimcha</p>
            <div className="flex gap-2">
              {specifications.has_lacquer && (
                <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                  Lak
                </span>
              )}
              {specifications.has_gluing && (
                <span className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded">
                  Yelimlash
                </span>
              )}
              {!specifications.has_lacquer && !specifications.has_gluing && (
                <span className="text-sm text-slate-400">Yo'q</span>
              )}
            </div>
          </div>

          {specifications.deadline && (
            <div>
              <p className="text-sm text-slate-400">Muddat</p>
              <p className="font-semibold text-slate-50">
                {new Date(specifications.deadline).toLocaleDateString("uz-UZ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-slate-700 pt-4">
        <h4 className="font-semibold text-slate-50 mb-3">💰 Narx Hisob-kitobi</h4>
        <div className="bg-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Asosiy narx ({(specifications.width_cm * specifications.height_cm / 10000).toFixed(2)} m² × {specifications.quantity} dona):</span>
            <span className="text-slate-200">{price.basePrice.toLocaleString()} so'm</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Ranglar qo'shimcha (+{price.colorMultiplier.toFixed(0)}%):</span>
            <span className="text-slate-200">{((price.subtotal - price.basePrice)).toLocaleString()} so'm</span>
          </div>
          {specifications.has_lacquer && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Lak (+15%):</span>
              <span className="text-slate-200">{price.lacquerPrice.toLocaleString()} so'm</span>
            </div>
          )}
          {specifications.has_gluing && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Yelimlash (+10%):</span>
              <span className="text-slate-200">{price.gluingPrice.toLocaleString()} so'm</span>
            </div>
          )}
          <div className="border-t border-slate-600 pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-slate-50">JAMI:</span>
              <span className="text-green-400">{price.total.toLocaleString()} so'm</span>
            </div>
            <p className="text-xs text-slate-500 text-right mt-1">
              Bir dona: {(price.total / specifications.quantity).toLocaleString()} so'm
            </p>
          </div>
        </div>
      </div>

      {validation && (
        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Material tekshiruvi amalga oshirildi</span>
          </div>
        </div>
      )}
    </div>
  )
}
