'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Home, ArrowLeft, ChevronLeft, Loader2 } from 'lucide-react';
import { useCartStore } from '@/app/lib/store/cart-store';
import { toast } from 'sonner'; // or your notification system
import { useAuth } from '@/lib/use-auth';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import unAuthenticatedAxios from '@/axios-instances/UnAuthenticatedAxios';
import { useRouter } from 'next/router';

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const router = useRouter()
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
      country: 'United States',
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
      country: 'United States',
    },

    // Order details
    payment_method: 'credit_card',
    shipping_method: 'standard',
    shipping_cost: 9.99,
    tax_rate: 8.0,
    discount_amount: 0,
    customer_note: '',
    currency: 'USD',
  });

  // Get cart state from Zustand
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  // Check if user is authenticated
  const { user, tokens } = useAuth(); // Your auth hook

  useEffect(() => {
    setIsMounted(true);

    // Pre-fill form with user data if authenticated
    if (user) {
      setFormData(prev => ({
        ...prev,
        // Don't set guest fields for authenticated users
        shipping_address: {
          ...prev.shipping_address,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
        }
      }));
    }
  }, [user,]);

  // Calculate totals
  const subtotal = getTotalPrice();
  const shipping = formData.shipping_cost;
  const tax = subtotal * (formData.tax_rate / 100);
  const total = subtotal + shipping + tax;

  // Handle form input changes
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      // Handle nested fields (shipping_address.first_name, etc.)
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Handle top-level fields
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
        country: 'United States',
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

      // Cart items (convert to API format)
      items: items.map(item => ({
        variant_id: item.variantId, // Make sure your cart items have variantId
        quantity: item.quantity,
        // NO unit_price field - server will get price from database
      })),
    };

    return orderData;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form first
      const validationError = validateForm();
      if (validationError) {
        toast.error(validationError);
        setIsLoading(false);
        return;
      }

      // Prepare order data
      const orderData = prepareOrderData();

      console.log("Submitting order:", orderData);

      // Make API call using securityAxios
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
          toast.success(apiResponse.message || "Order placed successfully!");

          // Clear cart on success
          clearCart();

          // Redirect to order confirmation page
          const orderId = apiResponse.data?.order?.id || apiResponse.data?.order_id;
          // router.push(`orders/${orderId}`)

        } else {
          // Handle API success=false but with error message
          toast.error(apiResponse.error || "Failed to place order");
        }
      } else {
        toast.error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);

      toast.error("Error Creating Order")
    } finally {
      setIsLoading(false);
    }

  }

  // Validate form
  const validateForm = () => {
    // Basic validation
    if (!user) {
      // Guest validation
      if (!formData.guest_email || !formData.guest_first_name || !formData.guest_last_name || !formData.guest_phone) {
        return 'Please fill all guest information fields';
      }
    }

    // Shipping address validation
    const shipping = formData.shipping_address;
    if (!shipping.first_name || !shipping.last_name || !shipping.phone || !shipping.email ||
      !shipping.address_line1 || !shipping.city || !shipping.state || !shipping.postal_code) {
      return 'Please fill all required shipping address fields';
    }

    // Billing address validation if separate
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
        {/* Page Header with Cart Link */}
        <div className="py-6 pb-12">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order securely</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-12">
              {/* Guest Information (only for non-logged in users) */}
              {!user && (
                <div className="bg-white border border-gray-100 rounded-lg p-8">
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
                        className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                        className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                        className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                        className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Information */}
              <div className="bg-white border border-gray-100 rounded-lg p-8">
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
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="+1234567890"
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
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 mb-3"
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
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select
                      name="shipping_address.country"
                      value={formData.shipping_address.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    >
                      <option value="Ghana">Ghana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region /State / Province *</label>
                    <input
                      type="text"
                      name="shipping_address.state"
                      required
                      value={formData.shipping_address.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal  Code *</label>
                    <input
                      type="text"
                      name="shipping_address.postal_code"
                      required
                      value={formData.shipping_address.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions (Optional)</label>
                    <textarea
                      name="shipping_address.instructions"
                      value={formData.shipping_address.instructions}
                      onChange={handleInputChange}
                      placeholder="Leave at door, call on arrival, etc."
                      className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                <div className="bg-white border border-gray-100 rounded-lg p-8">
                  <h2 className="text-2xl font-medium text-gray-900 mb-6">Billing Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Same fields as shipping address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="billing_address.first_name"
                        required
                        value={formData.billing_address.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                        className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                    </div>
                    {/* ... repeat all billing address fields ... */}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-white border border-gray-100 rounded-lg p-8">
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">Secure payment powered by Stripe</p>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                    <p className="text-gray-700 font-medium">Credit/Debit Card</p>
                    <div className="mt-4 space-y-3">
                      <input placeholder="Card number" className="w-full px-4 py-3 rounded-sm border border-gray-300" />
                      <div className="grid grid-cols-3 gap-3">
                        <input placeholder="MM/YY" className="px-4 py-3 rounded-sm border border-gray-300" />
                        <input placeholder="CVC" className="px-4 py-3 rounded-sm border border-gray-300" />
                        <input placeholder="ZIP" className="px-4 py-3 rounded-sm border border-gray-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-100 rounded-lg p-8 sticky top-32">
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-6 mb-8">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-sm border border-gray-200">
                        <Image
                          width={88}
                          height={88}
                          src={`${item.imageUrl}`}
                          alt={item.title}
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ${item.price.toFixed(2)} each</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax ({formData.tax_rate}%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Link to go back to cart */}
                <div className="mt-4 mb-6">
                  <Link
                    href="/cart"
                    className="block w-full text-center text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900 transition"
                  >
                    ← Return to Cart
                  </Link>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-4 py-7 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500 mt-6">
                  Secure checkout • 30-day returns • Free shipping on orders over $100
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}