"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HelpText } from "@/components/ui/help-text"
import { DEFAULT_SETTINGS } from "@/lib/default-settings"
import { RotateCcw } from "lucide-react"

interface MaterialPricesTabProps {
    settings: any
    setSettings: (settings: any) => void
}

export function MaterialPricesTab({ settings, setSettings }: MaterialPricesTabProps) {
    const handleReset = () => {
        setSettings({
            ...settings,
            paper_price_per_kg: DEFAULT_SETTINGS.paper_price_per_kg,
            ink_price_per_kg: DEFAULT_SETTINGS.ink_price_per_kg,
            lacquer_price_per_kg: DEFAULT_SETTINGS.lacquer_price_per_kg,
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">📦 Xomashyo Narxlari</h3>
                    <p className="text-sm text-muted-foreground">
                        Kalkulyatsiya uchun asosiy material narxlari
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Standart qiymatlarga qaytarish
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Material Narxlari (so'm)</CardTitle>
                    <CardDescription>Har bir material uchun 1 kg narxi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Paper */}
                        <div className="space-y-2">
                            <Label htmlFor="paper" className="flex items-center gap-2">
                                📄 Qog'oz
                            </Label>
                            <div className="relative">
                                <Input
                                    id="paper"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={settings.paper_price_per_kg || DEFAULT_SETTINGS.paper_price_per_kg}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            paper_price_per_kg: parseFloat(e.target.value),
                                        })
                                    }
                                    className="pr-20"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    so'm/kg
                                </span>
                            </div>
                            <HelpText>
                                💡 <strong>Misol:</strong> 1 kg qog'oz 15,000 so'm bo'lsa, shuni
                                kiriting. Tizim kutidan necha kg qog'oz kerakligini hisoblab, umumiy
                                narxni chiqaradi.
                            </HelpText>
                        </div>

                        {/* Ink */}
                        <div className="space-y-2">
                            <Label htmlFor="ink" className="flex items-center gap-2">
                                🎨 Bo&apos;yoq
                            </Label>
                            <div className="relative">
                                <Input
                                    id="ink"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={settings.ink_price_per_kg || DEFAULT_SETTINGS.ink_price_per_kg}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            ink_price_per_kg: parseFloat(e.target.value),
                                        })
                                    }
                                    className="pr-20"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    so'm/kg
                                </span>
                            </div>
                            <HelpText>
                                💡 <strong>Misol:</strong> 1 kg bo'yoq 120,000 so'm. Ranglar soni
                                ko'paysa, bo'yoq sarfi ham ko'payadi.
                            </HelpText>
                        </div>

                        {/* Lacquer */}
                        <div className="space-y-2">
                            <Label htmlFor="lacquer" className="flex items-center gap-2">
                                ✨ Lak
                            </Label>
                            <div className="relative">
                                <Input
                                    id="lacquer"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={settings.lacquer_price_per_kg || DEFAULT_SETTINGS.lacquer_price_per_kg}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            lacquer_price_per_kg: parseFloat(e.target.value),
                                        })
                                    }
                                    className="pr-20"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    so'm/kg
                                </span>
                            </div>
                            <HelpText>
                                💡 <strong>Qachon ishlatiladi?</strong> Mijoz lakli quti buyurtma
                                qilganda. Lak mahsulotga jimirlik beradi.
                            </HelpText>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                            💰 Tannarx = (Qog'oz + Bo'yoq + Lak) narxlari × Kerakli miqdor
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                            Bu narxlar asosida har bir buyurtmaga qancha xomashyo ketishini va
                            tannarxni avtomatik hisoblaymiz.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
