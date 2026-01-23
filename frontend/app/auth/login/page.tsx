"use client"

import type React from "react"
import { useRole } from "@/lib/context/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { login } = useRole()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Ensure no double slashes and correct trailing slash
      const baseUrl = API_URL?.replace(/\/$/, "") || ""
      const endpoint = "/api/login/"
      const fullUrl = `${baseUrl}${endpoint}`

      console.log("Login attempt:", { fullUrl, username })

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response. Check console for details.")
      }

      const data = await response.json()

      if (!response.ok) {
        console.error("Login failed response:", data)
        throw new Error(data.error || data.detail || `Login failed: ${response.status}`)
      }

      login(data.token, data.user)
      localStorage.setItem("token", data.token)
      router.push("/dashboard")
    } catch (error: unknown) {
      console.error("Login error details:", error)
      setError(error instanceof Error ? error.message : "Invalid username or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">PrintERP Login</CardTitle>
              <CardDescription>Enter your username and password to access the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="admin"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      autoComplete="username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 rounded-lg bg-slate-100 p-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">Test Credentials:</p>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold">Parol: 123</p>
                  <p>admin (Admin)</p>
                  <p>ismoilov (Omborchi)</p>
                  <p>gafur (Kesish)</p>
                  <p>shohruh (Printer)</p>
                  <p>jasur (Finishing)</p>
                  <p>kamron (QC)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
