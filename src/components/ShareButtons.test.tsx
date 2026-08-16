import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const insertMock = vi.fn().mockResolvedValue({ error: null });
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: (...args: unknown[]) => fromMock(...(args as [])),
  },
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

import { ShareButtons } from "@/components/ShareButtons";
import { newsPostUrl } from "@/lib/share";

const POST_ID = "post 42/x";
const TITLE = "Ajmal & the road ahead?";

const setup = () =>
  render(
    <ShareButtons
      url={newsPostUrl(POST_ID)}
      postId={POST_ID}
      title={TITLE}
      description="Summary & details"
      variant="inline"
      contentType="post"
    />,
  );

describe("ShareButtons url encoding", () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    insertMock.mockClear();
    fromMock.mockClear();
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  const expectedProxy = `/functions/v1/og-image?post=${encodeURIComponent(POST_ID)}`;

  it.each([
    ["Share on Facebook", "https://www.facebook.com/sharer/sharer.php?u="],
    ["Share on Twitter/X", "https://twitter.com/intent/tweet?url="],
    ["Share on LinkedIn", "https://www.linkedin.com/sharing/share-offsite/?url="],
  ])("%s opens a fully encoded url", (label, prefix) => {
    setup();
    fireEvent.click(screen.getAllByLabelText(label)[screen.getAllByLabelText(label).length - 1]);

    expect(openSpy).toHaveBeenCalled();
    const target = openSpy.mock.calls[0][0] as string;
    expect(target.startsWith(prefix)).toBe(true);

    const encoded = target.slice(prefix.length).split("&")[0];
    // no raw unsafe characters leaked into the query string
    expect(encoded).not.toMatch(/[ "<>{}|\\^~[\]`]/);
    // every % is part of a valid escape sequence
    expect(encoded).not.toMatch(/%(?![0-9A-Fa-f]{2})/);
    expect(decodeURIComponent(encoded)).toContain(expectedProxy);
  });

  it("encodes the title and message body for whatsapp", () => {
    setup();
    const btns = screen.getAllByLabelText("Share on WhatsApp");
    fireEvent.click(btns[btns.length - 1]);

    const target = openSpy.mock.calls[0][0] as string;
    expect(target.startsWith("https://api.whatsapp.com/send?text=")).toBe(true);
    const text = decodeURIComponent(target.replace("https://api.whatsapp.com/send?text=", ""));
    expect(text).toContain(TITLE);
    expect(text).toContain(expectedProxy);
  });

  it("logs a share_events row with the platform and post id", async () => {
    setup();
    const btns = screen.getAllByLabelText("Share on Facebook");
    fireEvent.click(btns[btns.length - 1]);

    await waitFor(() => expect(insertMock).toHaveBeenCalled());
    expect(fromMock).toHaveBeenCalledWith("share_events");
    expect(insertMock.mock.calls[0][0]).toMatchObject({
      platform: "facebook",
      action: "share_click",
      content_type: "post",
      content_id: POST_ID,
    });
    expect(insertMock.mock.calls[0][0].share_url).toContain(encodeURIComponent(POST_ID));
  });
});
