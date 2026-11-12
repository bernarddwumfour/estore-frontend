import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

export function hasValidRevalidationSecret(request: NextRequest): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || !authorization?.startsWith("Bearer ")) return false;

  const supplied = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
