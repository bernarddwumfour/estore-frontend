import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));

import { POST } from "./route";

function request(slugs: unknown, secret = "test-secret") {
  return new NextRequest("http://localhost/api/revalidate/blog", {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
    body: JSON.stringify({ slugs }),
  });
}

describe("blog revalidation endpoint", () => {
  beforeEach(() => {
    process.env.REVALIDATE_SECRET = "test-secret";
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.REVALIDATE_SECRET;
  });

  it("rejects an invalid secret without invalidating", async () => {
    expect((await POST(request(["post"], "wrong"))).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects invalid slugs", async () => {
    expect((await POST(request(["../other-page"]))).status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("invalidates the list and both renamed post paths", async () => {
    const response = await POST(request(["old-slug", "new-slug"]));
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("blog-posts", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("blog-old-slug", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("blog-new-slug", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/old-slug");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/new-slug");
  });
});
