import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { hasValidRevalidationSecret } from "../auth";

export const runtime = "nodejs";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

  const slugs = (body as { slugs?: unknown } | null)?.slugs;
  if (
    !Array.isArray(slugs) ||
    slugs.length > 100 ||
    !slugs.every((slug) => typeof slug === "string" && slug.length <= 220 && slugPattern.test(slug))
  ) {
    return NextResponse.json({ error: "Invalid slugs" }, { status: 400 });
  }

  revalidateTag("blog-posts", { expire: 0 });
  revalidatePath("/blog");
  for (const slug of new Set(slugs)) {
    revalidateTag(`blog-${slug}`, { expire: 0 });
    revalidatePath(`/blog/${slug}`);
  }

  return NextResponse.json({ revalidated: true, slugs: slugs.length });
}
