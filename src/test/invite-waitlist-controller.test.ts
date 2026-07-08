import { beforeEach, describe, expect, it, vi } from "vitest";

const insertMock = vi.hoisted(() => vi.fn(async () => ({ error: null })));

vi.mock("@/backend/supabase/client", () => ({
  supabase: { from: () => ({ insert: insertMock }) },
}));

import { submitInviteWaitlistRequest } from "@/backend/supabase/controllers/inviteWaitlistController";

describe("submitInviteWaitlistRequest", () => {
  beforeEach(() => {
    insertMock.mockClear();
  });

  it("accepts phone numbers and emails as contact (private field, not public text)", async () => {
    await submitInviteWaitlistRequest({ contact: "78841144", note: "email me at me@example.com" });
    expect(insertMock).toHaveBeenCalledWith({
      contact: "78841144",
      note: "email me at me@example.com",
      source: "signup_modal",
    });
  });

  it("rejects an empty contact", async () => {
    await expect(submitInviteWaitlistRequest({ contact: "  " })).rejects.toThrow();
    expect(insertMock).not.toHaveBeenCalled();
  });
});
