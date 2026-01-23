/**
 * PrintERP API Client
 * Centralized API methods for Product Templates, Material Validation, and Production
 */

import { fetchWithAuth } from "../api-client"
import type {
    ProductTemplate,
    MaterialValidationResult,
    MaterialConsumption,
    MachineQueue,
    WarehouseStatusReport,
    ProductionAnalytics,
    MaterialBatchEnhanced,
    WorkerTimeLog,
} from "./types"

const API_BASE = "/api"

// ============================================================================
// Product Templates
// ============================================================================

export async function getProductTemplates(params?: {
    category?: string
    is_active?: boolean
}): Promise<{ results: ProductTemplate[]; count: number }> {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append("category", params.category)
    if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active))

    const url = `${API_BASE}/product-templates/${queryParams.toString() ? `?${queryParams}` : ""}`
    const response = await fetchWithAuth(url)

    if (!response.ok) {
        throw new Error("Failed to fetch product templates")
    }

    return response.json()
}

export async function getProductTemplate(id: string): Promise<ProductTemplate> {
    const response = await fetchWithAuth(`${API_BASE}/product-templates/${id}/`)

    if (!response.ok) {
        throw new Error("Failed to fetch product template")
    }

    return response.json()
}

export async function createProductTemplate(data: Partial<ProductTemplate>): Promise<ProductTemplate> {
    const response = await fetchWithAuth(`${API_BASE}/product-templates/`, {
        method: "POST",
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error("Failed to create product template")
    }

    return response.json()
}

export async function updateProductTemplate(id: string, data: Partial<ProductTemplate>): Promise<ProductTemplate> {
    const response = await fetchWithAuth(`${API_BASE}/product-templates/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error("Failed to update product template")
    }

    return response.json()
}

export async function deleteProductTemplate(id: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE}/product-templates/${id}/`, {
        method: "DELETE",
    })

    if (!response.ok) {
        throw new Error("Failed to delete product template")
    }
}

export async function calculateMaterials(
    templateId: string,
    params: {
        width_cm: number
        height_cm: number
        quantity: number
        color_count?: number
        has_lacquer?: boolean
        has_gluing?: boolean
    }
): Promise<{ consumption: MaterialConsumption }> {
    const response = await fetchWithAuth(
        `${API_BASE}/product-templates/${templateId}/calculate-materials/`,
        {
            method: "POST",
            body: JSON.stringify(params),
        }
    )

    if (!response.ok) {
        throw new Error("Failed to calculate materials")
    }

    return response.json()
}

// ============================================================================
// Order Validation
// ============================================================================

export async function validateOrderMaterials(params: {
    product_template_id: string
    width_cm: number
    height_cm: number
    quantity: number
    color_count?: number
    has_lacquer?: boolean
    has_gluing?: boolean
}): Promise<{ is_valid: boolean; validation: MaterialValidationResult }> {
    const response = await fetchWithAuth(`${API_BASE}/orders/validate-materials/`, {
        method: "POST",
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        throw new Error("Failed to validate order materials")
    }

    return response.json()
}

export async function getCompatibleMaterials(templateId: string, layerNumber: number) {
    const response = await fetchWithAuth(
        `${API_BASE}/orders/compatible-materials/?template=${templateId}&layer=${layerNumber}`
    )

    if (!response.ok) {
        throw new Error("Failed to fetch compatible materials")
    }

    return response.json()
}

// ============================================================================
// Warehouse Management
// ============================================================================

export async function blockMaterialBatch(batchId: string, reason: string): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE}/warehouse/batches/${batchId}/block/`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
        throw new Error("Failed to block batch")
    }

    return response.json()
}

export async function unblockMaterialBatch(batchId: string): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE}/warehouse/batches/${batchId}/unblock/`, {
        method: "POST",
    })

    if (!response.ok) {
        throw new Error("Failed to unblock batch")
    }

    return response.json()
}

export async function getExpiringBatches(days: number = 30): Promise<{
    count: number
    batches: MaterialBatchEnhanced[]
}> {
    const response = await fetchWithAuth(
        `${API_BASE}/warehouse/expiring-batches/?days=${days}`
    )

    if (!response.ok) {
        throw new Error("Failed to fetch expiring batches")
    }

    return response.json()
}

