import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { hasValidRevalidationSecret } from "../auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!hasValidRevalidationSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("categories", { expire: 0 });
  revalidatePath("/products");
  revalidatePath("/");

  return NextResponse.json({ revalidated: true });
}
