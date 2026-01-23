"use client"

import { useRole } from "@/lib/context/role-context"

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  project_manager: "Loyiha menejeri",
  warehouse: "Skladchi",
  cutter: "Kesuvchi",
  printer: "Pechatchi",
  finishing: "Lak operator",
  qc: "Sifat nazorati",
  accountant: "Buxgalter",
}

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { SidebarContent } from "./sidebar"
import { useState } from "react"

export function Header() {
  const { currentRole, user } = useRole()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 -ml-2">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent onClose={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold truncate">Karton va quti</h2>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold">{user.first_name} {user.last_name} ({user.username})</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{roleLabels[currentRole] || currentRole}</p>
          </div>
        )}
      </div>
    </header>
  )
}
