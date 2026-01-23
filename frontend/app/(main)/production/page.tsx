"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductionGantt } from "@/components/production/ProductionGantt"
import {
  Calendar, Clock, User, Package, Layers,
  CheckCircle2, AlertCircle, ChevronRight, Play, Check,
  Printer, ClipboardList, Info, Pause, PlayCircle, StopCircle, Timer
} from "lucide-react"
import Link from "next/link"
import { Order, ProductionStepItem, User as UserType, WorkerAction } from "@/lib/types"
import { fetchWithAuth } from "@/lib/api-client"
import { logWorkerAction, calculateWorkDuration } from "@/lib/api/printery"
import { useRole } from "@/lib/context/role-context"
import { toast } from "sonner"
import { getStatusBadgeColor, getStatusLabel } from "@/lib/data/mock-data"
import { HelpModeToggle } from "@/components/settings/HelpModeToggle"
import { HelpText, HelpBox } from "@/components/ui/help-text"

const STEP_LABELS: Record<string, string> = {
  queue: "Navbat",
  prepress: "Pre-press",
  printing: "Chop",
  drying: "Quritish",
  lamination: "Laminatsiya",
  cutting: "Kesish",
  die_cutting: "Shtans",
  gluing: "Yelim / Buklash",
  qc: "Sifat Nazorat",
  packaging: "Qadoq",
  ready: "Sklad",
  dispatch: "Yuklash",
}

const STEP_INSTRUCTIONS: Record<string, { title: string; tasks: string[]; warning?: string }> = {
  queue: {
    title: "Materiallarni tayyorlash",
    tasks: [
      "Buyurtma uchun kerakli qog'ozni ombordan oling",
      "Qog'oz o'lchamlarini tekshiring",
      "Material sifatini nazorat qiling",
      "Keyingi bosqichga uzating"
    ]
  },
  prepress: {
    title: "Pre-press (Tayyorlov)",
    tasks: [
      "Dizayn fayllarini tekshiring (CMYK, Bleed)",
      "Rang profillarini sovlashtiring",
      "Ofset qoliplarini (C, M, Y, K) tayyorlang",
      "O'lchamlarni qolip bilan solishtiring"
    ],
    warning: "⚠️ Fayllar to'g'riligiga ishonch hosil qiling!"
  },
  printing: {
    title: "Chop etish",
    tasks: [
      "Ranglarni tekshiring (CMYK parametrlari)",
      "Maket faylini yuklab oling",
      "Test chop qiling",
      "Asosiy tirajni chop eting",
      "Sifatni tekshiring"
    ],
    warning: "⚠️ Avval test nusxa chop qiling!"
  },
  drying: {
    title: "Quritish",
    tasks: [
      "Mahsulotlarni quritish joyiga qo'ying",
      "Haroratni tekshiring (20-25°C)",
      "Quritish vaqti: 2-4 soat",
      "Tayyor bo'lgach keyingi bosqichga uzating"
    ]
  },
  lamination: {
    title: "Laminatsiya / Laklash",
    tasks: [
      "Laminator haroratini sozlang",
      "Plyonka/Lak sifatini tekshiring",
      "Sinov uchun bitta listni o'tkazing",
      "Pufakchalar yo'qligini tekshiring"
    ]
  },
  cutting: {
    title: "Qog'ozni kesish",
    tasks: [
      "Qog'oz o'lchamini tekshiring (pastda ko'rsatilgan)",
      "Kesish mashinasini sozlang",
      "Qog'ozni to'g'ri kesib chiqing",
      "Kesimlarni tekshiring va sanab chiqing"
    ],
    warning: "⚠️ O'lchamlarni 2 marta tekshiring!"
  },
  die_cutting: {
    title: "Shtanslash (Die-cut)",
    tasks: [
      "Shtans qolipini o'rnating",
      "Bigo'vka (buklash) chiziqlarini tekshiring",
      "Kesish aniqligini tekshiring",
      "Chiqindilarni (oblo) tozalang"
    ]
  },
  gluing: {
    title: "Yelimlash va Buklash",
    tasks: [
      "Yelim turini tanlang",
      "Qutini yig'ish tartibini tekshiring",
      "Yelimni surtib, qutini yig'ing",
      "Yelim quriguncha kuting (5-10 daqiqa)"
    ]
  },
  qc: {
    title: "Sifat Nazorati (QC)",
    tasks: [
      "Vizual tekshiruvdan o'tkazing",
      "O'lchamlar mosligini tekshiring",
      "Ranglar to'g'riligini solishtiring",
      "Yelim mustahkamligini tekshiring"
    ],
    warning: "🛑 Sifatsiz mahsulotni o'tkazmang!"
  },
  packaging: {
    title: "Qadoqlash",
    tasks: [
      "Mahsulotlarni sanab chiqing",
      "Qutilarga joylab chiqing",
      "Etiketka yopishtiring",
      "Palletlarga taxlang"
    ]
  },
  ready: {
    title: "Topshirishga tayyor",
    tasks: [
      "Yakuniy tekshiruvni o'tkazing",
      "Hujjatlarni tayyorlang",
      "Mijozga xabar bering",
      "Omborga topshiring"
    ]
  },
  dispatch: {
    title: "Yuklash va Topshirish",
    tasks: [
      "Yuk xatini (Nakladnoy) tekshiring",
      "Transportga yuklang",
      "Mijoz imzosini oling",
      "Tizimda 'Yakunlandi' deb belgilang"
    ]
  }
}

