import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));

import { POST } from "./route";

function request(secret: string) {
  return new NextRequest("http://localhost/api/revalidate/categories", {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });
}

describe("category revalidation endpoint", () => {
  beforeEach(() => {
    process.env.REVALIDATE_SECRET = "test-secret";
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.REVALIDATE_SECRET;
  });

  it("rejects an invalid secret", async () => {
    expect((await POST(request("wrong"))).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("invalidates category data and both category sections", async () => {
    expect((await POST(request("test-secret"))).status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("categories", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/products");
  });
});
