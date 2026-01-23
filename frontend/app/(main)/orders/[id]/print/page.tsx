"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { fetchWithAuth } from "@/lib/api-client"
import { Order } from "@/lib/types"
import { getStatusLabel } from "@/lib/data/mock-data"

export default function OrderPrintPage() {
    const { id } = useParams()
    const searchParams = useSearchParams()
    const type = searchParams.get('type') || 'receipt' // 'receipt' | 'todo'

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrder()
    }, [id])

    const fetchOrder = async () => {
        try {
            const response = await fetchWithAuth(`/api/orders/${id}/`)
            if (!response.ok) throw new Error("Buyurtma topilmadi")
            const orderData = await response.json()
            setOrder(orderData)

            // Auto-print after short delay
            setTimeout(() => {
                window.print()
            }, 800)

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Yuklanmoqda...</div>
    if (!order) return <div className="p-8 text-center">Buyurtma topilmadi</div>

    // Calculations
    const total = order.total_price || 0

    return (
        <div className="p-8 max-w-2xl mx-auto bg-white text-black print:p-0 font-mono text-sm leading-relaxed">

            {/* ------------------- HEADER ------------------- */}
            <div className="text-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold uppercase tracking-widest mb-1">
                    {type === 'todo' ? 'ISHLAB CHIQARISH REJASI' : "TO'LOV CHEKI"}
                </h1>
                {type === 'todo' && <p className="text-xl font-bold uppercase">(TO-DO LIST)</p>}

                <p className="text-sm mt-2">PrintERP Tizimi</p>
                <div className="flex justify-center gap-4 text-xs mt-2 font-bold uppercase">
                    <span>ID: #{order.order_number?.split('-').pop()}</span>
                    <span>Sana: {new Date(order.created_at).toLocaleDateString("uz-UZ")}</span>
                </div>
            </div>

            {/* ------------------- INFO BLOCKS ------------------- */}
            <div className="mb-6 grid grid-cols-2 gap-8">
                <div>
                    <h3 className="font-bold border-b mb-2 uppercase text-xs text-gray-500">Buyurtmachi</h3>
                    <p className="font-bold text-lg">{order.client?.full_name}</p>
                    <p>{order.client?.company}</p>
                    {type === 'todo' && <p className="font-bold text-red-600">Muddat: {order.deadline ? new Date(order.deadline).toLocaleDateString("uz-UZ") : "SHOSHILINCH"}</p>}
                </div>
                <div>
                    <h3 className="font-bold border-b mb-2 uppercase text-xs text-gray-500">Mahsulot</h3>
                    <p className="font-bold">{order.box_type}</p>
                    <p className="font-mono text-xl font-black">{order.quantity.toLocaleString()} dona</p>
                </div>
            </div>

            {/* ------------------- SPECS (ALWAYS SHOWN) ------------------- */}
            <div className="border-2 border-black p-4 mb-6 rounded-sm">
                <h2 className="font-bold mb-3 uppercase border-b border-dashed border-black pb-1">Texnik Tafsilotlar</h2>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div className="flex justify-between">
                        <span>O'lchamlari:</span>
                        <span className="font-bold">
                            {order.paper_width || '-'} x {order.paper_height || '-'} sm
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Qog'oz:</span>
                        <span className="font-bold">{order.paper_type} ({order.paper_density}g)</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Pechat:</span>
                        <span className="font-bold">{order.print_type} {order.print_colors}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kesish:</span>
                        <span className="font-bold">{order.cutting_type}</span>
                    </div>
                    {order.lacquer_type && (
                        <div className="flex justify-between">
                            <span>Laklash:</span>
                            <span className="font-bold">{order.lacquer_type}</span>
                        </div>
                    )}
                </div>
                {order.additional_processing && (
                    <div className="mt-3 pt-2 border-t border-dashed border-gray-400">
                        <span className="font-bold">Qo'shimcha:</span> {order.additional_processing}
                    </div>
                )}
                {type === 'todo' && order.notes && (
                    <div className="mt-3 pt-2 border-t border-dashed border-gray-400 bg-gray-100 p-2">
                        <span className="font-bold text-red-600">Eslatma:</span> {order.notes}
                    </div>
                )}
            </div>

            {/* ------------------- TO-DO LIST (ONLY TYPE=TODO) ------------------- */}
            {type === 'todo' && (
                <div className="mb-6">
                    <h2 className="font-bold mb-3 uppercase text-lg border-b-2 border-black">Bajariladigan Ishlar</h2>
                    <div className="space-y-0">
                        {order.production_steps?.map((step, idx) => {
                            let instruction = ""
                            const stepKey = step.step.toLowerCase()

                            if (stepKey.includes('cutting') || stepKey.includes('kesish')) {
                                instruction = `Format: ${order.cutting_type || '-'}. Qog'oz: ${order.paper_type} ${order.paper_density}g.`
                            } else if (stepKey.includes('printing') || stepKey.includes('pechat')) {
                                instruction = `Rang: ${order.print_type} (${order.print_colors}).`
                            } else if (stepKey.includes('gluing') || stepKey.includes('yelim')) {
                                instruction = `Turi: ${order.box_type}.`
                            } else if (stepKey.includes('packaging') || stepKey.includes('qadoq')) {
                                instruction = `Jami: ${order.quantity.toLocaleString()} dona.`
                            } else if (stepKey.includes('lacquer') || stepKey.includes('lak')) {
                                instruction = `Lak: ${order.lacquer_type || '-'}.`
                            }

                            return (
                                <div key={idx} className="flex items-center justify-between border-b border-gray-300 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 border-2 border-black rounded-sm flex items-center justify-center">
                                            {step.status === 'completed' ? '✓' : ''}
                                        </div>
                                        <div>
                                            <p className="font-bold uppercase text-sm">{step.step}</p>
                                            <p className="text-xs text-gray-500">Mas'ul: {step.assigned_to_name}</p>
                                            {instruction && (
                                                <p className="text-xs font-bold font-mono mt-1 text-gray-700">
                                                    {instruction}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-32 border-b border-dotted border-gray-400 h-6"></div>
                                </div>
                            )
                        })}
                        <div className="flex items-center justify-between border-b border-gray-300 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-2 border-black rounded-sm"></div>
                                <span className="font-bold uppercase">Sifat Nazorati (QC)</span>
                            </div>
                            <div className="w-32 border-b border-dotted border-gray-400 h-6"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------- RECEIPT FINANCIALS (ONLY TYPE=RECEIPT) ------------------- */}
            {type === 'receipt' && (
                <div className="mb-8 mt-12">
                    <div className="border-t-2 border-dashed border-black my-4"></div>
                    <div className="flex justify-between items-end text-xl font-bold">
                        <span>JAMI SUMMA:</span>
                        <span>{total.toLocaleString()} so'm</span>
                    </div>
                    <div className="border-b-2 border-dashed border-black my-4"></div>
                    <p className="text-center text-xs italic mt-4">Xaridingiz uchun rahmat!</p>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    header, footer, nav, button, .no-print {
                        display: none !important;
                    }
                    body {
                        background: white;
                        color: black;
                        -webkit-print-color-adjust: exact;
                    }
                    @page {
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    )
}