export default function ProductionPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "late" | "ready">("all")
  const [stepDurations, setStepDurations] = useState<Record<string, any>>({})
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false)
  const [pauseReason, setPauseReason] = useState("")
  const [pausingStep, setPausingStep] = useState<ProductionStepItem | null>(null)
  const { currentRole, user } = useRole()

  useEffect(() => {
    fetchProductionOrders()
    fetchUsers()
  }, [])

  const fetchProductionOrders = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth("/api/orders/")
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      const allOrders: Order[] = data.results || data
      const productionOrders = allOrders.filter((order) =>
        ["pending", "approved", "in_production", "ready"].includes(order.status)
      )
      setOrders(productionOrders)

      // Load durations for in-progress steps
      productionOrders.forEach(order => {
        order.production_steps?.forEach(step => {
          if (step.status === 'in_progress') {
            loadStepDuration(step.id as string)
          }
        })
      })
    } catch (error) {
      console.error("Error fetching production orders:", error)
      toast.error("Buyurtmalarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth("/api/users/")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data.results || data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  async function loadStepDuration(stepId: string) {
    try {
      const duration = await calculateWorkDuration(stepId)
      setStepDurations(prev => ({ ...prev, [stepId]: duration }))
    } catch (error) {
      console.error("Failed to load duration:", error)
    }
  }

  async function handleWorkerAction(stepId: string, action: WorkerAction, notes?: string) {
    try {
      await logWorkerAction({
        production_step_id: stepId,
        action,
        pause_reason: action === 'pause' ? notes : undefined,
        notes
      })

      if (action === 'start') {
        toast.success("⏱️ Ish boshlandi", { duration: 2000 })
        // Also update step status to in_progress
        await handleUpdateStepStatus(stepId, 'in_progress', false)
      } else if (action === 'pause') {
        toast.info("⏸️ Pauza", { duration: 2000 })
      } else if (action === 'resume') {
        toast.success("▶️ Davom ettirildi", { duration: 2000 })
      } else if (action === 'finish') {
        toast.success("✅ Ish tugallandi", { duration: 2000 })
        // Also update step status to completed
        await handleUpdateStepStatus(stepId, 'completed', false)
      }

      // Reload duration
      loadStepDuration(stepId)
    } catch (error) {
      toast.error("Xatolik yuz berdi")
    }
  }

  const handleUpdateStepStatus = async (stepId: number | string, newStatus: string, showToast: boolean = true) => {
    try {
      const response = await fetchWithAuth(`/api/production/${stepId}/update_status/`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update step")

      const result = await response.json()

      if (showToast) {
        if (result.order_completed) {
          toast.success("🎉 Barcha bosqichlar tugadi! Buyurtma arxivga o'tdi.", {
            duration: 5000,
          })
        } else {
          toast.success("Bosqich holati yangilandi")
        }
      }

      fetchProductionOrders()
    } catch (error) {
      console.error("Error updating step:", error)
      if (showToast) {
        toast.error("Xatolik yuz berdi")
      }
    }
  }

  const handleAssignWorker = async (stepId: number | string, userId: string) => {
    try {
      const payload = userId === "unassigned" ? { assigned_to: null } : { assigned_to: userId }
      const response = await fetchWithAuth(`/api/production/${stepId}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to assign worker")

      toast.success("Xodim biriktirildi")
      fetchProductionOrders()
    } catch (error) {
      console.error("Error assigning worker:", error)
      toast.error("Xatolik yuz berdi")
    }
  }

  const calculateProgress = (steps: ProductionStepItem[] = []) => {
    if (steps.length === 0) return 0
    const completed = steps.filter((s) => s.status === "completed").length
    return Math.round((completed / steps.length) * 100)
  }

  const isLate = (deadline?: string) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'late') return isLate(order.deadline) && order.status !== 'ready' && order.status !== 'completed'
    if (filterStatus === 'ready') return order.status === 'ready'
    return true
  })

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}s ${mins}d`
    return `${mins}d`
  }

  if (loading) return <div className="p-8 text-center">Yuklanmoqda...</div>

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ishlab Chiqarish</h1>
          <p className="text-sm text-muted-foreground">Jarayondagi buyurtmalar</p>
        </div>
        <div className="flex gap-2">
          <HelpModeToggle />
          <Button
            variant={filterStatus === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            Barcha
          </Button>
          <Button
            variant={filterStatus === 'late' ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilterStatus('late')}
          >
            Kechikkan
          </Button>
          <Button
            variant={filterStatus === 'ready' ? "default" : "outline"}
            size="sm"
            className={filterStatus === 'ready' ? "bg-green-600 hover:bg-green-700" : ""}
            onClick={() => setFilterStatus('ready')}
          >
            Tayyor
          </Button>
        </div>
      </div>

      <HelpBox variant="blue" title="⚙️ Ishlab chiqarish oqimi">
        Har bir buyurtma bosqichma-bosqich ishlab chiqariladi: Kesish → Chop → Yelim → Quritish → Qadoq. Xodimlar o'z bosqichlarida START/FINISH tugmalari bilan vaqt hisobini oladi.
      </HelpBox>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Ro'yxat (Queue)
          </TabsTrigger>
          <TabsTrigger value="gantt" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Gantt (Schedule)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <Layers className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-muted-foreground">Ishlab chiqarishda buyurtmalar yo'q</p>
              </Card>
            ) : (
              filteredOrders.map((order) => {
                const progress = calculateProgress(order.production_steps)
                const late = isLate(order.deadline)

                return (
                  <Card key={order.id} className="overflow-hidden">
                    {/* Progress bar */}
                    <div className="h-1 bg-muted">
                      <div
                        className={`h-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <CardContent className="p-4">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono bg-slate-900 text-white px-2 py-0.5 rounded">
                              #{order.order_number?.split('-').pop()}
                            </span>
                            <h3 className="text-sm font-semibold truncate">{order.box_type}</h3>
                            <Badge className={`${getStatusBadgeColor(order.status)} text-xs`}>
                              {getStatusLabel(order.status)}
                            </Badge>
                            {late && order.status !== 'ready' && (
                              <Badge variant="destructive" className="text-xs">Kechikdi</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {order.client?.full_name} • {order.client?.company || "Shaxsiy"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-right">
                            <p className="text-muted-foreground">Muddat</p>
                            <p className={`font-semibold ${late ? 'text-red-500' : ''}`}>
                              {order.deadline ? new Date(order.deadline).toLocaleDateString("uz-UZ") : "-"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Progress</p>
                            <p className="font-bold text-blue-600">{progress}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-2 bg-muted/50 rounded text-xs mb-3">
                        <div>
                          <p className="text-muted-foreground text-[10px]">O'lcham</p>
                          <p className="font-medium truncate">
                            {order.paper_width || '-'}×{order.paper_height || '-'} sm
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px]">Miqdor</p>
                          <p className="font-medium">{order.quantity.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px]">Material</p>
                          <p className="font-medium truncate">{order.paper_type} {order.paper_density}g</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px]">Pechat</p>
                          <p className="font-medium truncate">{order.print_colors || "4+0"}</p>
                        </div>
                      </div>

                      {/* Production Steps */}
                      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
                        {order.production_steps?.map((step, idx) => {
                          const isCurrent = step.status === 'in_progress'
                          const isDone = step.status === 'completed'
                          const label = STEP_LABELS[step.step] || step.step
                          const duration = stepDurations[step.id as string]

                          return (
                            <div key={step.id} className="flex flex-col items-center min-w-[110px] gap-1">
                              <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border-2 transition-all
                            ${isDone ? 'bg-green-500 border-green-500 text-white' :
                                  isCurrent ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                                    'bg-background border-muted-foreground/20 text-muted-foreground'}`}
                              >
                                {isDone ? <Check className="h-4 w-4" /> :
                                  isCurrent ? <Play className="h-4 w-4" /> :
                                    idx + 1}
                              </div>

                              <p className={`text-[10px] font-medium ${isCurrent ? 'text-blue-600' : isDone ? '' : 'text-muted-foreground'}`}>
                                {label}
                              </p>

                              {/* Time Display */}
                              {isCurrent && duration && (
                                <div className="flex items-center gap-1 text-[9px] text-blue-600">
                                  <Timer className="w-3 h-3" />
                                  <span>{formatDuration(duration.work_duration_minutes)}</span>
                                </div>
                              )}

                              {currentRole === 'admin' ? (
                                <Select
                                  value={step.assigned_to ? String(step.assigned_to) : "unassigned"}
                                  onValueChange={(val) => handleAssignWorker(step.id, val)}
                                >
                                  <SelectTrigger className="h-6 text-[9px] w-full">
                                    <SelectValue placeholder="N/A" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">Yo'q</SelectItem>
                                    {users.map(u => (
                                      <SelectItem key={u.id} value={String(u.id)}>{u.username}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <p className="text-[9px] text-muted-foreground truncate w-full text-center">
                                  {step.assigned_to_name || "-"}
                                </p>
                              )}

                              {/* Worker Controls */}
                              {step.status !== 'completed' && (
                                currentRole === 'admin' ||
                                (String(step.assigned_to) === String(user?.id) && currentRole !== 'admin')
                              ) && (
                                  <div className="flex gap-1">
                                    {step.status === 'pending' && (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="h-6 px-2 text-[9px]"
                                        onClick={() => handleWorkerAction(step.id as string, 'start')}
                                      >
                                        <PlayCircle className="w-3 h-3 mr-1" />
                                        START
                                      </Button>
                                    )}
                                    {step.status === 'in_progress' && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-6 px-2 text-[9px]"
                                          onClick={() => {
                                            setPausingStep(step)
                                            setPauseDialogOpen(true)
                                          }}
                                        >
                                          <Pause className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="default"
                                          size="sm"
                                          className="h-6 px-2 text-[9px] bg-green-600 hover:bg-green-700"
                                          onClick={() => handleWorkerAction(step.id as string, 'finish')}
                                        >
                                          <StopCircle className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Active Task Card */}
                      {(() => {
                        const activeStep = order.production_steps?.find(s => s.status === 'in_progress')
                        if (!activeStep) return null

                        const instructions = STEP_INSTRUCTIONS[activeStep.step]
                        if (!instructions) return null

                        const duration = stepDurations[activeStep.id as string]

                        return (
                          <div className="mb-3 p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-500 rounded-lg text-white">
                                  <ClipboardList className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                                    {instructions.title}
                                  </h4>
                                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                                    Bosqich: {STEP_LABELS[activeStep.step]} • Mas'ul: {activeStep.assigned_to_name || "Belgilanmagan"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge className="bg-blue-500 text-white animate-pulse">JARAYONDA</Badge>
                                {duration && (
                                  <div className="text-sm font-bold text-blue-700">
                                    ⏱️ {formatDuration(duration.work_duration_minutes)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {instructions.warning && (
                              <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500 rounded text-xs text-yellow-700 dark:text-yellow-300 font-bold">
                                {instructions.warning}
                              </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 p-2 bg-white dark:bg-slate-800 rounded border text-xs">
                              <div>
                                <span className="text-muted-foreground block text-[10px]">O'lcham</span>
                                <span className="font-bold">{order.paper_width || '-'} × {order.paper_height || '-'} sm</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Miqdor</span>
                                <span className="font-bold">{order.quantity.toLocaleString()} dona</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Material</span>
                                <span className="font-bold">{order.paper_type} {order.paper_density}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Ranglar</span>
                                <span className="font-bold">{order.print_colors || "4+0"}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-bold text-blue-700 dark:text-blue-300">📋 Bajariladigan ishlar:</p>
                              {instructions.tasks.map((task, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                  <div className="w-5 h-5 rounded border-2 border-blue-400 flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-800">
                                    <span className="text-[10px] font-bold text-blue-600">{i + 1}</span>
                                  </div>
                                  <span className="text-slate-700 dark:text-slate-300">{task}</span>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                                onClick={() => handleWorkerAction(activeStep.id as string, 'finish')}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Vazifani Yakunlash
                              </Button>
                            </div>
                          </div>
                        )
                      })()}

                      {/* Actions Row */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          {order.production_steps?.filter(s => s.status === 'completed').length} / {order.production_steps?.length} bosqich
                        </span>
                        <div className="flex gap-2">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Profil
                            </Button>
                          </Link>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedOrder(order)}>
                                Texnik karta
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-lg">{order.box_type}</DialogTitle>
                                <p className="text-sm text-muted-foreground">#{order.order_number}</p>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs text-muted-foreground">O'lcham</p>
                                    <p className="font-medium">{order.paper_width || '-'}×{order.paper_height || '-'} sm</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Material</p>
                                    <p className="font-medium">{order.paper_type} {order.paper_density}g</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Miqdor</p>
                                    <p className="font-medium">{order.quantity.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Pechat</p>
                                    <p className="font-medium">{order.print_type || "Ofset"} • {order.print_colors}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Lak</p>
                                    <p className="font-medium">{order.lacquer_type || "Yo'q"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Mijoz</p>
                                    <p className="font-medium truncate">{order.client?.full_name}</p>
                                  </div>
                                </div>
                                {order.notes && (
                                  <div className="bg-muted p-3 rounded">
                                    <p className="text-xs text-muted-foreground mb-1">Izohlar</p>
                                    <p className="text-sm">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Pause Dialog */}
          <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pauzaga Qo'yish</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {pausingStep && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{STEP_LABELS[pausingStep.step]}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sabab (ixtiyoriy)
                  </label>
                  <textarea
                    value={pauseReason}
                    onChange={(e) => setPauseReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tushlik, material kutish, va hokazo..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setPauseDialogOpen(false)
                      setPauseReason("")
                    }}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (pausingStep) {
                        handleWorkerAction(pausingStep.id as string, 'pause', pauseReason)
                      }
                      setPauseDialogOpen(false)
                      setPauseReason("")
                    }}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pauzaga Qo'yish
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="gantt">
          <ProductionGantt orders={filteredOrders} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
