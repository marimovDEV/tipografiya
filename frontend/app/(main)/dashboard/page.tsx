"use client"

import { useState, useEffect } from "react"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { Sparkline } from "@/components/ui/sparkline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchWithAuth } from "@/lib/api-client"
import { useRole } from "@/lib/context/role-context"
import {
  Factory, AlertCircle, ShoppingCart, TrendingUp, Users,
  ArrowRight, DollarSign, Package, CheckCircle, Clock
} from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { StatusPill } from "@/components/ui/status-pill"
import { HelpModeToggle } from "@/components/settings/HelpModeToggle"
import { HelpText, HelpBox } from "@/components/ui/help-text"

export default function DashboardPage() {
  const { currentRole } = useRole()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetchWithAuth("/api/dashboard/")
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-20 text-center text-slate-400 font-bold">Yuklanmoqda...</div>
  if (!data) return null

  const { stats, production_stages, alerts, active_workers, chart_data } = data
  const isAdmin = currentRole === 'admin'

  // Mock trend data for sparklines (in real app, fetch this)
  const trends = {
    revenue: [40, 30, 45, 50, 65, 60, 70, 85, 90, 100],
    orders: [10, 15, 12, 18, 20, 25, 22, 30, 28, 35],
    production: [80, 70, 90, 85, 60, 75, 80, 95, 100, 98],
    delayed: [5, 4, 6, 2, 8, 4, 3, 2, 1, 0]
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground font-outfit">Boshqaruv Markazi</h1>
          <p className="text-muted-foreground mt-2 font-medium italic">Bugungi ko'rsatkichlar va tezkor tahlil</p>
        </div>
        <div className="flex gap-3">
          <HelpModeToggle />
          <Link href="/orders/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 px-6 font-bold shadow-lg transition-transform hover:scale-[1.02]">
              + YANGI BUYURTMA
            </Button>
          </Link>
        </div>
      </div>

      <HelpBox variant="blue" title="📊 Dashboard nima?">
        Bu yerda biznesingiz holati bir qarashda ko'rinadi. Bugungi buyurtmalar, faol ishlar, kechikkanlar va moliyaviy ko'rsatkichlarni real vaqtda kuzatasiz.
      </HelpBox>

      <BentoGrid>
        {/* KPI 1: Today's Orders */}
        <BentoGridItem
          className="md:col-span-1 border-l-4 border-l-blue-500"
          header={<div className="flex justify-between items-start">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400"><ShoppingCart size={24} /></div>
            <StatusPill status="approved" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none">Bugun</StatusPill>
          </div>}
          title={<span className="text-4xl font-black text-foreground">{stats.today_orders}</span>}
          description={
            <div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-4">Yangi Buyurtmalar</p>
              <Sparkline data={trends.orders} color="#3b82f6" height={40} className="w-full" />
              <HelpText>📈 Grafik oxirgi kunlar dinamikasini ko'rsatadi</HelpText>
            </div>
          }
        />

        {/* KPI 2: Active Production */}
        <BentoGridItem
          className="md:col-span-1 border-l-4 border-l-orange-500"
          header={<div className="flex justify-between items-start">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-600 dark:text-orange-400"><Factory size={24} /></div>
            <StatusPill status="in_production" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-none">Faol</StatusPill>
          </div>}
          title={<span className="text-4xl font-black text-foreground">{stats.active_orders}</span>}
          description={
            <div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-4">Ishlab chiqarishda</p>
              <Sparkline data={trends.production} color="#f97316" height={40} className="w-full" />
              <HelpText>⚙️ Hozirda ishlab chiqarilayotgan buyurtmalar soni</HelpText>
            </div>
          }
        />

        {/* KPI 3: Revenue (Admin) */}
        {isAdmin && (
          <BentoGridItem
            className="md:col-span-1 border-l-4 border-l-green-500"
            header={<div className="flex justify-between items-start">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-600 dark:text-green-400"><DollarSign size={24} /></div>
              <StatusPill status="paid" className="bg-green-500/10 text-green-600 dark:text-green-400 border-none">+15%</StatusPill>
            </div>}
            title={<span className="text-3xl font-black text-foreground">{stats.today_revenue?.toLocaleString()}</span>}
            description={
              <div>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-4">Bugungi Tushum</p>
                <Sparkline data={trends.revenue} color="#22c55e" height={40} className="w-full" />
                <HelpText>💰 Bugungi to'lovlar yig'indisi (faqat admin ko'radi)</HelpText>
              </div>
            }
          />
        )}

        {/* KPI 4: Delayed */}
        <BentoGridItem
          className="md:col-span-1 border-l-4 border-l-red-500"
          header={<div className="flex justify-between items-start">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-600 dark:text-red-400"><AlertCircle size={24} /></div>
            <StatusPill status="error" className="bg-red-500/10 text-red-600 dark:text-red-400 border-none">Diqqat</StatusPill>
          </div>}
          title={<span className="text-4xl font-black text-foreground">{stats.delayed_orders_count}</span>}
          description={
            <div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-4">Kechikkanlar</p>
              <Sparkline data={trends.delayed} color="#ef4444" height={40} className="w-full" />
              <HelpText>⚠️ Muddati o'tgan buyurtmalar - tezda hal qiling!</HelpText>
            </div>
          }
        />

        {/* MIDDLE ROW: Production Status & Health Check */}

        {/* Production Status Bar Chart */}
        <BentoGridItem
          className="md:col-span-2 md:row-span-2"
          header={<div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-secondary rounded-2xl text-secondary-foreground"><Factory size={20} /></div>
            <div>
              <h3 className="font-black text-lg text-foreground">Ishlab chiqarish</h3>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Bosqichlar kesimida</p>
              <HelpText>📊 Har bosqichda nechta buyurtma borligini ko'rsatadi</HelpText>
            </div>
          </div>}
          title={null}
          description={
            <div className="space-y-6">
              {['warehouse', 'printing', 'varnishing', 'cutting', 'assembly', 'qc'].map((step) => {
                const count = production_stages[step] || 0
                const labels: Record<string, string> = {
                  warehouse: 'Ombor', printing: 'Chop etish', varnishing: 'Laklash',
                  cutting: 'Kesish', assembly: "Yig'ish", qc: 'Sifat nazorati'
                }

                const total = stats.active_orders || 1;
                const percent = (count / total) * 100;

                return (
                  <div key={step} className="group">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">{labels[step]}</span>
                      <span className="font-black text-foreground">{count}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-1000 group-hover:bg-blue-600 relative overflow-hidden"
                        style={{ width: `${Math.max(percent, count > 0 ? 5 : 0)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/10 animate-pulse w-full h-full" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          }
        />

        {/* Health Check / Alerts Sidebar */}
        <BentoGridItem
          className="md:col-span-2 md:row-span-2 bg-muted/30 border-none shadow-none"
          header={<div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-600 active:text-red-400 transition-colors"><AlertCircle size={20} /></div>
            <div>
              <h3 className="font-black text-lg text-foreground">Health Check</h3>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Tezkor choralar</p>
              <HelpText>🚨 Diqqat talab qilayotgan vazifalar ro'yxati</HelpText>
            </div>
          </div>}
          title={null}
          description={
            <div className="space-y-3 mt-4 h-full overflow-y-auto custom-scrollbar pr-2 max-h-[500px]">
              {alerts.delayed.length === 0 && alerts.due_today.length === 0 && alerts.low_stock.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-center border-2 border-dashed border-green-500/20 rounded-3xl bg-green-500/5">
                  <CheckCircle size={40} className="text-green-500 mb-2 opacity-50" />
                  <p className="text-green-600 dark:text-green-400 font-bold">Hammasi joyida!</p>
                </div>
              )}

              {alerts.delayed.map((o: any) => (
                <div key={o.id} className="p-4 bg-card rounded-2xl border-l-[6px] border-l-red-500 shadow-sm flex justify-between items-center group hover:bg-muted/50 transition-all">
                  <div>
                    <p className="font-black text-foreground">#{o.order_number}</p>
                    <p className="text-xs text-red-500 font-bold uppercase mt-1">Muddati o'tgan!</p>
                  </div>
                  <Link href={`/orders/${o.id}`}>
                    <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs font-bold border-red-500/20 text-red-500">KO'RISH</Button>
                  </Link>
                </div>
              ))}

              {alerts.due_today.map((o: any) => (
                <div key={o.id} className="p-4 bg-card rounded-2xl border-l-[6px] border-l-orange-500 shadow-sm flex justify-between items-center group hover:bg-muted/50 transition-all">
                  <div>
                    <p className="font-black text-foreground">#{o.order_number}</p>
                    <p className="text-xs text-orange-500 font-bold uppercase mt-1">Bugun topshirish</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground">{o.client__full_name}</p>
                  </div>
                </div>
              ))}

              {/* Low Stock Alerts */}
              {alerts.low_stock.map((m: any, idx: number) => (
                <div key={idx} className="p-4 bg-card rounded-2xl border-l-[6px] border-l-yellow-500 shadow-sm flex justify-between items-center group hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-600"><Package size={16} /></div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Kam qolgan</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-red-500 bg-red-500/5 border-red-500/20 font-mono">
                    {Number(m.current_stock).toFixed(1)} <span className="text-[9px] ml-0.5">{m.unit}</span>
                  </Badge>
                </div>
              ))}
            </div>
          }
        />

        {/* BOTTOM ROW: Financial Chart & Active Workers */}

        {/* Active Workers */}
        <BentoGridItem
          className="md:col-span-2"
          header={<div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400"><Users size={20} /></div>
            <div>
              <h3 className="font-black text-lg text-foreground">Faol Xodimlar</h3>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Real vaqtda</p>
            </div>
          </div>}
          title={null}
          description={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {active_workers.length > 0 ? active_workers.map((w: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl border border-border">
                  <div className="h-10 w-10 rounded-xl bg-card shadow-sm flex items-center justify-center font-black text-foreground text-xs border border-border">
                    {w.assigned_to__first_name?.[0]}{w.assigned_to__last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{w.assigned_to__first_name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {w.step} (Ord #{w.order__order_number})
                    </p>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-8 text-muted-foreground font-bold italic opacity-40">Hozirda faol ishchilar yo'q</div>
              )}
            </div>
          }
        />

        {/* Financial Chart */}
        {isAdmin && (
          <BentoGridItem
            className="md:col-span-2"
            header={<div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-600 dark:text-green-400"><TrendingUp size={20} /></div>
              <div>
                <h3 className="font-black text-lg text-foreground">Moliya</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">6 Oylik Dinamika</p>
              </div>
            </div>}
            title={null}
            description={
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart_data.labels.map((l: string, i: number) => ({
                    name: l,
                    income: chart_data.income[i],
                    expense: chart_data.expense[i]
                  }))}>
                    <Tooltip
                      cursor={{ fill: 'var(--muted)' }}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        color: 'var(--foreground)'
                      }}
                    />
                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
          />
        )}
      </BentoGrid>
    </div>
  )
}
