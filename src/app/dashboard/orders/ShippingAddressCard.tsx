// app/dashboard/orders/components/ShippingAddressCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Building, Globe } from "lucide-react";

interface Address {
    id: string;
    address_type: string;
    first_name: string;
    last_name: string;
    company: string;
    phone: string;
    email: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

interface ShippingAddressCardProps {
    address: Address;
    orderNumber: string;
}

export default function ShippingAddressCard({ address, orderNumber }: ShippingAddressCardProps) {
    if (!address) {
        return (
            <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No shipping address available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold">Shipping Address</h2>
                <p className="text-sm text-muted-foreground">Order #{orderNumber}</p>
            </div>

            {/* Address Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Address
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-medium text-lg">
                            {address.first_name} {address.last_name}
                        </p>
                        {address.company && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Building className="h-3 w-3" /> {address.company}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm">{address.address_line1}</p>
                        {address.address_line2 && <p className="text-sm">{address.address_line2}</p>}
                        <p className="text-sm">
                            {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-sm flex items-center gap-1">
                            <Globe className="h-3 w-3" /> {address.country}
                        </p>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                        <p className="text-sm flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Phone:</span> {address.phone}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Email:</span> {address.email}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}