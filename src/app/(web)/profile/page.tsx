'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Shield,
  Package,
  LogOut,
  Edit3,
  Home,
  ShoppingCart,
  Building
} from "lucide-react";
import Spinner from "@/widgets/loaders/Spinner";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  phone: string;
  is_verified: boolean;
  email_verified: boolean;
  email_verified_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  address: string;
  address_city: string;
  address_country: string;
  address_postal_code: string;
  default_address: any | null;
}

interface AddressData {
  address_line1: string;
  address_line2: string;
  city: string;
  country: string;
  postal_code: string;
  state: string;
  instructions: string;
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    country: "",
    postal_code: "",
    state: "",
    instructions: ""
  });

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await securityAxios.get(endpoints.auth.getProfile);

      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);

        // Initialize form data with user data
        const defaultAddress = userData.default_address;

        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone: userData.phone || "",
          address_line1: defaultAddress?.address_line1 || "",
          address_line2: defaultAddress?.address_line2 || "",
          city: defaultAddress?.city || userData.address_city || "",
          country: defaultAddress?.country || userData.address_country || "",
          postal_code: defaultAddress?.postal_code || userData.address_postal_code || "",
          state: defaultAddress?.state || "",
          instructions: defaultAddress?.instructions || ""
        });
      } else {
        toast.error(response.data.error || "Failed to load profile");
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      if (error?.response?.status === 401) {
        toast.error("Please login to view your profile");
      } else {
        toast.error(error?.response?.data?.message || "Failed to load profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Prepare payload - only send changed fields
      const payload: any = {};

      // User fields
      if (formData.first_name !== user?.first_name) payload.first_name = formData.first_name;
      if (formData.last_name !== user?.last_name) payload.last_name = formData.last_name;
      if (formData.phone !== user?.phone) payload.phone = formData.phone;

      // Address fields
      const addressFields = ["address_line1", "address_line2", "city", "country", "postal_code", "state", "instructions"];
      const hasAddressChanges = addressFields.some(field =>
        formData[field as keyof typeof formData] !== (user?.default_address?.[field] || "")
      );

      if (hasAddressChanges) {
        // Create address data object
        const addressData: any = {};
        addressFields.forEach(field => {
          const value = formData[field as keyof typeof formData];
          if (value) addressData[field] = value;
        });
        payload.address_data = addressData;
      }

      console.log("Sending payload:", payload);

      const response = await securityAxios.put(endpoints.auth.updateProfile, payload);

      if (response.data.success) {
        toast.success(response.data.message || "Profile updated successfully");

        // Refresh user data
        fetchProfile();
        setIsEditing(false);
      } else {
        toast.error(response.data.error || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);

      // Handle validation errors
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors)[0];
        if (Array.isArray(firstError)) {
          toast.error(firstError[0]);
        } else {
          toast.error(firstError as string);
        }
      } else if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      const defaultAddress = user.default_address;
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        address_line1: defaultAddress?.address_line1 || "",
        address_line2: defaultAddress?.address_line2 || "",
        city: defaultAddress?.city || user.address_city || "",
        country: defaultAddress?.country || user.address_country || "",
        postal_code: defaultAddress?.postal_code || user.address_postal_code || "",
        state: defaultAddress?.state || "",
        instructions: defaultAddress?.instructions || ""
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Loading State
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-32">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <User className="h-24 w-24 text-gray-300 mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-xl text-gray-600 mb-10">
              Unable to load your profile. Please try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/" onClick={() => window.location.reload()}>
                  <Home className="mr-2 h-5 w-5" />
                  Try Again
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Continue Shopping
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
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-lg text-gray-600">Manage your account and personal information</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - User Info & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border border-gray-100 shadow-none ">
              <CardHeader className="text-center">
                <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
                <CardTitle className="text-2xl">{user?.full_name}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {user?.is_verified && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified Account
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    <Shield className="h-3 w-3 mr-1" />
                    {user && (user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Customer')}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/orders">
                      <Package className="mr-2 h-5 w-5" />
                      My Orders
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full" size="lg">
                    <Link href="/change-password">
                      Change Password
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="bg-white border border-gray-100 shadow-none ">
              <CardHeader>
                <CardTitle className="text-lg">Account Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">
                    {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login</span>
                  <span className="font-medium">
                    {user?.last_login ? formatDate(user.last_login) : 'Not available'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Verified</span>
                  <span className={`font-medium flex items-center gap-1 ${user?.is_verified ? 'text-green-600' : 'text-amber-600'}`}>
                    <CheckCircle className="h-4 w-4" />
                    {user?.is_verified ? 'Yes' : 'No'}
                  </span>
                </div>
                {user?.email_verified_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified On</span>
                    <span className="font-medium">
                      {formatDate(user.email_verified_at)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Editable Details */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-gray-100 shadow-none ">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Spinner size="sm" white />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      className={`${!isEditing ? "border-0 outline-0 shadow-none mt-2 p-0 bg-transparent" : "mt-2"}`}
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      className={`${!isEditing ? "border-0 outline-0 shadow-none mt-2 p-0 bg-transparent" : "mt-2"}`}
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      className="border-0 outline-0 shadow-none mt-2 p-0 bg-transparent"
                      value={user?.email || ''}
                      disabled
                    />
                    {user?.is_verified && (
                      <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Verified
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      className={`${!isEditing ? "border-0 outline-0 shadow-none mt-2 p-0 bg-transparent" : "mt-2"}`}
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <Label>Street Address 1</Label>
                      <Input
                        className={`${!isEditing ? "border-0 outline-0 shadow-none mt-2 p-0 bg-transparent" : "mt-2"}`}
                        name="address_line1"
                        placeholder="Enter your street address"
                        value={formData.address_line1}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Street Address 2 (Optional)</Label>
                      <Input
                        className={`${!isEditing ? "border-0 outline-0 shadow-none mt-2 p-0 bg-transparent" : "mt-2"}`}
                        name="address_line2"
                        placeholder="Apartment, suite, unit, etc."
                        value={formData.address_line2}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>City</Label>
                      <Input
                        className={`${!isEditing ? "border-0 outline-0 shadow-none mt-2 p-0 bg-transparent" : "mt-2"}`}
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>State/Province</Label>
                      <Input
                        className={`${!isEditing ? "border-0 outline-0 shadow-none mt-2 p-0 bg-transparent" : "mt-2"}`}
                        name="state"
                        placeholder="State or Province"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>Postal Code</Label>
                      <Input
                        className={`${!isEditing ? "border-0 outline-0 shadow-none mt-2 p-0 bg-transparent" : "mt-2"}`}
                        name="postal_code"
                        placeholder="Postal Code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>Country</Label>
                      <Input
                        className={`${!isEditing ? "border-0 outline-0 shadow-none mt-2 p-0 bg-transparent" : "mt-2"}`}
                        name="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4" />
                      Delivery Instructions (Optional)
                    </Label>
                    <textarea
                      className={`w-full min-h-[80px] rounded-md border ${!isEditing ? "border-0 outline-0 shadow-none p-0 bg-transparent" : "border-input p-3"} ${!isEditing ? "resize-none" : ""}`}
                      name="instructions"
                      placeholder="Any special delivery instructions?"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      style={!isEditing ? { minHeight: 'auto', overflow: 'hidden' } : {}}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}