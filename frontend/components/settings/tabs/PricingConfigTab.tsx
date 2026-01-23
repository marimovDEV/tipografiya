"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HelpText } from "@/components/ui/help-text"
import { DEFAULT_SETTINGS } from "@/lib/default-settings"
import { RotateCcw } from "lucide-react"

interface PricingConfigTabProps {
    settings: any
    setSettings: (settings: any) => void
}

export function PricingConfigTab({ settings, setSettings }: PricingConfigTabProps) {
    const handleReset = () => {
        setSettings({
            ...settings,
            base_price_per_sqm: DEFAULT_SETTINGS.base_price_per_sqm,
            color_markup_percent: DEFAULT_SETTINGS.color_markup_percent,
            lacquer_markup_percent: DEFAULT_SETTINGS.lacquer_markup_percent,
            gluing_markup_percent: DEFAULT_SETTINGS.gluing_markup_percent,
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">💰 Buyurtma Narxlash</h3>
                    <p className="text-sm text-muted-foreground">
                        Buyurtmalar uchun avtomatik narx hisoblash parametrlari
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Standart qiymatlarga qaytarish
                </Button>
            </div>

            <Card className="border-blue-700 bg-blue-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Narx Hisoblash Parametrlari
                        <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">YANGI</span>
                    </CardTitle>
                    <CardDescription>Asosiy narx va qo'shimchalar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Base price */}
                        <div className="space-y-2">
                            <Label htmlFor="base-price">Asosiy narx</Label>
                            <div className="relative">
                                <Input
                                    id="base-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={settings.base_price_per_sqm || DEFAULT_SETTINGS.base_price_per_sqm}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || DEFAULT_SETTINGS.base_price_per_sqm
                                        setSettings({ ...settings, base_price_per_sqm: value })
                                        // Save to localStorage
                                        const config = {
                                            base_price_per_sqm: value,
                                            color_markup_percent: settings.color_markup_percent || DEFAULT_SETTINGS.color_markup_percent,
                                            lacquer_markup_percent: settings.lacquer_markup_percent || DEFAULT_SETTINGS.lacquer_markup_percent,
                                            gluing_markup_percent: settings.gluing_markup_percent || DEFAULT_SETTINGS.gluing_markup_percent,
                                        }
                                        localStorage.setItem("pricing_config", JSON.stringify(config))
                                    }}
                                    className="font-mono pr-20"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    so'm/m²
                                </span>
                            </div>
                            <HelpText>Buyurtma uchun asosiy narx (maydon × miqdor × bu qiymat)</HelpText>
                        </div>

                        {/* Color markup */}
                        <div className="space-y-2">
                            <Label htmlFor="color-markup">Rang qo'shimcha</Label>
                            <div className="relative">
                                <Input
                                    id="color-markup"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={settings.color_markup_percent || DEFAULT_SETTINGS.color_markup_percent}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || DEFAULT_SETTINGS.color_markup_percent
                                        setSettings({ ...settings, color_markup_percent: value })
                                        const config = {
                                            base_price_per_sqm: settings.base_price_per_sqm || DEFAULT_SETTINGS.base_price_per_sqm,
                                            color_markup_percent: value,
                                            lacquer_markup_percent: settings.lacquer_markup_percent || DEFAULT_SETTINGS.lacquer_markup_percent,
                                            gluing_markup_percent: settings.gluing_markup_percent || DEFAULT_SETTINGS.gluing_markup_percent,
                                        }
                                        localStorage.setItem("pricing_config", JSON.stringify(config))
                                    }}
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    %
                                </span>
                            </div>
                            <HelpText>Har bir rang uchun qo'shiluvchi foiz (masalan: 4 rang = +40%)</HelpText>
                        </div>

                        {/* Lacquer markup */}
                        <div className="space-y-2">
                            <Label htmlFor="lacquer-markup">Lak qo'shimcha</Label>
                            <div className="relative">
                                <Input
                                    id="lacquer-markup"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={settings.lacquer_markup_percent || DEFAULT_SETTINGS.lacquer_markup_percent}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || DEFAULT_SETTINGS.lacquer_markup_percent
                                        setSettings({ ...settings, lacquer_markup_percent: value })
                                        const config = {
                                            base_price_per_sqm: settings.base_price_per_sqm || DEFAULT_SETTINGS.base_price_per_sqm,
                                            color_markup_percent: settings.color_markup_percent || DEFAULT_SETTINGS.color_markup_percent,
                                            lacquer_markup_percent: value,
                                            gluing_markup_percent: settings.gluing_markup_percent || DEFAULT_SETTINGS.gluing_markup_percent,
                                        }
                                        localStorage.setItem("pricing_config", JSON.stringify(config))
                                    }}
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    %
                                </span>
                            </div>
                            <HelpText>Lak qo'llanganda asosiy narxga qo'shiladi</HelpText>
                        </div>

                        {/* Gluing markup */}
                        <div className="space-y-2">
                            <Label htmlFor="gluing-markup">Yelimlash qo'shimcha</Label>
                            <div className="relative">
                                <Input
                                    id="gluing-markup"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={settings.gluing_markup_percent || DEFAULT_SETTINGS.gluing_markup_percent}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || DEFAULT_SETTINGS.gluing_markup_percent
                                        setSettings({ ...settings, gluing_markup_percent: value })
                                        const config = {
                                            base_price_per_sqm: settings.base_price_per_sqm || DEFAULT_SETTINGS.base_price_per_sqm,
                                            color_markup_percent: settings.color_markup_percent || DEFAULT_SETTINGS.color_markup_percent,
                                            lacquer_markup_percent: settings.lacquer_markup_percent || DEFAULT_SETTINGS.lacquer_markup_percent,
                                            gluing_markup_percent: value,
                                        }
                                        localStorage.setItem("pricing_config", JSON.stringify(config))
                                    }}
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    %
                                </span>
                            </div>
                            <HelpText>Yelimlash jarayoni qo'shilganda</HelpText>
                        </div>
                    </div>

                    {/* Example calculation */}
                    <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                        <p className="text-sm font-medium text-blue-300 mb-2">💡 Misol hisob-kitob:</p>
                        <p className="text-xs text-blue-200 mb-2">20×15 cm, 1000 dona, 4 rang, lak bor:</p>
                        <p className="text-xs text-blue-100 font-mono leading-relaxed break-all">
                            Asosiy: 0.03 m² × 1000 × {settings.base_price_per_sqm || DEFAULT_SETTINGS.base_price_per_sqm} ={" "}
                            {(0.03 * 1000 * (settings.base_price_per_sqm || DEFAULT_SETTINGS.base_price_per_sqm)).toLocaleString()} so'm
                            <br />
                            Ranglar (+{(settings.color_markup_percent || DEFAULT_SETTINGS.color_markup_percent) * 4}%): +
                            {(
                                (0.03 * 1000 * (settings.base_price_per_sqm || DEFAULT_SETTINGS.base_price_per_sqm)) *
                                (settings.color_markup_percent || DEFAULT_SETTINGS.color_markup_percent) *
                                4 /
                                100
                            ).toLocaleString()}{" "}
                            so'm
                            <br />
                            Lak (+{settings.lacquer_markup_percent || DEFAULT_SETTINGS.lacquer_markup_percent}%): +
                            {(
                                (0.03 * 1000 * (settings.base_price_per_sqm || DEFAULT_SETTINGS.base_price_per_sqm)) *
                                (settings.lacquer_markup_percent || DEFAULT_SETTINGS.lacquer_markup_percent) /
                                100
                            ).toLocaleString()}{" "}
                            so'm
                            <br />
                            <strong>
                                JAMI:{" "}
                                {(
                                    0.03 *
                                    1000 *
                                    (settings.base_price_per_sqm || DEFAULT_SETTINGS.base_price_per_sqm) *
                                    (1 +
                                        ((settings.color_markup_percent || DEFAULT_SETTINGS.color_markup_percent) * 4) / 100 +
                                        (settings.lacquer_markup_percent || DEFAULT_SETTINGS.lacquer_markup_percent) / 100)
                                ).toLocaleString()}{" "}
                                so'm
                            </strong>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
