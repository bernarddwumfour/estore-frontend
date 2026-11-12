import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));

import { POST } from "./route";

function request(categoriesChanged: unknown, secret = "test-secret") {
  return new NextRequest("http://localhost/api/revalidate/products", {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
    body: JSON.stringify({ categories_changed: categoriesChanged }),
  });
}

describe("product revalidation endpoint", () => {
  beforeEach(() => {
    process.env.REVALIDATE_SECRET = "test-secret";
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.REVALIDATE_SECRET;
  });

  it("rejects unauthorized and malformed requests", async () => {
    expect((await POST(request(false, "wrong"))).status).toBe(401);
    expect((await POST(request("true"))).status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refreshes product listings and the home collection", async () => {
    expect((await POST(request(false))).status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/products");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidateTag).not.toHaveBeenCalledWith("categories", { expire: 0 });
  });

  it("also refreshes category counts when membership changes", async () => {
    expect((await POST(request(true))).status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("categories", { expire: 0 });
  });
});
