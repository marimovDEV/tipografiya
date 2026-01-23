"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HelpText } from "@/components/ui/help-text"
import { DEFAULT_SETTINGS } from "@/lib/default-settings"
import { RotateCcw } from "lucide-react"

interface ProfitMarginsTabProps {
    settings: any
    setSettings: (settings: any) => void
}

export function ProfitMarginsTab({ settings, setSettings }: ProfitMarginsTabProps) {
    const pricingProfiles = settings.pricing_profiles || DEFAULT_SETTINGS.pricing_profiles

    const handleProfileChange = (profile: string, value: number) => {
        const newProfiles = { ...pricingProfiles, [profile]: value }
        setSettings({ ...settings, pricing_profiles: newProfiles })
    }

    const handleReset = () => {
        setSettings({
            ...settings,
            pricing_profiles: DEFAULT_SETTINGS.pricing_profiles,
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">💎 Narx Profillari</h3>
                    <p className="text-sm text-muted-foreground">
                        Turli mijozlar uchun foyda foizlari
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Standart qiymatlarga qaytarish
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Foyda Foizlari Mijoz Turlari Bo'yicha</CardTitle>
                    <CardDescription>
                        Mijoz turiga qarab avtomatik foyda foizi qo'llanadi
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* VIP */}
                        <div className="space-y-2">
                            <Label htmlFor="vip" className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded font-semibold">
                                    VIP
                                </span>
                                Foyda
                            </Label>
                            <div className="relative">
                                <Input
                                    id="vip"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={pricingProfiles.VIP || DEFAULT_SETTINGS.pricing_profiles.VIP}
                                    onChange={(e) => handleProfileChange("VIP", parseFloat(e.target.value))}
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    %
                                </span>
                            </div>
                            <HelpText>
                                👑 <strong>VIP mijozlar:</strong> Katta hajmda buyurtma beradi, kam
                                foyda bilan ishlaysiz.
                                <br />
                                💡 <strong>Misol:</strong> Tannarx 100,000 so'm bo'lsa, 15% = 115,000
                                so'm sotuv narxi.
                                <br />
                                📊 <strong>Maslahat:</strong> 10-20% oralig'ida qo'ying.
                            </HelpText>
                        </div>

                        {/* Standard */}
                        <div className="space-y-2">
                            <Label htmlFor="standard" className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded font-semibold">
                                    Standart
                                </span>
                                Foyda
                            </Label>
                            <div className="relative">
                                <Input
                                    id="standard"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={
                                        pricingProfiles.Standard || DEFAULT_SETTINGS.pricing_profiles.Standard
                                    }
                                    onChange={(e) => handleProfileChange("Standard", parseFloat(e.target.value))}
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    %
                                </span>
                            </div>
                            <HelpText>
                                👥 <strong>Oddiy mijozlar:</strong> O'rtacha hajmda buyurtma, o'rtacha
                                foyda.
                                <br />
                                💡 <strong>Misol:</strong> Tannarx 100,000 so'm bo'lsa, 20% = 120,000
                                so'm.
                                <br />
                                📊 <strong>Maslahat:</strong> 15-25% optimal.
                            </HelpText>
                        </div>

                        {/* Wholesale */}
                        <div className="space-y-2">
                            <Label htmlFor="wholesale" className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded font-semibold">
                                    Ulgurji
                                </span>
                                Foyda
                            </Label>
                            <div className="relative">
                                <Input
                                    id="wholesale"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={
                                        pricingProfiles.Wholesale || DEFAULT_SETTINGS.pricing_profiles.Wholesale
                                    }
                                    onChange={(e) => handleProfileChange("Wholesale", parseFloat(e.target.value))}
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    %
                                </span>
                            </div>
                            <HelpText>
                                📦 <strong>Ulgurji mijozlar:</strong> Juda katta hajm, eng kam foyda.
                                <br />
                                💡 <strong>Misol:</strong> Tannarx 100,000 so'm, 10% = 110,000 so'm.
                                <br />
                                📊 <strong>Maslahat:</strong> 8-15% yetarli.
                            </HelpText>
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
                            ✅ Sotuv narxi = Tannarx + (Tannarx × Foyda %)
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                            Mijozni tanlashda avtomatik kerakli profilni tanlab, to'g'ri narxni
                            hisoblaydi. Bu profit marginlaringizni nazoratda tutishga yordam
                            beradi.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
