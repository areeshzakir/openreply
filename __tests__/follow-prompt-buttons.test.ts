import { afterEach, describe, expect, it, vi } from "vitest";
import { sendPrivateReplyWithButton, sendDirectMessageWithButton } from "../lib/meta/client";

afterEach(() => vi.unstubAllGlobals());

describe("follow prompt buttons", () => {
  for (const [name, send, recipient] of [
    ["initial comment reply", sendPrivateReplyWithButton, { comment_id: "recipient" }],
    ["repeat or inbound DM prompt", sendDirectMessageWithButton, { id: "recipient" }],
  ] as const) {
    it(`${name} includes the account profile link before follow confirmation`, async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message_id: "sent" })));
      vi.stubGlobal("fetch", fetchMock);
      await send("test-token", "account", "recipient", "Follow first", "ફૉલો કર્યું ✅", "followcheck:campaign", "@prepshots_by_gyanlive");
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.recipient).toEqual(recipient);
      expect(body.message.attachment.payload.buttons).toEqual([
        { type: "web_url", title: "Visit Profile", url: "https://www.instagram.com/prepshots_by_gyanlive/" },
        { type: "postback", title: "ફૉલો કર્યું ✅", payload: "followcheck:campaign" },
      ]);
    });

    it(`${name} leaves ordinary opening messages with one button`, async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message_id: "sent" })));
      vi.stubGlobal("fetch", fetchMock);
      await send("test-token", "account", "recipient", "Hello", "Continue", "reveal:campaign");
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.message.attachment.payload.buttons).toEqual([
        { type: "postback", title: "Continue", payload: "reveal:campaign" },
      ]);
    });
  }
});
