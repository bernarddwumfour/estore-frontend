import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ChangePasswordLayout({ children }: { children: ReactNode }) {
  const authCookie = (await cookies()).get("auth_data")?.value;
  if (!authCookie) redirect("/login");
  return children;
}
