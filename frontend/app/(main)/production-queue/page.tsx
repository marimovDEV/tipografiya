"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Settings, Play, Pause, CheckCircle, Clock, AlertCircle,
    TrendingUp, Zap, Calendar, Users, ArrowUp, ArrowDown, RefreshCw
} from "lucide-react"
import {
    getMachineQueue,
    getProductionAnalytics,
    optimizeMachineQueue,
    updateStepPriority,
    getMachineAvailability
} from "@/lib/api/printery"
import { fetchWithAuth } from "@/lib/api-client"
import type { MachineQueue, ProductionAnalytics } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Machine {
    id: string
    machine_name: string
    machine_type: string
    is_active: boolean
}

export default function ProductionQueueDashboard() {
    const [machines, setMachines] = useState<Machine[]>([])
    const [selectedMachine, setSelectedMachine] = useState<string | null>(null)
    const [machineQueue, setMachineQueue] = useState<MachineQueue[]>([])
    const [analytics, setAnalytics] = useState<ProductionAnalytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedStep, setSelectedStep] = useState<MachineQueue | null>(null)
    const [priorityDialogOpen, setPriorityDialogOpen] = useState(false)
    const [newPriority, setNewPriority] = useState(5)

    useEffect(() => {
        loadMachines()
        loadAnalytics()
    }, [])

    useEffect(() => {
        if (selectedMachine) {
            loadMachineQueue(selectedMachine)
        }
    }, [selectedMachine])

    async function loadMachines() {
        try {
            const response = await fetchWithAuth("/api/machines/")
            const data = await response.json()
            const machinesData = data.results || data
            setMachines(machinesData.filter((m: Machine) => m.is_active))
            if (machinesData.length > 0) {
                setSelectedMachine(machinesData[0].id)
            }
        } catch (error) {
            console.error("Failed to load machines:", error)
        } finally {
            setLoading(false)
        }
    }

    async function loadMachineQueue(machineId: string) {
        try {
            const response = await getMachineQueue(machineId)
            setMachineQueue(response.queue || [])
        } catch (error) {
            console.error("Failed to load queue:", error)
        }
    }

    async function loadAnalytics() {
        try {
            const data = await getProductionAnalytics()
            setAnalytics(data)
        } catch (error) {
            console.error("Failed to load analytics:", error)
        }
    }

    async function handleOptimizeQueue() {
        if (!selectedMachine) return

        try {
            await optimizeMachineQueue(selectedMachine)
            toast.success("Navbat optimallashtirildi")
            loadMachineQueue(selectedMachine)
        } catch (error) {
            toast.error("Xatolik yuz berdi")
        }
    }

    async function handleUpdatePriority() {
        if (!selectedStep) return

        try {
            await updateStepPriority(selectedStep.id, newPriority)
            toast.success("Ustuvorlik o'zgartirildi")
            setPriorityDialogOpen(false)
            if (selectedMachine) {
                loadMachineQueue(selectedMachine)
            }
        } catch (error) {
            toast.error("Xatolik yuz berdi")
        }
    }

    const getPriorityColor = (priority: number) => {
        if (priority <= 2) return "bg-red-100 text-red-700"
        if (priority <= 5) return "bg-orange-100 text-orange-700"
        return "bg-gray-100 text-gray-700"
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700"
            case "in_progress": return "bg-blue-100 text-blue-700"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Ishlab Chiqarish Navbati</h1>
                    <p className="text-muted-foreground mt-1">
                        Stanoklar navbati va jadvallashtirish
                    </p>
                </div>
                <Button onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Yangilash
                </Button>
            </div>

            {/* Analytics Cards */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Kutilmoqda</p>
                                    <p className="text-2xl font-bold">{analytics.total_pending}</p>
                                </div>
                                <Clock className="w-8 h-8 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Jarayonda</p>
                                    <p className="text-2xl font-bold text-blue-600">{analytics.total_in_progress}</p>
                                </div>
                                <Play className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Bugun Tugadi</p>
                                    <p className="text-2xl font-bold text-green-600">{analytics.total_completed_today}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Kechikkan</p>
                                    <p className="text-2xl font-bold text-red-600">{analytics.late_steps_count}</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Machine Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Stanoklar Navbati</span>
                        {selectedMachine && (
                            <Button size="sm" onClick={handleOptimizeQueue}>
                                <Zap className="w-4 h-4 mr-2" />
                                Optimallash
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={selectedMachine || undefined} onValueChange={setSelectedMachine}>
                        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${machines.length}, 1fr)` }}>
                            {machines.map((machine) => (
                                <TabsTrigger key={machine.id} value={machine.id}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    {machine.machine_name}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {machines.map((machine) => (
                            <TabsContent key={machine.id} value={machine.id} className="space-y-3 mt-4">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
                                    </div>
                                ) : machineQueue.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                                        <p className="text-muted-foreground">
                                            Ushbu stanokda hech narsa yo'q
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {machineQueue.map((item, index) => (
                                            <Card
                                                key={item.id}
                                                className={`${item.status === "in_progress"
                                                        ? "border-blue-500 border-2"
                                                        : item.is_ready
                                                            ? "border-green-300"
                                                            : "border-gray-200"
                                                    }`}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            {/* Header */}
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                                                    {item.queue_position || index + 1}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold">
                                                                        {item.order_number}
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {item.client_name}
                                                                    </p>
                                                                </div>
                                                                <Badge className={getStatusColor(item.status)}>
                                                                    {item.status === "completed" && "Tugallangan"}
                                                                    {item.status === "in_progress" && "Jarayonda"}
                                                                    {item.status === "pending" && "Kutilmoqda"}
                                                                </Badge>
                                                                <Badge className={getPriorityColor(item.priority)}>
                                                                    Ustuvorlik: {item.priority}
                                                                </Badge>
                                                                {!item.is_ready && item.depends_on && (
                                                                    <Badge variant="outline" className="border-orange-500 text-orange-700">
                                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                                        Bloklangan
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {/* Details Grid */}
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-muted-foreground">Bosqich:</span>
                                                                    <p className="font-medium">{item.step}</p>
                                                                </div>
                                                                {item.assigned_to && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Ishchi:</span>
                                                                        <p className="font-medium">{item.assigned_to}</p>
                                                                    </div>
                                                                )}
                                                                {item.estimated_duration_minutes && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Davomiyligi:</span>
                                                                        <p className="font-medium">
                                                                            {Math.floor(item.estimated_duration_minutes / 60)}s {item.estimated_duration_minutes % 60}d
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {item.estimated_start && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Boshlash:</span>
                                                                        <p className="font-medium text-xs">
                                                                            {new Date(item.estimated_start).toLocaleString("uz-UZ", {
                                                                                month: "short",
                                                                                day: "numeric",
                                                                                hour: "2-digit",
                                                                                minute: "2-digit"
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Timeline */}
                                                            {item.estimated_start && item.estimated_end && (
                                                                <div className="mt-3 flex items-center gap-2 text-xs">
                                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                                    <span className="text-muted-foreground">
                                                                        {new Date(item.estimated_start).toLocaleDateString("uz-UZ")}
                                                                    </span>
                                                                    <span className="text-muted-foreground">→</span>
                                                                    <span className="text-muted-foreground">
                                                                        {new Date(item.estimated_end).toLocaleDateString("uz-UZ")}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex flex-col gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedStep(item)
                                                                    setNewPriority(item.priority)
                                                                    setPriorityDialogOpen(true)
                                                                }}
                                                            >
                                                                {item.priority <= 2 ? (
                                                                    <ArrowUp className="w-4 h-4 text-red-600" />
                                                                ) : item.priority <= 5 ? (
                                                                    <ArrowUp className="w-4 h-4 text-orange-600" />
                                                                ) : (
                                                                    <ArrowDown className="w-4 h-4 text-gray-600" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Priority Dialog */}
            <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ustuvorlikni O'zgartirish</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedStep && (
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">{selectedStep.order_number}</p>
                                <p className="text-xs text-muted-foreground">{selectedStep.step}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Ustuvorlik (1 = Eng yuqori, 10 = Eng past)
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={newPriority}
                                    onChange={(e) => setNewPriority(parseInt(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-2xl font-bold w-12 text-center">{newPriority}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>Baland</span>
                                <span>Past</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setPriorityDialogOpen(false)}
                            >
                                Bekor qilish
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleUpdatePriority}
                            >
                                Saqlash
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