export async function getLowStockAlerts(): Promise<{ count: number; materials: any[] }> {
    const response = await fetchWithAuth(`${API_BASE}/warehouse/low-stock-alerts/`)

    if (!response.ok) {
        throw new Error("Failed to fetch low stock alerts")
    }

    return response.json()
}

export async function getWarehouseStatusReport(): Promise<WarehouseStatusReport> {
    const response = await fetchWithAuth(`${API_BASE}/warehouse/status-report/`)

    if (!response.ok) {
        throw new Error("Failed to fetch warehouse status report")
    }

    return response.json()
}

// ============================================================================
// Production Scheduling
// ============================================================================

export async function getMachineQueue(machineId?: string): Promise<any> {
    const url = machineId
        ? `${API_BASE}/scheduling/machines/${machineId}/queue/`
        : `${API_BASE}/scheduling/machines/queues/`

    const response = await fetchWithAuth(url)

    if (!response.ok) {
        throw new Error("Failed to fetch machine queue")
    }

    return response.json()
}

export async function assignStepToMachine(
    productionStepId: string,
    machineId: string,
    calculateTimes: boolean = true
): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE}/scheduling/assign-to-machine/`, {
        method: "POST",
        body: JSON.stringify({
            production_step_id: productionStepId,
            machine_id: machineId,
            calculate_times: calculateTimes,
        }),
    })

    if (!response.ok) {
        throw new Error("Failed to assign step to machine")
    }

    return response.json()
}

export async function optimizeMachineQueue(machineId: string): Promise<any> {
    const response = await fetchWithAuth(
        `${API_BASE}/scheduling/machines/${machineId}/optimize/`,
        { method: "POST" }
    )

    if (!response.ok) {
        throw new Error("Failed to optimize machine queue")
    }

    return response.json()
}

export async function updateStepPriority(stepId: string, priority: number): Promise<any> {
    const response = await fetchWithAuth(
        `${API_BASE}/scheduling/steps/${stepId}/update-priority/`,
        {
            method: "POST",
            body: JSON.stringify({ priority }),
        }
    )

    if (!response.ok) {
        throw new Error("Failed to update step priority")
    }

    return response.json()
}

export async function scheduleOrderProduction(orderId: string): Promise<any> {
    const response = await fetchWithAuth(
        `${API_BASE}/scheduling/orders/${orderId}/schedule/`,
        { method: "POST" }
    )

    if (!response.ok) {
        throw new Error("Failed to schedule order production")
    }

    return response.json()
}

export async function getProductionAnalytics(): Promise<ProductionAnalytics> {
    const response = await fetchWithAuth(`${API_BASE}/scheduling/analytics/`)

    if (!response.ok) {
        throw new Error("Failed to fetch production analytics")
    }

    return response.json()
}

export async function getMachineAvailability(machineId: string): Promise<{
    is_available_now: boolean
    available_from: string
    busy_duration_minutes: number
}> {
    const response = await fetchWithAuth(
        `${API_BASE}/scheduling/machines/${machineId}/availability/`
    )

    if (!response.ok) {
        throw new Error("Failed to fetch machine availability")
    }

    return response.json()
}

// ============================================================================
// Worker Time Tracking
// ============================================================================

export async function logWorkerAction(params: {
    production_step_id: string
    action: "start" | "pause" | "resume" | "finish"
    location?: string
    pause_reason?: string
    notes?: string
}): Promise<WorkerTimeLog> {
    const response = await fetchWithAuth(`${API_BASE}/worker-time-logs/log_action/`, {
        method: "POST",
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        throw new Error("Failed to log worker action")
    }

    return response.json()
}

export async function calculateWorkDuration(productionStepId: string): Promise<{
    total_duration_minutes: number
    work_duration_minutes: number
    pause_duration_minutes: number
}> {
    const response = await fetchWithAuth(
        `${API_BASE}/worker-time-logs/calculate_duration/?production_step_id=${productionStepId}`
    )

    if (!response.ok) {
        throw new Error("Failed to calculate work duration")
    }

    return response.json()
}
