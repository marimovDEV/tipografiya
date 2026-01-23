"use client"

import { useHelpMode } from "@/lib/context/help-mode-context"
import { Info } from "lucide-react"
import { ReactNode } from "react"

/**
 * Simple help text that appears below inputs/labels
 * Only shows when helpMode is enabled
 */
export function HelpText({ children }: { children: ReactNode }) {
    const { helpMode } = useHelpMode()

    if (!helpMode) return null

    return (
        <div className="mt-1 flex gap-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-400" />
            <span className="break-words flex-1">{children}</span>
        </div>
    )
}

/**
 * Colored help box for important information
 * Only shows when helpMode is enabled
 */
export function HelpBox({
    title,
    children,
    variant = "blue"
}: {
    title?: string
    children: ReactNode
    variant?: "blue" | "amber" | "green" | "purple"
}) {
    const { helpMode } = useHelpMode()

    if (!helpMode) return null

    const variants = {
        blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300",
        amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300",
        green: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300",
        purple: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300"
    }

    const textVariants = {
        blue: "text-blue-700 dark:text-blue-400",
        amber: "text-amber-700 dark:text-amber-400",
        green: "text-green-700 dark:text-green-400",
        purple: "text-purple-700 dark:text-purple-400"
    }

    return (
        <div className={`p-4 border rounded-lg ${variants[variant]}`}>
            {title && (
                <p className="text-sm font-semibold mb-2">
                    {title}
                </p>
            )}
            <p className={`text-xs ${textVariants[variant]} leading-relaxed break-words`}>
                {children}
            </p>
        </div>
    )
}

/**
 * Inline help icon with tooltip
 */
export function HelpIcon({ tooltip }: { tooltip: string }) {
    const { helpMode } = useHelpMode()

    if (!helpMode) return null

    return (
        <span className="inline-flex items-center ml-1" title={tooltip}>
            <Info className="h-3.5 w-3.5 text-blue-400 cursor-help" />
        </span>
    )
}
