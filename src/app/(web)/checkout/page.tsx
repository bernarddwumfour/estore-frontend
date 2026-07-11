'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Home, Loader2, CreditCard, Truck, Lock, MapPin, Phone, Mail, User, Package, ChevronRight, UserPlus, CheckCircle, Tag } from 'lucide-react';
import { useCartStore } from '@/app/lib/store/cart-store';
import { toast } from 'sonner';
import { useAuth } from '@/lib/use-auth';
import UnAuthenticatedAxios from '@/axios-instances/UnAuthenticatedAxios';
import SecurityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/templates/page-header';
import { formatCurrency } from '@/lib/currency';
import { storeRecentOrder } from '@/lib/orders/recent-order';

interface ShippingOption {
  id: string;
  name: string;
  carrier?: string;
  cost: number;
  estimated_days: string;
  is_free: boolean;
  reason?: string;
}

interface ShippingMeta {
  allowed_countries: { code: string; name: string }[];
  pickup_enabled: boolean;
}

interface CheckoutMeta {
  payment_methods: { id: string; name: string; description: string }[];
  default_payment_method: string | null;
  guest_checkout_enabled: boolean;
  min_order_value: string;
  tax_rate: string;
  tax_inclusive: boolean;
  currency: string;
}

interface PopularAddress {
  id: string;
  name: string;
  region: string;
  country: string;
  price: string;
  is_free: boolean;
}

interface GuestInfo {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface CartItem {
  id: string;
  sku: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  variantId: string;
  isBundle?: boolean;
  bundleId?: string;
  bundleName?: string;
  bundleItems?: Array<{
    id: string;
    sku: string;
    title: string;
    price: number;
    quantity: number;
    imageUrl: string;
    variantId: string;
  }>;
}

interface DiscountPreview {
  code: string;
  name: string;
  subtotal: number;
  discount_amount: number;
  subtotal_after_discount: number;
  is_affiliate_code: boolean;
}

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>('');
  const [shippingMeta, setShippingMeta] = useState<ShippingMeta | null>(null);
  const [checkoutMeta, setCheckoutMeta] = useState<CheckoutMeta | null>(null);
  const [popularAddresses, setPopularAddresses] = useState<PopularAddress[]>([]);
  const [selectedPopularId, setSelectedPopularId] = useState<string>('');
  const [shippingError, setShippingError] = useState<string>('');
  const [quoteNonce, setQuoteNonce] = useState(0);
  const [usePersonalInfoForShipping, setUsePersonalInfoForShipping] = useState(true);
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountPreview | null>(null);
  const router = useRouter();

