"use client"

import { useHelpMode } from "@/lib/context/help-mode-context"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

export function HelpModeToggle() {
    const { helpMode, setHelpMode } = useHelpMode()

    return (
        <Card className="border-purple-700 bg-purple-950/20">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-slate-50">
                    <Lightbulb className="h-4 w-4 text-purple-400" />
                    Yordam Rejimi
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-400">
                        {helpMode ? "✅ Yoqilgan" : "⭕ O'chirilgan"}
                    </span>
                    <Switch
                        checked={helpMode}
                        onCheckedChange={setHelpMode}
                        className="data-[state=checked]:bg-purple-600"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
