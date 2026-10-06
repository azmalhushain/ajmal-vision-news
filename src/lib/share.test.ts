import { describe, it, expect, vi, beforeEach } from "vitest";

const insertMock = vi.fn().mockResolvedValue({ error: null });
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
    from: (...args: unknown[]) => fromMock(...(args as [])),
  },
}));

import { canonicalNewsPostUrl, newsPostUrl, socialImageUrl, toAbsoluteUrl, trackShare } from "@/lib/share";

describe("share url helpers", () => {
  it("encodes post ids with unsafe characters", () => {
    expect(newsPostUrl("abc 123/&x")).toBe("/news?post=abc%20123%2F%26x");
  });

  it("keeps plain uuid ids intact", () => {
    const id = "8f1c2b1e-9a4d-4f0b-9d6c-1a2b3c4d5e6f";
    expect(newsPostUrl(id)).toBe(`/news?post=${id}`);
  });

  it("uses the canonical site URL for post shares", () => {
    expect(canonicalNewsPostUrl("post-42")).toBe("https://www.ajmalakhtar.com.np/news?post=post-42");
  });

  it("requests a 1200 by 630 share crop from public storage", () => {
    const url = socialImageUrl("https://project.supabase.co/storage/v1/object/public/post-images/photo.jpg");
    expect(url).toContain("/storage/v1/render/image/public/post-images/photo.jpg");
    expect(url).toContain("width=1200");
    expect(url).toContain("height=630");
    expect(url).toContain("resize=cover");
  });

  it("builds same-origin absolute urls", () => {
    expect(toAbsoluteUrl("/news?post=1")).toBe(`${window.location.origin}/news?post=1`);
    expect(toAbsoluteUrl("news?post=1")).toBe(`${window.location.origin}/news?post=1`);
    expect(toAbsoluteUrl("https://x.test/a")).toBe("https://x.test/a");
  });
});

describe("trackShare", () => {
  beforeEach(() => {
    insertMock.mockClear();
    fromMock.mockClear();
  });

  it("writes a share_events row with platform and post id", async () => {
    trackShare({
      platform: "facebook",
      action: "share_click",
      contentType: "post",
      contentId: "post-42",
      shareUrl: "https://www.ajmalakhtar.com.np/news?post=post-42",
    });

    await vi.waitFor(() => expect(insertMock).toHaveBeenCalled());

    expect(fromMock).toHaveBeenCalledWith("share_events");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        platform: "facebook",
        action: "share_click",
        content_type: "post",
        content_id: "post-42",
        share_url: "https://www.ajmalakhtar.com.np/news?post=post-42",
        user_id: "user-1",
      }),
    );
  });

  it("records share_open taps too", async () => {
    trackShare({ platform: "whatsapp", action: "share_open", contentId: "post-7" });

    await vi.waitFor(() => expect(insertMock).toHaveBeenCalled());
    expect(insertMock.mock.calls[0][0]).toMatchObject({
      platform: "whatsapp",
      action: "share_open",
      content_id: "post-7",
    });
  });
});