  // Guest info state
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  // Form data matching the backend expected structure
  const [formData, setFormData] = useState({
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
      address_type: 'shipping',
    },
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
      address_type: 'billing',
    },
    payment_method: 'paystack',
    customer_note: '',
  });

  const items = useCartStore((state) => state.items) as CartItem[];
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Calculate totals
  const subtotal = getTotalPrice();
  const selectedShipping = shippingOptions.find(opt => opt.id === selectedShippingId);
  const selectedPopular = popularAddresses.find(addr => addr.id === selectedPopularId);
  const shippingCost = selectedPopular ? Number(selectedPopular.price) : (selectedShipping?.cost || 0);
  const taxRate = Number(checkoutMeta?.tax_rate || 0);
  const taxInclusive = checkoutMeta?.tax_inclusive === true;
  const tax = taxRate > 0 && !taxInclusive ? Math.round(subtotal * taxRate) / 100 : 0;
  const discountAmount = appliedDiscount?.discount_amount || 0;
  const total = Math.max(0, subtotal + shippingCost + tax - discountAmount);
  const minOrderValue = Number(checkoutMeta?.min_order_value || 0);
  const belowMinimum = minOrderValue > 0 && subtotal < minOrderValue;
  const guestBlocked = checkoutMeta?.guest_checkout_enabled === false && !isAuthenticated;

  useEffect(() => {
    setIsMounted(true);

    if (user) {
      const userData = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      };

      setGuestInfo(userData);

      setFormData(prev => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          ...userData,
        },
        billing_address: {
          ...prev.billing_address,
          ...userData,
        }
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated && usePersonalInfoForShipping) {
      setFormData(prev => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          first_name: guestInfo.first_name,
          last_name: guestInfo.last_name,
          email: guestInfo.email,
          phone: guestInfo.phone,
        }
      }));
    }
  }, [guestInfo, usePersonalInfoForShipping, isAuthenticated]);

  // Shipping metadata (allowed countries, pickup) — fetched once
  useEffect(() => {
    UnAuthenticatedAxios.get(endpoints.orders.shippingMeta)
      .then((response) => setShippingMeta(response.data?.data || null))
      .catch(() => setShippingMeta(null));
  }, []);

  // Checkout metadata (payment methods, tax, guest/min-order rules) — fetched once
  useEffect(() => {
    UnAuthenticatedAxios.get(endpoints.orders.checkoutMeta)
      .then((response) => {
        const meta: CheckoutMeta | null = response.data?.data || null;
        setCheckoutMeta(meta);
        if (meta?.default_payment_method) {
          setFormData((prev) =>
            meta.payment_methods.some((m) => m.id === prev.payment_method)
              ? prev
              : { ...prev, payment_method: meta.default_payment_method as string }
          );
        }
      })
      .catch(() => setCheckoutMeta(null));
  }, []);

  // Popular delivery addresses for the selected country
  useEffect(() => {
    const country = formData.shipping_address.country;
    if (!country) return;
    UnAuthenticatedAxios.get(
      `${endpoints.orders.shippingPopularAddresses}?country=${encodeURIComponent(country)}`
    )
      .then((response) => {
        const addresses: PopularAddress[] = response.data?.data?.addresses || [];
        setPopularAddresses(addresses);
        setSelectedPopularId((current) =>
          current && !addresses.some((a) => a.id === current) ? '' : current
        );
      })
      .catch(() => setPopularAddresses([]));
  }, [formData.shipping_address.country]);

  // Calculate shipping options when address changes
  useEffect(() => {
    const calculateShipping = async () => {
      const address = formData.shipping_address;
      const hasRequiredFields = address.country && address.city && address.address_line1;

      if (!hasRequiredFields || items.length === 0 || selectedPopularId) return;

      setIsCalculatingShipping(true);
      try {
        const shippingItems: any[] = [];

        for (const item of items) {
          if (item.isBundle && item.bundleItems) {
            for (const bundleItem of item.bundleItems) {
              shippingItems.push({
                variant_id: bundleItem.variantId,
                quantity: bundleItem.quantity * item.quantity,
              });
            }
          } else {
            shippingItems.push({
              variant_id: item.variantId,
              quantity: item.quantity,
            });
          }
        }

        // Shipping calculation doesn't need auth
        const response = await UnAuthenticatedAxios.post(endpoints.orders.shippingOptions, {
          country_code: address.country,
          state: address.state,
          city: address.city,
          postal_code: address.postal_code,
          address_line1: address.address_line1,
          items: shippingItems,
        });

        if (response.data.success) {
          const options = response.data.data.options;
          setShippingOptions(options);
          setShippingError('');
          if (options.length > 0 && !selectedShippingId) {
            setSelectedShippingId(options[0].id);
          }
        }
      } catch (error) {
        console.error('Error calculating shipping:', error);
        setShippingOptions([]);
        setSelectedShippingId('');
        const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setShippingError(
          message || 'Could not calculate shipping for this address. Please check the address and try again.'
        );
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    const debounceTimer = setTimeout(calculateShipping, 800);
    return () => clearTimeout(debounceTimer);
  }, [formData.shipping_address.country, formData.shipping_address.state, formData.shipping_address.city, formData.shipping_address.address_line1, formData.shipping_address.postal_code, items, selectedPopularId, quoteNonce]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShippingAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name.replace('shipping_address.', '');

    setFormData(prev => ({
      ...prev,
      shipping_address: {
        ...prev.shipping_address,
        [fieldName]: value
      }
    }));
  };

  const handleBillingSameAsShipping = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      use_separate_billing: !checked,
      billing_address: checked ? {
        ...prev.shipping_address,
        address_type: 'billing',
      } : {
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
        address_type: 'billing',
      }
    }));
  };

  const handleShippingOptionChange = (optionId: string) => {
    setSelectedShippingId(optionId);
  };

  const buildCheckoutItems = () => {
    const checkoutItems: any[] = [];
    for (const item of items) {
      if (item.isBundle && item.bundleId) {
        checkoutItems.push({
          is_bundle: true,
          bundle_id: item.bundleId,
          bundle_name: item.bundleName || item.title,
          price: item.price,
          quantity: item.quantity,
          bundle_items: item.bundleItems?.map(bundleItem => ({
            variant_id: bundleItem.variantId,
            quantity: bundleItem.quantity,
            is_free: bundleItem.price === 0,
            original_price: bundleItem.price,
          })) || [],
        });
      } else {
        checkoutItems.push({
          is_bundle: false,
          variant_id: item.variantId,
          quantity: item.quantity,
        });
      }
    }

    return checkoutItems;
  };

  const applyDiscountCode = async () => {
    const code = discountCodeInput.trim().toUpperCase();
    if (!code) {
      toast.error('Enter a discount code');
      return;
    }

    setIsApplyingDiscount(true);
    try {
      const response = await UnAuthenticatedAxios.post(endpoints.promotions.previewDiscountCode, {
        code,
        items: buildCheckoutItems(),
      });

      if (response.data.success) {
        setAppliedDiscount(response.data.data);
        setDiscountCodeInput(response.data.data.code);
        toast.success(`Code ${response.data.data.code} applied`);
      } else {
        setAppliedDiscount(null);
        toast.error(response.data.message || 'Unable to apply discount code');
      }
    } catch (error: any) {
      setAppliedDiscount(null);
      const message =
        error.response?.data?.errors?.discount_code ||
        error.response?.data?.message ||
        'Unable to apply discount code';
      toast.error(message);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const removeDiscountCode = () => {
    setAppliedDiscount(null);
    setDiscountCodeInput('');
  };

  // Prepare order data with bundle support
  const prepareOrderData = () => {
    const orderData: any = {
      shipping_address: {
        ...formData.shipping_address,
        address_type: 'shipping',
      },
      payment_method: formData.payment_method,
      shipping_method: selectedPopularId ? '' : (selectedShippingId || 'standard'),
      customer_note: formData.customer_note,
      items: buildCheckoutItems(),
    };

    if (selectedPopularId) {
      orderData.popular_address_id = selectedPopularId;
    }

    if (!isAuthenticated) {
      orderData.guest_info = {
        email: guestInfo.email,
        first_name: guestInfo.first_name,
        last_name: guestInfo.last_name,
        phone: guestInfo.phone,
      };
    }

    if (formData.use_separate_billing) {
      orderData.billing_address = {
        ...formData.billing_address,
        address_type: 'billing',
      };
    }

    if (appliedDiscount?.code) {
      orderData.discount_code = appliedDiscount.code;
    }

    return orderData;
  };

  const createOrder = async () => {
    setIsLoading(true);
    try {
      const orderData = prepareOrderData();
      console.log("Submitting order:", orderData);
      console.log("Is authenticated:", isAuthenticated);
      console.log("Using axios instance:", isAuthenticated ? "SecurityAxios" : "UnAuthenticatedAxios");

      // Use the appropriate axios instance based on authentication status
      const axiosInstance = isAuthenticated ? SecurityAxios : UnAuthenticatedAxios;

      const response = await axiosInstance.post(endpoints.orders.createOrder, orderData);

      if (response.status === 200 || response.status === 201) {
        const apiResponse = response.data;

        if (apiResponse.success) {
          clearCart();
          const order = apiResponse.data?.order;
          if (order) {
            storeRecentOrder({
              order,
              isAuthenticated,
              source: 'checkout',
              createdAt: new Date().toISOString(),
            });
          }

          if (formData.payment_method === 'paystack' && apiResponse.data?.payment?.authorization_url) {
            toast.success("Redirecting to payment...");
            handlePaystackPayment(apiResponse.data.payment.authorization_url);
          } else if (formData.payment_method === 'pod') {
            toast.success(apiResponse.message || "Order placed successfully!");
            const orderId = apiResponse.data?.order?.id;
            router.push(orderId ? `/order-placed?order_id=${orderId}` : '/order-placed');
          } else {
            toast.success(apiResponse.message || "Order placed successfully!");
            const orderId = apiResponse.data?.order?.id;
            router.push(orderId ? `/order-placed?order_id=${orderId}` : '/order-placed');
          }
        } else {
          toast.error(apiResponse.error || "Failed to place order");
        }
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      const errors = error.response?.data?.errors;
      if (errors?.shipping_method || errors?.popular_address_id) {
        // The selected rate/delivery area is stale — re-quote and let the user re-pick
        toast.error(errors.shipping_method || errors.popular_address_id);
        setSelectedShippingId('');
        setSelectedPopularId('');
        setQuoteNonce((n) => n + 1);
      } else if (errors) {
        Object.values(errors).forEach((err: any) => {
          toast.error(typeof err === 'string' ? err : err.payment_method || err.items || "Validation error");
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to create order. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackPayment = (authorizationUrl: string) => {
    window.location.href = authorizationUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    await createOrder();
  };

  const validateForm = () => {
    if (!isAuthenticated) {
      if (!guestInfo.first_name || !guestInfo.last_name) {
        return 'Please enter your first name and last name';
      }
      if (!guestInfo.email || !guestInfo.email.includes('@')) {
        return 'Please enter a valid email address';
      }
    }

    const shipping = formData.shipping_address;
    if (!shipping.first_name || !shipping.last_name || !shipping.phone || !shipping.email ||
      !shipping.address_line1 || !shipping.city || !shipping.state || !shipping.postal_code) {
      return 'Please fill all required shipping address fields';
    }

    if (!selectedPopularId && !selectedShippingId) {
      return 'Please select a shipping method or delivery area';
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
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <div className="space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link href="/products"><Home className="mr-2 h-5 w-5" /> Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader subtitle="Checkout" title="Complete Your Order Securely" />
      <div className="container mx-auto px-4 py-12">

        {/* Guest checkout info banner */}
        {!isAuthenticated && guestBlocked && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">Sign in required</p>
                <p className="text-sm text-red-600">
                  Guest checkout is currently disabled.{' '}
                  <Link href="/login" className="underline font-medium">Sign in</Link> or{' '}
                  <Link href="/signup" className="underline font-medium">create an account</Link> to place your order.
                </p>
              </div>
            </div>
          </div>
        )}
        {!isAuthenticated && !guestBlocked && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Checking out as a guest?</p>
                <p className="text-sm text-blue-600">Fill in your details below and we'll create a guest account for you. You can register later to track your orders.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest Information Section */}
              {!isAuthenticated && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" /> Your Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        name="first_name"
                        placeholder="First Name *"
                        value={guestInfo.first_name}
                        onChange={handleGuestInfoChange}
                        required
                        className="h-12 text-base"
                      />
                      <Input
                        name="last_name"
                        placeholder="Last Name *"
                        value={guestInfo.last_name}
                        onChange={handleGuestInfoChange}
                        required
                        className="h-12 text-base"
                      />
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email Address *"
                        value={guestInfo.email}
                        onChange={handleGuestInfoChange}
                        required
                        className="h-12 text-base"
                      />
                      <Input
                        name="phone"
                        placeholder="Phone Number *"
                        value={guestInfo.phone}
                        onChange={handleGuestInfoChange}
                        className="h-12 text-base"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      We'll use this information to create your guest account and send order updates.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Shipping Address */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" /> Shipping Address
                    </h2>
                    {!isAuthenticated && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="usePersonalInfo"
                          checked={usePersonalInfoForShipping}
                          onCheckedChange={(checked) => setUsePersonalInfoForShipping(checked as boolean)}
                        />
                        <Label
                          htmlFor="usePersonalInfo"
                          className="text-sm cursor-pointer text-gray-600 hover:text-gray-800"
                        >
                          Use my personal information
                        </Label>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="shipping_address.first_name"
                      placeholder="First Name *"
                      value={formData.shipping_address.first_name}
                      onChange={handleShippingAddressChange}
                      required
                      className="h-12 text-base"
                      disabled={!isAuthenticated && usePersonalInfoForShipping}
                    />
                    <Input
                      name="shipping_address.last_name"
                      placeholder="Last Name *"
                      value={formData.shipping_address.last_name}
                      onChange={handleShippingAddressChange}
                      required
                      className="h-12 text-base"
                      disabled={!isAuthenticated && usePersonalInfoForShipping}
                    />
                    <Input
                      name="shipping_address.email"
                      type="email"
                      placeholder="Email *"
                      value={formData.shipping_address.email}
                      onChange={handleShippingAddressChange}
                      required
                      className="h-12 text-base"
                      disabled={!isAuthenticated && usePersonalInfoForShipping}
                    />
                    <Input
                      name="shipping_address.phone"
                      placeholder="Phone *"
                      value={formData.shipping_address.phone}
                      onChange={handleShippingAddressChange}
                      required
                      className="h-12 text-base"
                      disabled={!isAuthenticated && usePersonalInfoForShipping}
                    />
                    <div className="md:col-span-2">
                      <Input
                        name="shipping_address.address_line1"
                        placeholder="Street Address *"
                        value={formData.shipping_address.address_line1}
                        onChange={handleShippingAddressChange}
                        required
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        name="shipping_address.address_line2"
                        placeholder="Apartment, suite, unit (Optional)"
                        value={formData.shipping_address.address_line2}
                        onChange={handleShippingAddressChange}
                        className="h-12 text-base"
                      />
                    </div>
                    <Input
                      name="shipping_address.city"
                      placeholder="City *"
                      value={formData.shipping_address.city}
                      onChange={handleShippingAddressChange}
                      required
                      className="h-12 text-base"
                    />
                    <Input
                      name="shipping_address.state"
                      placeholder="State/Province *"
                      value={formData.shipping_address.state}
                      onChange={handleShippingAddressChange}
                      required
                      className="h-12 text-base"
                    />
                    <Input
                      name="shipping_address.postal_code"
                      placeholder="Postal Code *"
                      value={formData.shipping_address.postal_code}
                      onChange={handleShippingAddressChange}
                      required
                      className="h-12 text-base"
                    />
                    <select
                      name="shipping_address.country"
                      value={formData.shipping_address.country}
                      onChange={handleShippingAddressChange}
                      className="w-full h-12 px-3 border rounded-md text-base bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {shippingMeta?.allowed_countries?.length ? (
                        shippingMeta.allowed_countries.map((country) => (
                          <option key={country.code} value={country.name}>{country.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="Ghana">Ghana</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="Kenya">Kenya</option>
                          <option value="South Africa">South Africa</option>
                        </>
                      )}
                    </select>
                    <div className="md:col-span-2">
                      <Textarea
                        name="shipping_address.instructions"
                        placeholder="Delivery Instructions (Optional)"
                        value={formData.shipping_address.instructions}
                        onChange={handleShippingAddressChange}
                        rows={2}
                        className="text-base"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!formData.use_separate_billing}
                        onChange={(e) => handleBillingSameAsShipping(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Billing address is the same as shipping</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              {formData.use_separate_billing && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" /> Billing Address
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        name="billing_address.first_name"
                        placeholder="First Name *"
                        value={formData.billing_address.first_name}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-base"
                      />
                      <Input
                        name="billing_address.last_name"
                        placeholder="Last Name *"
                        value={formData.billing_address.last_name}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-base"
                      />
                      <Input
                        name="billing_address.email"
                        type="email"
                        placeholder="Email *"
                        value={formData.billing_address.email}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-base"
                      />
                      <Input
                        name="billing_address.phone"
                        placeholder="Phone *"
                        value={formData.billing_address.phone}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-base"
                      />
                      <div className="md:col-span-2">
                        <Input
                          name="billing_address.address_line1"
                          placeholder="Street Address *"
                          value={formData.billing_address.address_line1}
                          onChange={handleInputChange}
                          required
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          name="billing_address.address_line2"
                          placeholder="Apartment, suite, unit (Optional)"
                          value={formData.billing_address.address_line2}
                          onChange={handleInputChange}
                          className="h-12 text-base"
                        />
                      </div>
                      <Input
                        name="billing_address.city"
                        placeholder="City *"
                        value={formData.billing_address.city}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-base"
                      />
                      <Input
                        name="billing_address.state"
                        placeholder="State/Province *"
                        value={formData.billing_address.state}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-base"
                      />
                      <Input
                        name="billing_address.postal_code"
                        placeholder="Postal Code *"
                        value={formData.billing_address.postal_code}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-base"
                      />
                      <select
                        name="billing_address.country"
                        value={formData.billing_address.country}
                        onChange={handleInputChange}
                        className="w-full h-12 px-3 border rounded-md text-base bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="Ghana">Ghana</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="South Africa">South Africa</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Popular delivery areas */}
              {popularAddresses.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                      <MapPin className="h-5 w-5" /> Delivery Area
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Deliver to a popular location near you — or use your own address below.
                    </p>
                    <select
                      value={selectedPopularId}
                      onChange={(e) => setSelectedPopularId(e.target.value)}
                      className="w-full h-12 px-3 border rounded-md text-base bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="">My address isn&apos;t listed — use my address</option>
                      {popularAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.name} ({addr.region}) — {addr.is_free ? 'Free delivery' : formatCurrency(Number(addr.price))}
                        </option>
                      ))}
                    </select>
                    {selectedPopular && (
                      <p className="mt-3 text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Delivering to {selectedPopular.name} — {selectedPopular.is_free ? 'free of charge' : formatCurrency(Number(selectedPopular.price))}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Shipping Options */}
              {!selectedPopularId && (shippingOptions.length > 0 || isCalculatingShipping || shippingError) && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Truck className="h-5 w-5" /> Shipping Options
                    </h2>
                    {isCalculatingShipping ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : shippingError ? (
                      <div className="text-center py-4 space-y-3">
                        <p className="text-sm text-red-600">{shippingError}</p>
                        <Button type="button" variant="outline" onClick={() => setQuoteNonce((n) => n + 1)}>
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <RadioGroup value={selectedShippingId} onValueChange={handleShippingOptionChange} className="space-y-3">
                        {shippingOptions.map((option) => (
                          <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <Label htmlFor={option.id} className="cursor-pointer">
                                <div>
                                  <p className="font-medium text-base">{option.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {option.carrier && option.carrier !== option.name ? `${option.carrier} · ` : ''}
                                    Estimated: {option.estimated_days}
                                  </p>
                                  {option.is_free && option.reason && (
                                    <p className="text-xs text-green-600 mt-0.5">{option.reason}</p>
                                  )}
                                </div>
                              </Label>
                            </div>
                            <div className="text-right">
                              {option.is_free ? (
                                <Badge variant="outline" className="text-green-600 border-green-600 px-3 py-1">Free</Badge>
                              ) : (
                                <span className="font-medium text-base">{formatCurrency(option.cost)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Payment Method
                  </h2>
                  <RadioGroup value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))} className="space-y-3">
                    {(checkoutMeta?.payment_methods ?? [
                      { id: 'paystack', name: 'Paystack', description: 'Pay with card, mobile money, or bank transfer' },
                      { id: 'pod', name: 'Pay on Delivery', description: 'Pay when your order arrives' },
                    ]).map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="cursor-pointer">
                            <p className="font-medium text-base">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </Label>
                        </div>
                        {method.id === 'pod' && (
                          <Badge variant="outline" className="text-green-600 border-green-600 px-3 py-1">No upfront payment</Badge>
                        )}
                      </div>
                    ))}
                    {checkoutMeta?.payment_methods?.length === 0 && (
                      <p className="text-sm text-red-600">No payment methods are currently available. Please try again later.</p>
                    )}
                  </RadioGroup>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="h-4 w-4" />
                      <span>Your payment information is secure. We use industry-standard encryption.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6">
                    {items.map((item) => (
                      <div key={item.sku} className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm flex items-center gap-1">
                            {item.title}
                            {item.isBundle && (
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                                Bundle
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                          {item.isBundle && item.bundleItems && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                                Includes {item.bundleItems.length} items
                              </summary>
                              <div className="mt-1 space-y-1">
                                {item.bundleItems.map((bItem, idx) => (
                                  <p key={idx} className="text-xs text-gray-500 ml-2">
                                    • {bItem.title} x{bItem.quantity}
                                    {bItem.price === 0 && <span className="text-emerald-600 ml-1">(FREE)</span>}
                                  </p>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="space-y-2 pb-3 border-b">
                      <Label htmlFor="discount-code" className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Discount Code
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="discount-code"
                          value={discountCodeInput}
                          onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="h-10"
                        />
                        {appliedDiscount ? (
                          <Button type="button" variant="outline" onClick={removeDiscountCode}>
                            Remove
                          </Button>
                        ) : (
                          <Button type="button" variant="outline" onClick={applyDiscountCode} disabled={isApplyingDiscount}>
                            {isApplyingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                          </Button>
                        )}
                      </div>
                      {appliedDiscount && (
                        <p className="text-xs text-emerald-700">
                          {appliedDiscount.code} applied.
                          {appliedDiscount.is_affiliate_code ? ' Affiliate discount active.' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-sm text-emerald-700">
                        <span>Discount ({appliedDiscount.code})</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Tax ({taxRate}%)</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                    )}
                    {taxInclusive && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Tax{taxRate > 0 ? ` (${taxRate}%)` : ''}</span>
                        <span>Included in prices</span>
                      </div>
                    )}
                    {belowMinimum && (
                      <p className="text-xs text-red-600 pt-1">
                        Minimum order value is {formatCurrency(minOrderValue)}. Add {formatCurrency(minOrderValue - subtotal)} more to check out.
                      </p>
                    )}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Textarea
                      name="customer_note"
                      placeholder="Order notes (optional)"
                      value={formData.customer_note}
                      onChange={handleInputChange}
                      rows={2}
                      className="text-base"
                    />
                    <Button
                      type="submit"
                      className="w-full h-12 text-base"
                      size="lg"
                      disabled={isLoading || isCalculatingShipping || isApplyingDiscount || (!selectedShippingId && !selectedPopularId) || belowMinimum || guestBlocked}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                      ) : (
                        !isAuthenticated ? 'Place Order as Guest' : (formData.payment_method === 'pod' ? 'Place Order (Pay on Delivery)' : 'Proceed to Payment')
                      )}
                    </Button>
                  </div>

                  <div className="mt-4 text-center">
                    <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-700 underline">← Return to Cart</Link>
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
