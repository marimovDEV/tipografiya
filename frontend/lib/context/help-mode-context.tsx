"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface HelpModeContextType {
    helpMode: boolean
    setHelpMode: (value: boolean) => void
}

const HelpModeContext = createContext<HelpModeContextType | undefined>(undefined)

export function HelpModeProvider({ children }: { children: ReactNode }) {
    const [helpMode, setHelpModeState] = useState(true)
    const [isClient, setIsClient] = useState(false)

    // Initialize after client hydration
    useEffect(() => {
        setIsClient(true)
        // Load from localStorage
        const stored = localStorage.getItem('helpMode')
        console.log('Loading help mode from localStorage:', stored)
        if (stored !== null) {
            setHelpModeState(stored === 'true')
        }
    }, [])

    // Custom setter that saves to localStorage
    const setHelpMode = (value: boolean) => {
        console.log('Setting help mode to:', value)
        setHelpModeState(value)
        if (isClient) {
            localStorage.setItem('helpMode', value.toString())
            console.log('Saved to localStorage:', value)
        }
    }

    return (
        <HelpModeContext.Provider value={{ helpMode, setHelpMode }}>
            {children}
        </HelpModeContext.Provider>
    )
}

export const useHelpMode = () => {
    const context = useContext(HelpModeContext)
    if (!context) {
        throw new Error('useHelpMode must be used within HelpModeProvider')
    }
    return context
}
