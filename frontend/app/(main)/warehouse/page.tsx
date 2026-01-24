"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search, Package, History, AlertTriangle, Clock, TrendingDown,
  Shield, Ban, CheckCircle, XCircle, Lock, Unlock, Eye
} from "lucide-react"
import { Material, WarehouseLog, MaterialBatchEnhanced, WarehouseStatusReport } from "@/lib/types"
import { fetchWithAuth } from "@/lib/api-client"
import {
  getWarehouseStatusReport,
  getExpiringBatches,
  getLowStockAlerts,
  blockMaterialBatch,
  unblockMaterialBatch
} from "@/lib/api/printery"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/data/mock-data"
import { HelpModeToggle } from "@/components/settings/HelpModeToggle"
import { HelpText, HelpBox } from "@/components/ui/help-text"
import { MaterialReceiptDialog } from "@/components/warehouse/material-receipt-dialog"
import { NewMaterialDialog } from "@/components/warehouse/new-material-dialog"
import { PlusCircle, Plus } from "lucide-react"

export default function EnhancedWarehousePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [inventory, setInventory] = useState<Material[]>([])
  const [logs, setLogs] = useState<WarehouseLog[]>([])
  const [statusReport, setStatusReport] = useState<WarehouseStatusReport | null>(null)
  const [expiringBatches, setExpiringBatches] = useState<MaterialBatchEnhanced[]>([])
  const [lowStockMaterials, setLowStockMaterials] = useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = useState<MaterialBatchEnhanced | null>(null)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [blockReason, setBlockReason] = useState("")
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [newMaterialDialogOpen, setNewMaterialDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    setLoading(true)
    try {
      await Promise.all([
        loadInventory(),
        loadLogs(),
        loadStatusReport(),
        loadExpiringBatches(),
        loadLowStockAlerts()
      ])
    } finally {
      setLoading(false)
    }
  }

  async function loadInventory() {
    const res = await fetchWithAuth("/api/inventory/")
    if (res.ok) setInventory(await res.json())
  }

  async function loadLogs() {
    const res = await fetchWithAuth("/api/warehouse-logs/")
    if (res.ok) {
      const data = await res.json()
      setLogs(data.results || data)
    }
  }

  async function loadStatusReport() {
    try {
      const report = await getWarehouseStatusReport()
      setStatusReport(report)
    } catch (error) {
      console.error("Failed to load status report:", error)
    }
  }

  async function loadExpiringBatches() {
    try {
      const response = await getExpiringBatches(30)
      setExpiringBatches(response.batches)
    } catch (error) {
      console.error("Failed to load expiring batches:", error)
    }
  }

  async function loadLowStockAlerts() {
    try {
      const response = await getLowStockAlerts()
      setLowStockMaterials(response.materials || [])
    } catch (error) {
      console.error("Failed to load low stock alerts:", error)
    }
  }

  async function handleBlockBatch() {
    if (!selectedBatch || !blockReason.trim()) {
      toast.error("Bloklash sababini kiriting")
      return
    }

    try {
      await blockMaterialBatch(String(selectedBatch.id), blockReason)
      toast.success("Partiya bloklandi")
      setBlockDialogOpen(false)
      setBlockReason("")
      loadAllData()
    } catch (error) {
      toast.error("Xatolik yuz berdi")
    }
  }

  async function handleUnblockBatch(batchId: string) {
    try {
      await unblockMaterialBatch(batchId)
      toast.success("Partiya blokdan chiqarildi")
      loadAllData()
    } catch (error) {
      toast.error("Xatolik yuz berdi")
    }
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sklad Boshqaruvi</h1>
          <p className="text-muted-foreground mt-1">
            Material qoldig'i, sifat nazorati va ogohlantirishlar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setNewMaterialDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi Material
          </Button>
          <Button onClick={() => setReceiptDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Material Qabul Qilish
          </Button>
          <HelpModeToggle />
        </div>
      </div>

      <HelpBox variant="amber" title="📦 Ombor nazorati">
        Material miqdorini kuzating. <strong>Qizil badge</strong> - kam qolgan, <strong>Sariq badge</strong> - muddati o'tmoqda. Partiyalarni bloklash orqali sifatsiz mol ishlatishdan saqlaning.
      </HelpBox>

      {/* Status Cards */}
      {statusReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jami Materiallar</p>
                  <p className="text-2xl font-bold">{statusReport.summary.total_materials}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kam Qolgan</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {statusReport.summary.low_stock_count}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Muddati O'tmoqda</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statusReport.summary.expiring_soon_count}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bloklangan</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statusReport.summary.blocked_count}
                  </p>
                </div>
                <Ban className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Umumiy</TabsTrigger>
          <TabsTrigger value="batches">
            Partiyalar
            {statusReport && statusReport.summary.total_batches > 0 && (
              <Badge className="ml-2" variant="secondary">
                {statusReport.summary.total_batches}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expiring">
            Muddati O'tmoqda
            {expiringBatches.length > 0 && (
              <Badge className="ml-2" variant="destructive">
                {expiringBatches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Ogohlantirishlar
            {lowStockMaterials.length > 0 && (
              <Badge className="ml-2" variant="destructive">
                {lowStockMaterials.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Tarix</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Qidirish..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <Badge
                      variant={item.current_stock < item.min_stock ? "destructive" : "secondary"}
                    >
                      {item.current_stock.toLocaleString()} {item.unit}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Narx:</span>
                      <span className="font-medium">{formatCurrency(item.price_per_unit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min. chegara:</span>
                      <span className="font-medium">{item.min_stock}</span>
                    </div>
                    {item.batches && item.batches.length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground">Partiyalar: </span>
                        <span className="font-medium">{item.batches.length} ta</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-4">
          <div className="space-y-3">
            {inventory.flatMap(material =>
              (material.batches || []).map(batch => {
                const enhancedBatch = batch as MaterialBatchEnhanced
                return (
                  <Card key={batch.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{material.name}</h4>
                            <Badge variant="outline">#{batch.batch_number}</Badge>
                            {enhancedBatch.quality_status === 'ok' && (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                OK
                              </Badge>
                            )}
                            {enhancedBatch.quality_status === 'blocked' && (
                              <Badge variant="destructive">
                                <Ban className="w-3 h-3 mr-1" />
                                Bloklangan
                              </Badge>
                            )}
                            {enhancedBatch.quality_status === 'quarantine' && (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                <Shield className="w-3 h-3 mr-1" />
                                Karantin
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Miqdor:</span>
                              <p className="font-medium">{batch.current_quantity} {material.unit}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Narx:</span>
                              <p className="font-medium">{formatCurrency(batch.cost_per_unit)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Qabul qilindi:</span>
                              <p className="font-medium">
                                {new Date(batch.received_date).toLocaleDateString("uz-UZ")}
                              </p>
                            </div>
                            {batch.expiry_date && (
                              <div>
                                <span className="text-muted-foreground">Muddati:</span>
                                <p className="font-medium">
                                  {new Date(batch.expiry_date).toLocaleDateString("uz-UZ")}
                                </p>
                              </div>
                            )}
                          </div>

                          {enhancedBatch.block_reason && (
                            <div className="mt-3 p-3 bg-red-50 rounded-lg">
                              <p className="text-sm font-medium text-red-900">
                                Bloklash sababi:
                              </p>
                              <p className="text-sm text-red-700">{enhancedBatch.block_reason}</p>
                              {enhancedBatch.blocked_at && (
                                <p className="text-xs text-red-600 mt-1">
                                  {new Date(enhancedBatch.blocked_at).toLocaleString("uz-UZ")}
                                  {enhancedBatch.blocked_by_name && ` • ${enhancedBatch.blocked_by_name}`}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {enhancedBatch.quality_status === 'blocked' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnblockBatch(batch.id as string)}
                            >
                              <Unlock className="w-4 h-4 mr-2" />
                              Blokdan Chiqarish
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedBatch(enhancedBatch)
                                setBlockDialogOpen(true)
                              }}
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              Bloklash
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        {/* Expiring Batches Tab */}
        <TabsContent value="expiring" className="space-y-4">
          {expiringBatches.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <p className="text-muted-foreground">
                  Muddati o'tadigan partiyalar yo'q
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {expiringBatches.map((batch) => {
                const daysLeft = batch.days_until_expiry || 0
                const urgencyColor = daysLeft <= 7 ? 'text-red-600' : daysLeft <= 14 ? 'text-orange-600' : 'text-yellow-600'

                return (
                  <Card key={batch.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{batch.material_name}</h4>
                            <Badge variant="outline">#{batch.batch_number}</Badge>
                            <Badge className={urgencyColor}>
                              <Clock className="w-3 h-3 mr-1" />
                              {daysLeft} kun qoldi
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Miqdor:</span>
                              <p className="font-medium">{batch.current_quantity} {batch.unit}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Muddat:</span>
                              <p className="font-medium">
                                {batch.expiry_date && new Date(batch.expiry_date).toLocaleDateString("uz-UZ")}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Yetkazuvchi:</span>
                              <p className="font-medium">{batch.supplier_name || "-"}</p>
                            </div>
                          </div>
                        </div>

                        <AlertTriangle className={`w-6 h-6 ${urgencyColor}`} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Low Stock Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {lowStockMaterials.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <p className="text-muted-foreground">
                  Barcha materiallar yetarli miqdorda
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {lowStockMaterials.map((material) => (
                <Card key={material.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{material.name}</h4>
                          <Badge variant="destructive">Kam qoldi</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Qoldi:</span>
                            <p className="font-medium text-red-600">
                              {material.current_stock} {material.unit}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Min. chegara:</span>
                            <p className="font-medium">{material.min_stock} {material.unit}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Yetishmaydi:</span>
                            <p className="font-medium text-orange-600">
                              {material.min_stock - material.current_stock} {material.unit}
                            </p>
                          </div>
                        </div>
                      </div>

                      <TrendingDown className="w-6 h-6 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-medium text-muted-foreground">Vaqt</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Material</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Turi</th>
                      <th className="p-3 text-right font-medium text-muted-foreground">Miqdor</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Izoh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/50">
                        <td className="p-3 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("uz-UZ")}
                        </td>
                        <td className="p-3 font-medium">{log.material_name}</td>
                        <td className="p-3">
                          <Badge variant={log.type === 'in' ? "default" : "destructive"}>
                            {log.type === 'in' ? 'KIRIM' : 'CHIQIM'}
                          </Badge>
                        </td>
                        <td className={`p-3 text-right font-bold ${log.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                          {log.type === 'in' ? '+' : '-'}{Number(log.change_amount).toLocaleString()}
                        </td>
                        <td className="p-3 text-muted-foreground truncate max-w-xs">
                          {log.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Block Batch Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partiyani Bloklash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBatch && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{selectedBatch.material_name}</p>
                <p className="text-xs text-muted-foreground">
                  Partiya #{selectedBatch.batch_number}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Bloklash sababi *
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Sifat muammosi, shikastlangan qadoq, va hokazo..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setBlockDialogOpen(false)
                  setBlockReason("")
                }}
              >
                Bekor qilish
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleBlockBatch}
              >
                <Lock className="w-4 h-4 mr-2" />
                Bloklash
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <MaterialReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        onSuccess={() => {
          loadAllData()
        }}
      />

      <NewMaterialDialog
        open={newMaterialDialogOpen}
        onOpenChange={setNewMaterialDialogOpen}
        onSuccess={() => {
          loadAllData()
          toast.success("Endi ushbu materialga kirim qilishingiz mumkin")
        }}
      />
    </div >
  )
}
