/**
 * Manager Layout
 * Production-focused layout for project managers
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    FileText,
    Activity,
    TrendingUp,
    AlertCircle
} from 'lucide-react'

interface ManagerLayoutProps {
    children: ReactNode
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
    const pathname = usePathname()

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Orders', href: '/orders', icon: FileText },
        { name: 'Production', href: '/production', icon: Activity },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Reports', href: '/reports', icon: TrendingUp },
        { name: 'Bottlenecks', href: '/bottlenecks', icon: AlertCircle },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 border-b bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">PrintERP</h1>
                        <p className="text-sm text-muted-foreground">Production Manager</p>
                    </div>

                    <nav className="flex gap-4">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm
                    ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    )
}
