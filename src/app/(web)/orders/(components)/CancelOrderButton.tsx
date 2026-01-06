'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CancelOrderButtonProps {
  orderId: string;
  orderNumber: string;
  status: string;
}

export default function CancelOrderButton({ orderId, orderNumber, status }: CancelOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Only show cancel button for cancellable statuses
  if (!(status === 'pending' || status === 'confirmed')) {
    return null;
  }

  const handleCancelOrder = async () => {
    if (!orderId) return;

    setIsCancelling(true);
    try {
      const response = await securityAxios.post(
        endpoints.orders.cancelOrder.replace(":id", orderId),
        {
          note: note.trim() || undefined
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to cancel order");
      }

      toast.success(response.data.message || "Order cancelled successfully");
      
      // Close dialog and reset
      setIsOpen(false);
      setNote('');
      
      // Refresh the page to update the orders list
      window.location.reload();
      
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={() => setIsOpen(true)}
      >
        Cancel Order
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order #{orderNumber}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="cancel-note">Reason for cancellation (Optional)</Label>
            <Textarea
              id="cancel-note"
              placeholder="Add a reason for cancelling this order..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              disabled={isCancelling}
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Order</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e:any) => {
                e.preventDefault();
                handleCancelOrder();
              }}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}