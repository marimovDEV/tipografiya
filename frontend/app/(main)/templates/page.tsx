"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Edit, Trash2, Copy, Eye } from "lucide-react"
import { getProductTemplates, createProductTemplate, updateProductTemplate, deleteProductTemplate } from "@/lib/api/printery"
import type { ProductTemplate, ProductCategory } from "@/lib/types"

const CATEGORY_LABELS: Record<ProductCategory, string> = {
    medicine_box_1layer: "Dori qutilari (1 qatlam)",
    pizza_box: "Pizza qutilari",
    box_2layer: "2 qatlamli karobka",
    box_3layer: "3 qatlamli karobka",
    cookie_box: "Pecheniye karobkalari",
    gift_bag: "Sovg'a sumkalari",
    food_box: "Oziqa karobkalari",
    custom: "Maxsus",
}

export default function ProductTemplatesPage() {
    const [templates, setTemplates] = useState<ProductTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterCategory, setFilterCategory] = useState<string>("")
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<ProductTemplate | null>(null)

    useEffect(() => {
        loadTemplates()
    }, [filterCategory])

    async function loadTemplates() {
        try {
            setLoading(true)
            const params: any = {}
            if (filterCategory) params.category = filterCategory

            const response = await getProductTemplates(params)
            console.log('Templates response:', response)

            // Handle both array and {results: []} response formats
            const templatesArray = Array.isArray(response) ? response : (response.results || [])
            setTemplates(templatesArray)
            console.log('Loaded templates:', templatesArray.length)
        } catch (error) {
            console.error("Failed to load templates:", error)
            setTemplates([])
        } finally {
            setLoading(false)
        }
    }

    const filteredTemplates = (templates || []).filter((template) => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
        // The filterCategory is already applied in loadTemplates, so this client-side filter is redundant if server-side is active.
        // However, if the intent is to filter *additionally* client-side, or if filterCategory is not always passed to API:
        // const matchesCategory = filterCategory === "" || template.category === filterCategory
        return matchesSearch // && matchesCategory
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Mahsulot Shablonlari</h1>
                    <p className="text-muted-foreground mt-1">
                        Turli xil mahsulot turlarini boshqarish va sozlash
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Yangi Shablon
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Shablon nomi bo'yicha qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">Barcha kategoriyalar</option>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Shablonlar topilmadi</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 text-primary hover:underline"
                    >
                        Birinchi shablonni yarating
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onEdit={() => setEditingTemplate(template)}
                            onDelete={async () => {
                                if (confirm("Haqiqatan ham bu shablonni o'chirib tashlamoqchimisiz?")) {
                                    try {
                                        setLoading(true)
                                        await deleteProductTemplate(template.id)
                                        await loadTemplates()
                                    } catch (error) {
                                        console.error("Failed to delete template", error)
                                        alert("O'chirishda xatolik yuz berdi")
                                        setLoading(false)
                                    }
                                }
                            }}
                            onRefresh={loadTemplates}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingTemplate) && (
                <TemplateFormModal
                    template={editingTemplate}
                    onClose={() => {
                        setShowCreateModal(false)
                        setEditingTemplate(null)
                    }}
                    onSave={() => {
                        loadTemplates()
                        setShowCreateModal(false)
                        setEditingTemplate(null)
                    }}
                />
            )}
        </div>
    )
}

function TemplateCard({
    template,
    onEdit,
    onDelete,
    onRefresh,
}: {
    template: ProductTemplate
    onEdit: () => void
    onDelete: () => void
    onRefresh: () => void
}) {
    return (
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card relative group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-card-foreground">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {CATEGORY_LABELS[template.category] || template.category}
                    </p>
                </div>
                <span
                    className={`px-2 py-1 text-xs rounded-full ${template.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                >
                    {template.is_active ? "Aktiv" : "Nofaol"}
                </span>
            </div>

            {template.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                    <span className="text-muted-foreground">Qatlamlar:</span>
                    <p className="font-medium">{template.layer_count}</p>
                </div>
                <div>
                    <span className="text-muted-foreground">Chiqindi %:</span>
                    <p className="font-medium">{template.default_waste_percent}%</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-accent transition-colors text-sm"
                >
                    <Edit className="w-4 h-4" />
                    Tahrirlash
                </button>
                <button
                    onClick={onDelete}
                    className="px-3 py-2 border rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                    title="O'chirish"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

function TemplateFormModal({
    template,
    onClose,
    onSave,
}: {
    template: ProductTemplate | null
    onClose: () => void
    onSave: () => void
}) {
    const [formData, setFormData] = useState({
        name: template?.name || "",
        category: template?.category || "custom",
        layer_count: template?.layer_count || 1,
        default_waste_percent: template?.default_waste_percent || 5,
        description: template?.description || "",
        default_width: template?.default_width || 0,
        default_height: template?.default_height || 0,
        default_depth: template?.default_depth || 0,
        is_active: template?.is_active ?? true,
    })
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        try {
            setSaving(true)
            if (template) {
                await updateProductTemplate(template.id, formData)
            } else {
                await createProductTemplate(formData)
            }
            onSave()
        } catch (error) {
            console.error("Failed to save template:", error)
            alert("Xatolik yuz berdi")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4">
                    <h2 className="text-xl font-bold text-slate-50">
                        {template ? "Shablonni Tahrirlash" : "Yangi Shablon"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-200">
                            Shablon nomi *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Masalan: Dori qutisi standart"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-200">
                            Kategoriya *
                        </label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                <option key={value} value={value} className="bg-slate-800">
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Layer Count & Waste */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-200">
                                Qatlamlar soni *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="5"
                                value={formData.layer_count}
                                onChange={(e) => setFormData({ ...formData, layer_count: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-200">
                                Chiqindi % *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.default_waste_percent}
                                onChange={(e) => setFormData({ ...formData, default_waste_percent: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Default Dimensions */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Kenglik (cm)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.default_width}
                                onChange={(e) => setFormData({ ...formData, default_width: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Balandlik (cm)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.default_height}
                                onChange={(e) => setFormData({ ...formData, default_height: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Chuqurlik (cm)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.default_depth}
                                onChange={(e) => setFormData({ ...formData, default_depth: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-200">
                            Tavsif
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Qo'shimcha ma'lumot..."
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium">
                            Aktiv
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-600 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? "Saqlanmoqda..." : "Saqlash"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
