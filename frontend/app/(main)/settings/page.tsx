"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api-client"
import { HelpModeToggle } from "@/components/settings/HelpModeToggle"
import { MaterialPricesTab } from "@/components/settings/tabs/MaterialPricesTab"
import { WastePercentagesTab } from "@/components/settings/tabs/WastePercentagesTab"
import { PricingConfigTab } from "@/components/settings/tabs/PricingConfigTab"
import { ProfitMarginsTab } from "@/components/settings/tabs/ProfitMarginsTab"
import { CurrencyTab } from "@/components/settings/tabs/CurrencyTab"
import { DEFAULT_SETTINGS } from "@/lib/default-settings"
import { EmployeesTab } from "@/components/settings/EmployeesTab"

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [settingsRes, usersRes] = await Promise.all([
        fetchWithAuth("/api/settings/"),
        fetchWithAuth("/api/users/")
      ])

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings({ ...DEFAULT_SETTINGS, ...data })
      }

      if (usersRes.ok) {
        const userData = await usersRes.json()
        setUsers(userData)
      }
    } catch (error: any) {
      console.error("Settings error:", error)
      toast.error("Sozlamalarni yuklab bo'lmadi")
      setSettings(DEFAULT_SETTINGS)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetchWithAuth("/api/settings/", {
        method: "POST",
        body: JSON.stringify(settings),
      })

      if (!res.ok) throw new Error("Saqlashda xatolik")

      toast.success("Sozlamalar saqlandi!")
      fetchSettings() // Refresh
    } catch (error: any) {
      console.error("Save error:", error)
      toast.error("Sozlamalarni saqlab bo'lmadi")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">⚙️ Sozlamalar</h1>
          <p className="text-muted-foreground">Tizim parametrlarini boshqarish</p>
        </div>
        <div className="flex items-center gap-4">
          <HelpModeToggle />
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? "Saqlanmoqda..." : "💾 O'zgarishlarni Saqlash"}
          </Button>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="materials">📦 Xomashyo</TabsTrigger>
          <TabsTrigger value="waste">♻️ Chiqindi</TabsTrigger>
          <TabsTrigger value="pricing">💰 Narxlash</TabsTrigger>
          <TabsTrigger value="profit">💎 Foyda</TabsTrigger>
          <TabsTrigger value="currency">💱 Valyuta</TabsTrigger>
          <TabsTrigger value="employees">👥 Xodimlar</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-6">
          <MaterialPricesTab settings={settings} setSettings={setSettings} />
        </TabsContent>

        <TabsContent value="waste" className="space-y-6">
          <WastePercentagesTab settings={settings} setSettings={setSettings} />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <PricingConfigTab settings={settings} setSettings={setSettings} />
        </TabsContent>

        <TabsContent value="profit" className="space-y-6">
          <ProfitMarginsTab settings={settings} setSettings={setSettings} />
        </TabsContent>

        <TabsContent value="currency" className="space-y-6">
          <CurrencyTab settings={settings} setSettings={setSettings} />
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeesTab
            settings={settings}
            setSettings={setSettings}
            users={users}
            onSave={handleSave}
            saving={saving}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
