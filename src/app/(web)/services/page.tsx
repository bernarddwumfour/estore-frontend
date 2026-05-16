"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Wrench,
    Smartphone,
    RefreshCw,
    ShieldAlert,
    Send,
    ArrowRight,
    X
} from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { useState, useEffect } from "react"

interface ServiceCard {
    id: string
    title: string
    slug: string
    description: string
    basePrice: string
    icon: React.ComponentType<{ className?: string }>
}

interface ServiceFormInputs {
    serviceType: string
    customServiceType: string
    deviceModel: string
    clientName: string
    clientEmail: string
    clientPhone: string
    issueDescription: string
}

const AVAILABLE_SERVICES: ServiceCard[] = [
    {
        id: "srv-1",
        title: "Battery Replacement",
        slug: "battery-replacement",
        description: "Restore your device to peak performance with genuine battery cells.",
        basePrice: "From $69",
        icon: Wrench,
    },
    {
        id: "srv-2",
        title: "Screen Repair",
        slug: "screen-repair",
        description: "Fix cracked glass and unresponsive screens with TrueTone calibration.",
        basePrice: "From $149",
        icon: Smartphone,
    },
    {
        id: "srv-3",
        title: "Trade-In Evaluation",
        slug: "trade-in",
        description: "Turn your old device into instant store credit.",
        basePrice: "Instant Quote",
        icon: RefreshCw,
    },
    {
        id: "srv-4",
        title: "Logic Board Repair",
        slug: "hardware-diagnostics",
        description: "Advanced micro-soldering for water damage and booting errors.",
        basePrice: "Free Assessment",
        icon: ShieldAlert,
    },
]

