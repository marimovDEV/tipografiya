"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HelpText } from "@/components/ui/help-text"
import { DEFAULT_SETTINGS } from "@/lib/default-settings"
import { RotateCcw } from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"

interface CurrencyTabProps {
    settings: any
    setSettings: (settings: any) => void
}

export function CurrencyTab({ settings, setSettings }: CurrencyTabProps) {
    const handleReset = () => {
        setSettings({
            ...settings,
            exchange_rate: DEFAULT_SETTINGS.exchange_rate,
        })
    }

    const handleUpdateCurrency = async () => {
        try {
            const res = await fetchWithAuth("/api/settings/update-currency/", {
                method: "POST",
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Yangilab bo'lmadi")
            }

            const data = await res.json()
            setSettings({ ...settings, exchange_rate: data.new_rate })
            toast.success(`Kurs yangilandi: ${data.new_rate} so'm`)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Xatolik yuz berdi")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">💱 Valyuta Sozlamalari</h3>
                    <p className="text-sm text-muted-foreground">
                        Markaziy Bank kursidan avtomatik yangilash
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Standart qiymatga qaytarish
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Valyuta Kursi</CardTitle>
                    <CardDescription>
                        O'zbekiston Markaziy Banki (CBU) ma'lumotlaridan
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="exchange">💵 1 USD kursi</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="exchange"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={settings.exchange_rate || DEFAULT_SETTINGS.exchange_rate}
                                        onChange={(e) =>
                                            setSettings({ ...settings, exchange_rate: parseFloat(e.target.value) })
                                        }
                                        className="pr-16"
                                    />
                                    <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                        so'm
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleUpdateCurrency}
                                    className="whitespace-nowrap"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                                    </svg>
                                    Yangilash
                                </Button>
                            </div>
                            <HelpText>
                                O&apos;zbekiston Markaziy Banki (CBU) ma&apos;lumotlaridan
                            </HelpText>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                            💡 Valyuta kursi avtomatik yangilanadi
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                            &quot;Yangilash&quot; tugmasini bosib, CBU dan eng so'nggi kursni
                            olishingiz mumkin. Bu import materiallari uchun foydali.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
