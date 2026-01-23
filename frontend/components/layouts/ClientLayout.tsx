/**
 * Client Layout
 * Minimal, clean layout for client portal
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Plus, User } from 'lucide-react'

interface ClientLayoutProps {
    children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const pathname = usePathname()

    const navigation = [
        { name: 'My Orders', href: '/my-orders', icon: Package },
        { name: 'New Order', href: '/new-order', icon: Plus },
        { name: 'Profile', href: '/profile', icon: User },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Clean Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">PrintERP</h1>
                        <p className="text-sm text-muted-foreground">Client Portal</p>
                    </div>

                    <nav className="flex gap-4">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                    ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden md:inline">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-5xl p-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t bg-card">
                <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                    <p>© 2026 PrintERP. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
