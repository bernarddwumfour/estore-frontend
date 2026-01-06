'use client'

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { AlertMessage } from "@/widgets/alert-message/AlertMessage";
import DataTable from "@/widgets/data-table/DataTable";
import TableLoader from "@/widgets/loaders/TableLoader";
import { endpoints } from "@/constants/endpoints/endpoints";
import securityAxios from "@/axios-instances/SecurityAxios";
import {
  MoreHorizontal,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  PackageCheck,
  RefreshCw,
  DollarSign,
  AlertCircle,
  CreditCard,
  CircleDollarSign,
  Ban,
  ShoppingCart,
  MapPin,
  Calendar,
  Eye,
  FileText,
  Package,
} from "lucide-react";
import { useState } from "react";

export const fetchOrders = async () => {
  const response = await securityAxios.get(endpoints.orders.listOrders);
  return response.data;
};

// Key-Value Display Component for Objects
function KeyValueDisplay({ data, title }: { data: Record<string, any>, title?: string }) {
  return (
    <div className="space-y-2">
      {title && <h4 className="font-medium text-sm">{title}</h4>}
      <div className="border rounded-md divide-y">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center p-2 hover:bg-muted/50">
            <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
            <span className="text-sm">
              {value === null ? '—' : 
               typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
               typeof value === 'object' ? JSON.stringify(value) :
               String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Items Table Component
function ItemsTable({ items }: { items: any[] }) {
  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 border-b font-medium text-sm">
          <div className="col-span-3">Product</div>
          <div className="col-span-2">SKU</div>
          <div className="col-span-2">Variant</div>
          <div className="col-span-1 text-center">Qty</div>
          <div className="col-span-2 text-right">Unit Price</div>
          <div className="col-span-2 text-right">Total</div>
        </div>
        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-12 gap-4 p-3 border-b last:border-0 hover:bg-muted/30">
            <div className="col-span-3 flex items-center space-x-2">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.product_title} 
                  className="w-10 h-10 rounded object-cover"
                />
              )}
              <div>
                <p className="font-medium text-sm">{item.product_title}</p>
                <p className="text-xs text-muted-foreground">{item.product_slug}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center">
              <code className="text-xs bg-muted px-2 py-1 rounded">{item.sku}</code>
            </div>
            <div className="col-span-2">
              {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(item.variant_attributes).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="capitalize">{key}:</span> <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <Badge variant="outline">{item.quantity}</Badge>
            </div>
            <div className="col-span-2 flex items-center justify-end">
              ${item.unit_price.toFixed(2)}
            </div>
            <div className="col-span-2 flex items-center justify-end font-medium">
              ${item.total_price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      {items.length > 0 && (
        <div className="flex justify-end">
          <div className="text-sm space-y-1">
            <div className="flex justify-between space-x-8">
              <span>Subtotal:</span>
              <span>${items.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between space-x-8">
              <span>Items:</span>
              <span>{items.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Items Dialog Component
function ItemsDialog({ items, orderNumber }: { items: any[], orderNumber: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          View Items ({items.length})
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Items</DialogTitle>
          <DialogDescription>
            Items in order {orderNumber}
          </DialogDescription>
        </DialogHeader>
        <ItemsTable items={items} />
      </DialogContent>
    </Dialog>
  );
}

// Shipping Address Dialog Component
function ShippingAddressDialog({ address, orderNumber }: { address: any, orderNumber: string }) {
  if (!address) return null;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <MapPin className="mr-2 h-4 w-4" />
          Shipping Address
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Shipping Address</DialogTitle>
          <DialogDescription>
            For order {orderNumber}
          </DialogDescription>
        </DialogHeader>
        <KeyValueDisplay data={address} />
      </DialogContent>
    </Dialog>
  );
}

// Timestamps Dialog Component
function TimestampsDialog({ timestamps, orderNumber }: { timestamps: any, orderNumber: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Calendar className="mr-2 h-4 w-4" />
          Order Timestamps
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order Timestamps</DialogTitle>
          <DialogDescription>
            Status timeline for order {orderNumber}
          </DialogDescription>
        </DialogHeader>
        <KeyValueDisplay 
          data={timestamps} 
          title="Timestamps (null means not yet occurred)"
        />
      </DialogContent>
    </Dialog>
  );
}

// Order Details Dialog Component
function OrderDetailsDialog({ order }: { order: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Complete details for order {order.order_number}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-2 gap-4">
            <KeyValueDisplay 
              data={{
                order_number: order.order_number,
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                status: order.status_display,
                payment_status: order.payment_status_display,
                payment_method: order.payment_method_display,
              }}
              title="Order Information"
            />
            <KeyValueDisplay 
              data={{
                subtotal: `$${order.subtotal.toFixed(2)}`,
                shipping: `$${order.shipping_cost.toFixed(2)}`,
                tax: `$${order.tax_amount.toFixed(2)} (${order.tax_rate}%)`,
                discount: `$${order.discount_amount.toFixed(2)}`,
                total: `$${order.total.toFixed(2)}`,
                currency: order.currency,
                created_at: new Date(order.created_at).toLocaleString(),
              }}
              title="Financial Information"
            />
          </div>
          
          {/* Items Preview */}
          <div>
            <h4 className="font-medium text-sm mb-2">Order Items ({order.item_count})</h4>
            <div className="border rounded-md p-3 space-y-2">
              {order.items.slice(0, 2).map((item: any, index: number) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.product_title} 
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.product_title}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="font-medium">${item.total_price.toFixed(2)}</span>
                </div>
              ))}
              {order.items.length > 2 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {order.items.length - 2} more items
                </p>
              )}
            </div>
          </div>
          
          {/* Guest Info if exists */}
          {order.guest_info && (
            <KeyValueDisplay 
              data={order.guest_info}
              title="Guest Information"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionsDropdown({ row }: { row: any }) {
  const queryClient = useQueryClient();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* View Details */}
        <OrderDetailsDialog order={row} />
        
        {/* View Items */}
        <ItemsDialog items={row.items} orderNumber={row.order_number} />
        
        {/* Shipping Address */}
        <ShippingAddressDialog address={row.shipping_address} orderNumber={row.order_number} />
        
        {/* Timestamps */}
        <TimestampsDialog timestamps={row.timestamps} orderNumber={row.order_number} />
        
        <DropdownMenuSeparator />
        
        {/* Update Status Dialogs */}
        <Dialog>
          <DialogTrigger className="w-full" asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <PackageCheck className="mr-2 h-4 w-4" />
              Update Order Status
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Select a new status and add an optional note for order {row.order_number}
              </DialogDescription>
            </DialogHeader>
            <OrderStatusForm 
              row={row} 
              queryClient={queryClient} 
            />
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger className="w-full" asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <CreditCard className="mr-2 h-4 w-4" />
              Update Payment Status
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Payment Status</DialogTitle>
              <DialogDescription>
                Select a new payment status and add an optional note for order {row.order_number}
              </DialogDescription>
            </DialogHeader>
            <PaymentStatusForm 
              row={row} 
              queryClient={queryClient} 
            />
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Order Status Form Component (same as before)
function OrderStatusForm({ row, queryClient }: { row: any; queryClient: any }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderStatusOptions = [
    { value: "processing", label: "Processing", icon: <Clock className="h-4 w-4 mr-2" /> },
    { value: "confirmed", label: "Confirmed", icon: <CheckCircle className="h-4 w-4 mr-2" /> },
    { value: "shipped", label: "Shipped", icon: <Truck className="h-4 w-4 mr-2" /> },
    { value: "delivered", label: "Delivered", icon: <PackageCheck className="h-4 w-4 mr-2" /> },
    { value: "cancelled", label: "Cancelled", icon: <Ban className="h-4 w-4 mr-2" /> },
    { value: "refunded", label: "Refunded", icon: <RefreshCw className="h-4 w-4 mr-2" /> },
  ];

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error("Please select an order status");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = endpoints.orders.updateStatus.replace(":id", row.id);
      const payload = {
        status: selectedStatus,
        note: note.trim() || undefined
      };

      const response = await securityAxios.post(endpoint, payload);

      if (response.status !== 200) {
        throw new Error("Failed to update order status");
      }

      toast.success(response.data.message || "Order status updated successfully");
      queryClient.invalidateQueries({
        queryKey: [endpoints.orders.listOrders],
        exact: false
      });

      // Reset form
      setSelectedStatus("");
      setNote("");

    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update order status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="order-status">Order Status</Label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select order status" />
          </SelectTrigger>
          <SelectContent>
            {orderStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center">
                  {option.icon}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          placeholder="Add any notes about this order status change..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isSubmitting || !selectedStatus}
        >
          {isSubmitting ? "Updating..." : "Update Order Status"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// Payment Status Form Component (same as before)
function PaymentStatusForm({ row, queryClient }: { row: any; queryClient: any }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentStatusOptions = [
    { value: "pending", label: "Pending", icon: <Clock className="h-4 w-4 mr-2" /> },
    { value: "paid", label: "Paid", icon: <CircleDollarSign className="h-4 w-4 mr-2" /> },
    { value: "failed", label: "Failed", icon: <AlertCircle className="h-4 w-4 mr-2" /> },
    { value: "refunded", label: "Refunded", icon: <RefreshCw className="h-4 w-4 mr-2" /> },
  ];

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error("Please select a payment status");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = endpoints.orders.updatePaymentStatus.replace(":id", row.id);
      const payload = {
        payment_status: selectedStatus,
        note: note.trim() || undefined
      };

      const response = await securityAxios.post(endpoint, payload);

      if (response.status !== 200) {
        throw new Error("Failed to update payment status");
      }

      toast.success(response.data.message || "Payment status updated successfully");
      queryClient.invalidateQueries({
        queryKey: [endpoints.orders.listOrders],
        exact: false
      });

      // Reset form
      setSelectedStatus("");
      setNote("");

    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update payment status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="payment-status">Payment Status</Label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select payment status" />
          </SelectTrigger>
          <SelectContent>
            {paymentStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center">
                  {option.icon}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          placeholder="Add any notes about this payment status change..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isSubmitting || !selectedStatus}
        >
          {isSubmitting ? "Updating..." : "Update Payment Status"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function ListOrders() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [endpoints.orders.listOrders],
    queryFn: fetchOrders,
  });

  if (isLoading || isFetching) return <TableLoader />;

  if (isError) return (
    <AlertMessage variant="error" message={`${error?.message || "Failed to load orders"}`} />
  );

  return (
    <div>
      <DataTable 
        data={data.data.orders} 
        hiddenColumns={["id", "items", "shipping_address", "timestamps", "guest_info"]} 
        actionsDropdown={ActionsDropdown}
        badgesConfig={{
          status: {
            values: ["pending", "processing", "confirmed", "shipped", "delivered", "cancelled", "refunded"],
            variants: ["warning", "info", "success", "info", "success", "destructive", "secondary"],
          },
          payment_status: {
            values: ["pending", "paid", "failed", "refunded"],
            variants: ["warning", "success", "destructive", "secondary"],
          },
          payment_method: {
            values: ["credit_card", "paypal", "bank_transfer", "cash_on_delivery"],
            variants: ["info", "blue", "purple", "green"],
          },
        }} 
      />
    </div>
  );
}

export default ListOrders;