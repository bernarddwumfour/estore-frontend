import { authenticatedFetch } from "@/lib/server/backend";
import { endpoints } from "@/constants/endpoints/endpoints";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ChangePasswordLayout({ children }: { children: ReactNode }) {
  const response = await authenticatedFetch(endpoints.auth.getProfile);
  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new Error("Unable to verify your session. Please retry.");
  return children;
}