export default function ServicesPage() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<ServiceCard | null>(null)

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<ServiceFormInputs>({
        defaultValues: {
            serviceType: "",
            customServiceType: "",
            deviceModel: "",
            clientName: "",
            clientEmail: "",
            clientPhone: "",
            issueDescription: "",
        }
    })

    const selectedServiceType = watch("serviceType")

    // Update issue description when service type changes
    useEffect(() => {
        if (selectedServiceType && selectedServiceType !== "other") {
            const service = AVAILABLE_SERVICES.find(s => s.slug === selectedServiceType)
            if (service) {
                setValue("issueDescription", `I need help with ${service.title}. My device is having issues with: `)
            }
        } else if (selectedServiceType === "other") {
            setValue("issueDescription", "Please describe what service you need: ")
        }
    }, [selectedServiceType, setValue])

    // Open modal and pre-populate fields matching card attributes
    const handleOpenRequestForm = (service: ServiceCard) => {
        setSelectedService(service)
        reset({
            serviceType: service.slug,
            customServiceType: "",
            deviceModel: "",
            clientName: "",
            clientEmail: "",
            clientPhone: "",
            issueDescription: `I need help with ${service.title}. My device is having issues with: `,
        })
        setIsOpen(true)
    }

    const onSubmit = (data: ServiceFormInputs) => {
        const finalServiceType = data.serviceType === "other" ? data.customServiceType : data.serviceType
        console.log("Submitted:", { ...data, serviceType: finalServiceType })
        alert("Thanks! We'll get back to you within 24 hours.")
        setIsOpen(false)
    }

    // Get service title for display
    const getServiceTitle = () => {
        if (selectedServiceType === "other") return "Other Service"
        const service = AVAILABLE_SERVICES.find(s => s.slug === selectedServiceType)
        return service ? service.title : "Service Request"
    }

    return (
        <div className="min-h-screen bg-white text-slate-900">

            {/* Hero Section */}
            <section className="py-24 pb-12 bg-[#f8f9fa] border-b border-slate-100">
                <div className="container mx-auto px-4 lg:px-8 text-center space-y-6">
                    <div className="space-y-4">
                        <span className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs block">
                            Repairs & Maintenance
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                            Fast, Reliable Device{" "}
                            <span className="text-slate-950 relative inline-block">
                                Repairs.
                            </span>
                        </h1>
                    </div>
                    <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed pt-2">
                        Choose a service below to get started. We'll handle the rest.
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 block mb-3">
                            What We Offer
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                            Our Services
                        </h2>
                    </div>

                    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {AVAILABLE_SERVICES.map((service) => {
                                const IconComponent = service.icon
                                return (
                                    <div
                                        key={service.id}
                                        onClick={() => handleOpenRequestForm(service)}
                                        className="group bg-[#f8f9fa] rounded-2xl border border-slate-100 p-6 flex flex-col transition-all duration-300 hover:bg-[#f1f3f5] cursor-pointer hover:shadow-md"
                                    >
                                        <div className="flex items-center justify-between w-full mb-6">
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-100 text-slate-950">
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-950 bg-white border border-slate-100 px-3 py-1 rounded-full">
                                                {service.basePrice}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-950 mb-2">
                                                {service.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                                {service.description}
                                            </p>
                                            <span className="text-sm font-semibold text-slate-950 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                                Request Service
                                                <ArrowRight className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Modal Form */}
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50" />

                            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-2xl border border-slate-100 shadow-xl p-6 sm:p-8 z-50 max-h-[90vh] overflow-y-auto">

                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <Dialog.Title className="text-xl font-bold text-slate-950 mb-1">
                                            Request {getServiceTitle()}
                                        </Dialog.Title>
                                        <Dialog.Description className="text-sm text-slate-500">
                                            Tell us about your device and we'll reach out shortly.
                                        </Dialog.Description>
                                    </div>
                                    <Dialog.Close asChild>
                                        <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-950 transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </Dialog.Close>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    {/* Service Type Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 block">
                                            Service Type *
                                        </label>
                                        <select
                                            {...register("serviceType", { required: "Please select a service type" })}
                                            className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-950 transition-colors cursor-pointer"
                                        >
                                            <option value="">Select a service</option>
                                            <option value="battery-replacement">Battery Replacement</option>
                                            <option value="screen-repair">Screen Repair</option>
                                            <option value="trade-in">Trade-In Evaluation</option>
                                            <option value="hardware-diagnostics">Logic Board Repair</option>
                                            <option value="other">Other (please specify)</option>
                                        </select>
                                        {errors.serviceType && (
                                            <p className="text-xs text-red-500">{errors.serviceType.message}</p>
                                        )}
                                    </div>

                                    {/* Custom Service Type Input */}
                                    {selectedServiceType === "other" && (
                                        <div className="space-y-2 animate-in fade-in duration-200">
                                            <label className="text-sm font-semibold text-slate-700 block">
                                                Please specify your service needs *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Water damage repair, Data recovery, etc."
                                                {...register("customServiceType", {
                                                    required: selectedServiceType === "other" ? "Please describe your service needs" : false
                                                })}
                                                className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-950 transition-colors"
                                            />
                                            {errors.customServiceType && (
                                                <p className="text-xs text-red-500">{errors.customServiceType.message}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Device Model */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 block">
                                            Device Model *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., iPhone 15 Pro, MacBook Air M2, Samsung Galaxy S23"
                                            {...register("deviceModel", { required: "Please enter your device model" })}
                                            className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-950 transition-colors"
                                        />
                                        {errors.deviceModel && (
                                            <p className="text-xs text-red-500">{errors.deviceModel.message}</p>
                                        )}
                                    </div>

                                    {/* Name, Email & Phone - Now in 3 columns on desktop */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 block">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Alex Smith"
                                                {...register("clientName", { required: "Please enter your name" })}
                                                className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-950 transition-colors"
                                            />
                                            {errors.clientName && (
                                                <p className="text-xs text-red-500">{errors.clientName.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 block">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="alex@example.com"
                                                {...register("clientEmail", {
                                                    required: "Please enter your email",
                                                    pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email address" }
                                                })}
                                                className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-950 transition-colors"
                                            />
                                            {errors.clientEmail && (
                                                <p className="text-xs text-red-500">{errors.clientEmail.message}</p>
                                            )}
                                        </div>

                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 block">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="(555) 123-4567"
                                            {...register("clientPhone", {
                                                required: "Please enter your phone number",
                                                pattern: {
                                                    value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
                                                    message: "Enter a valid phone number"
                                                }
                                            })}
                                            className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-950 transition-colors"
                                        />
                                        {errors.clientPhone && (
                                            <p className="text-xs text-red-500">{errors.clientPhone.message}</p>
                                        )}
                                    </div>

                                    {/* Issue Description - Auto-updates based on selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 block">
                                            Issue Description *
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Please describe the problem you're experiencing..."
                                            {...register("issueDescription", { required: "Please describe the issue" })}
                                            className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-950 transition-colors resize-none"
                                        />
                                        {errors.issueDescription && (
                                            <p className="text-xs text-red-500">{errors.issueDescription.message}</p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-1">
                                            Tip: Include details like when the issue started and any error messages
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <Button type="submit" className="w-full flex items-center justify-center gap-2">
                                            Submit Request
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>

                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>

                </div>
            </section>
        </div>
    )
}