"use client";

import { useState, type FormEvent } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { useAuth } from "@/lib/use-auth";
import { AuthShell } from "@/templates/auth-shell";

export default function ChangePasswordPage() {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await securityAxios.post(endpoints.auth.changePassword, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (!response.data.success) throw new Error(response.data.error || "Could not change your password.");
      toast.success("Password changed. Please sign in again.");
      await logout();
    } catch (requestError) {
      const data = axios.isAxiosError(requestError) ? requestError.response?.data : null;
      const validationError = data?.errors?.new_password;
      setError(
        (Array.isArray(validationError) ? validationError[0] : validationError) ||
        data?.error || data?.message ||
        (requestError instanceof Error ? requestError.message : "Could not change your password.")
      );
    } finally {
      setIsSaving(false);
    }
  }

  return <AuthShell>
    <div className="mb-8 text-center">
      <h1 className="text-2xl font-semibold">Change password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Update the password for your account.</p>
    </div>
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2"><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" required value={newPassword} onChange={event => setNewPassword(event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSaving}>{isSaving ? "Saving..." : "Change password"}</Button>
    </form>
    <p className="mt-6 text-center text-sm"><Link href="/profile" className="underline underline-offset-4">Back to your profile</Link></p>
  </AuthShell>;
}
