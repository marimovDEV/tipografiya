"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HelpText } from "@/components/ui/help-text"
import { DEFAULT_SETTINGS } from "@/lib/default-settings"
import { RotateCcw } from "lucide-react"

interface WastePercentagesTabProps {
    settings: any
    setSettings: (settings: any) => void
}

export function WastePercentagesTab({ settings, setSettings }: WastePercentagesTabProps) {
    const handleReset = () => {
        setSettings({
            ...settings,
            waste_percentage_paper: DEFAULT_SETTINGS.waste_percentage_paper,
            waste_percentage_ink: DEFAULT_SETTINGS.waste_percentage_ink,
            waste_percentage_lacquer: DEFAULT_SETTINGS.waste_percentage_lacquer,
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">♻️ Chiqindi Foizlari</h3>
                    <p className="text-sm text-muted-foreground">
                        Ishlab chiqarish jarayonida yo'qotiladigan materiallar
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Standart qiymatlarga qaytarish
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Chiqindi Foizlari (%)</CardTitle>
                    <CardDescription>
                        Har bir material uchun ishlab chiqarish jarayonidagi yo'qotish foizi
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Paper waste */}
                        <div className="space-y-2">
                            <Label htmlFor="waste-paper">📄 Qog'oz chiqindisi</Label>
                            <div className="relative">
                                <Input
                                    id="waste-paper"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={settings.waste_percentage_paper || DEFAULT_SETTINGS.waste_percentage_paper}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            waste_percentage_paper: parseFloat(e.target.value),
                                        })
                                    }
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    %
                                </span>
                            </div>
                            <HelpText>
                                💡 <strong>Misol:</strong> 5% degan so'z - 100 listdan 5 tasi
                                chiqindiga chiqadi (kesish, sozlash).
                                <br />
                                📊 <strong>Odatda:</strong> 3-7% oralig'ida bo'ladi.
                            </HelpText>
                        </div>

                        {/* Ink waste */}
                        <div className="space-y-2">
                            <Label htmlFor="waste-ink">🎨 Bo&apos;yoq chiqindisi</Label>
                            <div className="relative">
                                <Input
                                    id="waste-ink"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={settings.waste_percentage_ink || DEFAULT_SETTINGS.waste_percentage_ink}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            waste_percentage_ink: parseFloat(e.target.value),
                                        })
                                    }
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    %
                                </span>
                            </div>
                            <HelpText>
                                💡 <strong>Misol:</strong> 10% - stanokni sozlashda, probni
                                chiqarishda sarflanadi.
                                <br />
                                📊 <strong>Odatda:</strong> 8-15% oralig'ida.
                            </HelpText>
                        </div>

                        {/* Lacquer waste */}
                        <div className="space-y-2">
                            <Label htmlFor="waste-lacquer">✨ Lak chiqindisi</Label>
                            <div className="relative">
                                <Input
                                    id="waste-lacquer"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={settings.waste_percentage_lacquer || DEFAULT_SETTINGS.waste_percentage_lacquer}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            waste_percentage_lacquer: parseFloat(e.target.value),
                                        })
                                    }
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                    %
                                </span>
                            </div>
                            <HelpText>
                                💡 <strong>Misol:</strong> 8% - lakni sozlashda va qolipda qolib
                                ketganda.
                                <br />
                                📊 <strong>Odatda:</strong> 5-10% oralig'ida.
                            </HelpText>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">
                            ⚠️ Chiqindi kam bo'lsa yaxshi, lekin juda kam (0-1%) qilmang!
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                            Agar chiqindini juda kam belgilasangiz, material yetmay qolishi mumkin
                            va ishni to'xtatishga to'g'ri keladi. Optimal qiymat: Qog'oz 5%,
                            Bo'yoq 10%, Lak 8%
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
