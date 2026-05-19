'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Home, ArrowLeft, ChevronLeft, Loader2, CreditCard, Truck, Lock } from 'lucide-react';
import { useCartStore } from '@/app/lib/store/cart-store';
import { toast } from 'sonner';
import { useAuth } from '@/lib/use-auth';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import unAuthenticatedAxios from '@/axios-instances/UnAuthenticatedAxios';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Guest fields (for non-authenticated users)
    guest_email: '',
    guest_first_name: '',
    guest_last_name: '',
    guest_phone: '',

    // Shipping address (REQUIRED for all users)
    shipping_address: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Ghana',
      instructions: '',
    },

    // Billing address
    use_separate_billing: false,
    billing_address: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Ghana',
    },

    // Order details
    payment_method: 'paystack', // 'paystack' or 'pod'
    shipping_method: 'standard',
    shipping_cost: 9.99,
    tax_rate: 8.0,
    discount_amount: 0,
    customer_note: '',
    currency: 'GHS',
  });

  // Get cart state from Zustand
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);

    // Pre-fill form with user data if authenticated
    if (user) {
      setFormData(prev => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
        }
      }));
    }
  }, [user]);

  // Calculate totals
  const subtotal = getTotalPrice();
  const shipping = formData.shipping_cost;
  const tax = subtotal * (formData.tax_rate / 100);
  const total = subtotal + shipping + tax;

  // Handle form input changes
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle billing same as shipping toggle
  const handleBillingSameAsShipping = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      use_separate_billing: !checked,
      billing_address: checked ? prev.shipping_address : {
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Ghana',
      }
    }));
  };

  // Prepare order data for API
  const prepareOrderData = () => {
    const orderData = {
      // Guest fields (only if not authenticated)
      ...(!user && {
        guest_email: formData.guest_email,
        guest_first_name: formData.guest_first_name,
        guest_last_name: formData.guest_last_name,
        guest_phone: formData.guest_phone,
      }),

      // Shipping address (always required)
      shipping_address: {
        ...formData.shipping_address,
        address_type: 'shipping',
      },

      // Billing address if different
      ...(formData.use_separate_billing && {
        billing_address: {
          ...formData.billing_address,
          address_type: 'billing',
        }
      }),

      // Order details
      payment_method: formData.payment_method,
      shipping_method: formData.shipping_method,
      shipping_cost: shipping,
      tax_rate: formData.tax_rate,
      discount_amount: formData.discount_amount,
      customer_note: formData.customer_note,
      currency: formData.currency,

      // Cart items
      items: items.map(item => ({
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
    };

    return orderData;
  };

  // Handle Paystack payment redirect
  const handlePaystackPayment = (authorizationUrl: string) => {
    window.location.href = authorizationUrl;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validationError = validateForm();
      if (validationError) {
        toast.error(validationError);
        setIsLoading(false);
        return;
      }

      const orderData = prepareOrderData();
      console.log("Submitting order:", orderData);

      const response = user ? await securityAxios.post(
        endpoints.orders.createOrder,
        orderData
      ) : await unAuthenticatedAxios.post(
        endpoints.orders.createOrder,
        orderData
      );

      console.log("Order API Response:", response.data);

      if (response.status === 200 || response.status === 201) {
        const apiResponse = response.data;

        if (apiResponse.success) {
          // Clear cart on success
          clearCart();

          // Handle different payment methods
          if (formData.payment_method === 'paystack' && apiResponse.data?.payment?.authorization_url) {
            // Redirect to Paystack payment page
            toast.success("Redirecting to payment...");
            handlePaystackPayment(apiResponse.data.payment.authorization_url);
          } else if (formData.payment_method === 'pod') {
            // Pay on Delivery - redirect to order confirmation
            toast.success(apiResponse.message || "Order placed successfully!");
            const orderId = apiResponse.data?.order?.id;
            if (orderId) {
              router.push(`/orders/${orderId}/confirmation`);
            } else {
              router.push('/orders');
            }
          } else {
            // Other payment methods or fallback
            toast.success(apiResponse.message || "Order placed successfully!");
            const orderId = apiResponse.data?.order?.id;
            if (orderId) {
              router.push(`/orders/${orderId}`);
            } else {
              router.push('/orders');
            }
          }
        } else {
          toast.error(apiResponse.error || "Failed to place order");
        }
      } else {
        toast.error(`Unexpected status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error creating order:", error);

      // Handle specific error messages from backend
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.values(errors).forEach((err: any) => {
          if (typeof err === 'string') {
            toast.error(err);
          } else if (err.payment_method) {
            toast.error(err.payment_method);
          } else if (err.items) {
            toast.error(err.items);
          }
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create order. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!user) {
      if (!formData.guest_email || !formData.guest_first_name || !formData.guest_last_name || !formData.guest_phone) {
        return 'Please fill all guest information fields';
      }
    }

    const shipping = formData.shipping_address;
    if (!shipping.first_name || !shipping.last_name || !shipping.phone || !shipping.email ||
      !shipping.address_line1 || !shipping.city || !shipping.state || !shipping.postal_code) {
      return 'Please fill all required shipping address fields';
    }

    if (formData.use_separate_billing) {
      const billing = formData.billing_address;
      if (!billing.first_name || !billing.last_name || !billing.phone || !billing.email ||
        !billing.address_line1 || !billing.city || !billing.state || !billing.postal_code) {
        return 'Please fill all required billing address fields';
      }
    }

    return null;
  };

  // Empty cart state
  if (isMounted && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <div className="space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link href="/products">
                  <Home className="mr-2 h-5 w-5" />
                  Browse Products
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="max-w-xl space-y-4">
          <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
            Checkout
          </h2>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Complete Your Order{" "}
            <span className="text-slate-950 relative inline-block">
              Securely
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-slate-950/0 via-slate-950/40 to-slate-950/0 blur-xs"></span>
            </span>
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-12">
              {/* Guest Information (only for non-logged in users) */}
              {!user && (
                <div className="bg-white border border-gray-100 rounded-lg p-4 md:p-8">
                  <h2 className="text-2xl font-medium text-gray-900 mb-6">Your Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="guest_first_name"
                        required
                        value={formData.guest_first_name}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="guest_last_name"
                        required
                        value={formData.guest_last_name}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="guest_email"
                        required
                        value={formData.guest_email}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="guest_phone"
                        required
                        value={formData.guest_phone}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                        placeholder="+233XXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Information */}
              <div className="bg-white border border-gray-100 rounded-lg p-4 md:p-8">
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="shipping_address.first_name"
                      required
                      value={formData.shipping_address.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="shipping_address.last_name"
                      required
                      value={formData.shipping_address.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="shipping_address.email"
                      required
                      value={formData.shipping_address.email}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="shipping_address.phone"
                      required
                      value={formData.shipping_address.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="+233XXXXXXXXX"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      name="shipping_address.address_line1"
                      required
                      value={formData.shipping_address.address_line1}
                      onChange={handleInputChange}
                      placeholder="Street address"
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 mb-3"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      name="shipping_address.address_line2"
                      value={formData.shipping_address.address_line2}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, etc."
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="shipping_address.city"
                      required
                      value={formData.shipping_address.city}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region / State *</label>
                    <input
                      type="text"
                      name="shipping_address.state"
                      required
                      value={formData.shipping_address.state}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      name="shipping_address.postal_code"
                      required
                      value={formData.shipping_address.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select
                      name="shipping_address.country"
                      value={formData.shipping_address.country}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    >
                      <option value="Ghana">Ghana</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions (Optional)</label>
                    <textarea
                      name="shipping_address.instructions"
                      value={formData.shipping_address.instructions}
                      onChange={handleInputChange}
                      placeholder="Leave at door, call on arrival, etc."
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Billing same as shipping checkbox */}
                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      onChange={(e) => handleBillingSameAsShipping(e.target.checked)}
                      className="mr-3 h-5 w-5 rounded border-gray-300"
                    />
                    <span className="text-gray-700">Billing address is the same as shipping</span>
                  </label>
                </div>
              </div>

              {/* Billing Information (if different from shipping) */}
              {formData.use_separate_billing && (
                <div className="bg-white border border-gray-100 rounded-lg p-4 md:p-8">
                  <h2 className="text-2xl font-medium text-gray-900 mb-6">Billing Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="billing_address.first_name"
                        required
                        value={formData.billing_address.first_name}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="billing_address.last_name"
                        required
                        value={formData.billing_address.last_name}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="billing_address.email"
                        required
                        value={formData.billing_address.email}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        name="billing_address.phone"
                        required
                        value={formData.billing_address.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                      <input
                        type="text"
                        name="billing_address.address_line1"
                        required
                        value={formData.billing_address.address_line1}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        name="billing_address.address_line2"
                        value={formData.billing_address.address_line2}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        name="billing_address.city"
                        required
                        value={formData.billing_address.city}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Region / State *</label>
                      <input
                        type="text"
                        name="billing_address.state"
                        required
                        value={formData.billing_address.state}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                      <input
                        type="text"
                        name="billing_address.postal_code"
                        required
                        value={formData.billing_address.postal_code}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <select
                        name="billing_address.country"
                        value={formData.billing_address.country}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      >
                        <option value="Ghana">Ghana</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="bg-white border border-gray-100 rounded-lg p-4 md:p-8">
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Payment Method</h2>
                <RadioGroup
                  value={formData.payment_method}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, payment_method: value }))}
                  className="space-y-4"
                >
                  {/* Paystack Option */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <div className="flex items-center gap-4">
                      <RadioGroupItem value="paystack" id="paystack" />
                      <Label htmlFor="paystack" className="flex items-center gap-3 cursor-pointer">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Paystack</p>
                          <p className="text-sm text-gray-500">Pay with card, mobile money, or bank transfer</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <img src="/paystack-badge.svg" alt="Paystack" className="h-8" />
                    </div>
                  </div>

                  {/* Pay on Delivery Option */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <div className="flex items-center gap-4">
                      <RadioGroupItem value="pod" id="pod" />
                      <Label htmlFor="pod" className="flex items-center gap-3 cursor-pointer">
                        <Truck className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Pay on Delivery</p>
                          <p className="text-sm text-gray-500">Pay when your order arrives</p>
                        </div>
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      No upfront payment
                    </Badge>
                  </div>
                </RadioGroup>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="h-4 w-4" />
                    <span>Your payment information is secure. We use industry-standard encryption.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-32">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image
                            width={64}
                            height={64}
                            src={item.imageUrl}
                            alt={item.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-xs font-medium">${item.price.toFixed(2)} each</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax ({formData.tax_rate}%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        formData.payment_method === 'pod' ? 'Place Order (Pay on Delivery)' : 'Proceed to Payment'
                      )}
                    </Button>
                  </div>

                  <div className="mt-4 text-center">
                    <Link
                      href="/cart"
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      ← Return to Cart
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Missing imports
import { Badge } from '@/components/ui/badge';