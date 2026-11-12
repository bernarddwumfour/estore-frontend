import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { hasValidRevalidationSecret } from "../auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!hasValidRevalidationSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const categoriesChanged = (body as { categories_changed?: unknown } | null)?.categories_changed;
  if (typeof categoriesChanged !== "boolean") {
    return NextResponse.json({ error: "Invalid categories_changed" }, { status: 400 });
  }

  revalidateTag("products", { expire: 0 });
  revalidatePath("/products");
  revalidatePath("/");

  if (categoriesChanged) {
    revalidateTag("categories", { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, categories_changed: categoriesChanged });
}
