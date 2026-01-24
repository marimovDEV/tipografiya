"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, ShoppingCart, Factory, Warehouse, FileText, Settings, Archive } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRole } from "@/lib/context/role-context"

const navigation = [
  {
    name: "Bosh sahifa",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "project_manager", "warehouse", "cutter", "printer", "finishing", "qc", "accountant"],
  },
  { name: "Mijozlar", href: "/clients", icon: Users, roles: ["admin", "project_manager"] },
  {
    name: "Buyurtmalar",
    href: "/orders",
    icon: ShoppingCart,
    roles: ["admin", "project_manager"],
  },
  {
    name: "Ishlab chiqarish",
    href: "/production",
    icon: Factory,
    roles: ["admin", "project_manager", "warehouse", "cutter", "printer", "finishing", "qc"],
  },
  { name: "Sklad", href: "/warehouse", icon: Warehouse, roles: ["admin", "warehouse", "warehouse_manager", "project_manager", "production_manager"] },
  { name: "Tugagan Ishlar", href: "/archive", icon: Archive, roles: ["admin", "project_manager"], },
  { name: "Hisobotlar", href: "/reports", icon: FileText, roles: ["admin", "project_manager", "accountant"] },
  { name: "Sozlamalar", href: "/settings", icon: Settings, roles: ["admin"] },
]

export function SidebarContent({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname()
  const { currentRole } = useRole()
  const filteredNav = navigation.filter((item) => item.roles.includes(currentRole))

  return (
    <div className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">PrintERP</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredNav.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-blue-900/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/auth/login";
          }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
        >
          Chiqish (Logout)
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("hidden h-screen w-64 flex-col border-r md:flex", className)}>
      <SidebarContent />
    </div>
  )
}
