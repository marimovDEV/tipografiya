/**
 * Worker Layout
 * Touch-optimized, simplified layout for production workers
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckSquare, User } from 'lucide-react'

interface WorkerLayoutProps {
    children: ReactNode
}

export default function WorkerLayout({ children }: WorkerLayoutProps) {
    const pathname = usePathname()

    const navigation = [
        { name: 'Mening vazifalarim', href: '/tasks', icon: CheckSquare },
        { name: 'Profil', href: '/profile', icon: User },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Simple Header */}
            <header className="sticky top-0 z-50 border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold text-center">PrintERP</h1>
                </div>
            </header>

            {/* Main Content - Touch Optimized */}
            <main className="container mx-auto p-4 pb-24">
                {children}
            </main>

            {/* Bottom Navigation - Large Touch Targets */}
            <nav className="fixed bottom-0 left-0 right-0 bg-card border-t">
                <div className="container mx-auto flex justify-around">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  flex flex-col items-center gap-2 py-4 px-6 transition-colors
                  min-h-[80px] min-w-[120px] touch-manipulation
                  ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }
                `}
                            >
                                <Icon className="w-8 h-8" />
                                <span className="text-sm font-medium text-center">{item.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
