
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, Printer, Filter, X, MoreVertical, Edit } from "lucide-react"
import { getStatusLabel, formatCurrency } from "@/lib/data/mock-data"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusPill } from "@/components/ui/status-pill"
import { Order, OrderStatus } from "@/lib/types"
import { fetchWithAuth } from "@/lib/api-client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HelpModeToggle } from "@/components/settings/HelpModeToggle"
import { HelpText, HelpBox } from "@/components/ui/help-text"

const ALL_STATUSES: (OrderStatus | "all")[] = ["all", "pending", "approved", "in_production", "ready", "delivered", "completed", "canceled"]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetchWithAuth("/api/orders/")
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      // Support paginated response
      const ordersData = data.results || data
      setOrders(ordersData)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.client?.full_name && order.client.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.box_type && order.box_type.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  })

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground font-outfit">Buyurtmalar</h1>
          <p className="text-muted-foreground mt-1 font-medium">Barchasi: {orders.length} ta buyurtma</p>
        </div>
        <div className="flex gap-3">
          <HelpModeToggle />
          <Link href="/orders/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg rounded-xl h-11 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4 mr-2" />
              Yangi Buyurtma
            </Button>
          </Link>
        </div>
      </div>

      <HelpBox variant="blue" title="📋 Buyurtmalar sahifasi">
        Bu yerda barcha buyurtmalarni ko'rasiz. Qidirish va filtrlar yordamida kerakli buyurtmani toping. Har bir buyurtma ustiga bosib, batafsil ma'lumot olishingiz mumkin.
      </HelpBox>

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish... (ID, Mijoz, Mahsulot)"
            className="pl-10 h-10 bg-card border-border rounded-xl focus:ring-primary/20 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <HelpText>🔍 Buyurtma ID, mijoz nomi yoki mahsulot turi bo'yicha qidiring</HelpText>
        </div>

        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar mask-gradient-right">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border
                ${statusFilter === s
                  ? "bg-foreground text-background border-foreground shadow-md scale-105"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                }
              `}
            >
              {s === "all" ? "Barchasi" : getStatusLabel(s)}
            </button>
          ))}
        </div>
        <HelpText>🏷️ Status bo'yicha filtrlang. <strong>Barchasi</strong> - barcha buyurtmalar ko'rinadi</HelpText>
      </div>

      <HelpBox variant="amber" title="⚡ Statuslar ma'nosi">
        <strong>Kutilmoqda</strong> - yangi, tasdiqlanmagan | <strong>Tasdiqlangan</strong> - ishga tayyor | <strong>Ishlab chiqarilmoqda</strong> - hozir ishda | <strong>Tayyor</strong> - tugallangan | <strong>Yetkazildi</strong> - mijozga topshirildi | <strong>Bekor qilindi</strong> - rad etilgan
      </HelpBox>

      {/* High Density Table */}
      <Card className="border shadow-none bg-card rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b-border">
                  <TableHead className="w-[80px] font-bold text-muted-foreground text-[10px] uppercase tracking-wider py-3">ID</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider py-3">Mijoz</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider py-3">Mahsulot</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider py-3 text-right">Miqdor</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider py-3 text-right">Summa</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider py-3 text-center">Muddat</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider py-3 text-center">Holat</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider py-3 text-right w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Yuklanmoqda...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20 text-muted-foreground">
                      <p className="font-bold">Buyurtmalar topilmadi</p>
                      <p className="text-xs opacity-70">Qidiruv so'zini o'zgartirib ko'ring yoki yangi buyurtma qo'shing</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="group hover:bg-muted/40 transition-colors border-b-border/50 text-sm">
                      <TableCell className="py-2.5 font-mono font-bold text-xs text-foreground/70">
                        #{order.order_number?.split('-').pop()}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="font-bold text-foreground text-xs leading-tight">{order.client?.full_name}</div>
                        {order.client?.company && (
                          <div className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">{order.client.company}</div>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="font-medium text-xs text-foreground/90">{order.box_type}</div>
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-mono text-xs text-muted-foreground">
                        {order.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-mono font-bold text-xs text-foreground">
                        {formatCurrency(order.total_price || 0)}
                      </TableCell>
                      <TableCell className="py-2.5 text-center text-[10px] font-bold text-muted-foreground">
                        {order.deadline ? new Date(order.deadline).toLocaleDateString("uz-UZ") : "-"}
                      </TableCell>
                      <TableCell className="py-2.5 text-center">
                        <StatusPill status={order.status} className="shadow-sm" />
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-background">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-border bg-popover shadow-xl">
                              <Link href={`/orders/${order.id}`}>
                                <DropdownMenuItem className="gap-2 cursor-pointer font-medium text-xs">
                                  <Eye className="h-3.5 w-3.5" /> Ochish (Ko'rish)
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/orders/${order.id}/edit`}>
                                <DropdownMenuItem className="gap-2 cursor-pointer font-medium text-xs">
                                  <Edit className="h-3.5 w-3.5" /> Tahrirlash
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/orders/${order.id}/print`}>
                                <DropdownMenuItem className="gap-2 cursor-pointer font-medium text-xs">
                                  <Printer className="h-3.5 w-3.5" /> Chop etish
                                </DropdownMenuItem>
                              </Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Placeholder (if needed in future) */}
      <div className="flex justify-center pt-4">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Jami: {filteredOrders.length} natija</p>
      </div>
    </div>
  )
}
