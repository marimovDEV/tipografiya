"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-50">Yuklanmoqda...</div>
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 bg-slate-950 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
