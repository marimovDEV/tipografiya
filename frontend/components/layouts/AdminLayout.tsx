/**
 * Admin Layout
 * Full-featured layout with all navigation options
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Package,
    FileText,
    Settings,
    TrendingUp,
    DollarSign,
    Activity,
    Bell
} from 'lucide-react'

interface AdminLayoutProps {
    children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname()

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Orders', href: '/orders', icon: FileText },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Production', href: '/production', icon: Activity },
        { name: 'Warehouse', href: '/warehouse', icon: Package },
        { name: 'Financial', href: '/financial', icon: DollarSign },
        { name: 'Analytics', href: '/analytics', icon: TrendingUp },
        { name: 'Automation', href: '/automation', icon: Bell },
        { name: 'Settings', href: '/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">PrintERP</h1>
                    <p className="text-sm text-muted-foreground">Admin Console</p>
                </div>

                <nav className="px-4 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }
                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
