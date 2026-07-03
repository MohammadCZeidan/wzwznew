import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCommunityChat } from "@/hooks/useCommunityChat";
import type { CommunityChatMessageRecord, PersistedCommunityRecord } from "@/lib/communityChat.types";

const mocks = vi.hoisted(() => ({
  fetchCommunities: vi.fn(async (): Promise<unknown[]> => []),
  fetchCommunityRequests: vi.fn(async () => []),
  fetchCommunityMessages: vi.fn(async () => []),
  markCommunityRead: vi.fn(async () => undefined),
  setCommunityNotifications: vi.fn(async () => undefined),
  touchMemberActivity: vi.fn(async () => undefined),
  sendMessage: vi.fn(),
  likeMessage: vi.fn(),
  joinCommunity: vi.fn(async () => undefined),
  getPublicUserProfile: vi.fn(),
}));

vi.mock("@/backend/supabase/controllers/communityController", () => ({
  fetchCommunities: mocks.fetchCommunities,
  fetchCommunityMessages: mocks.fetchCommunityMessages,
  joinCommunity: mocks.joinCommunity,
  markCommunityRead: mocks.markCommunityRead,
  setCommunityNotifications: mocks.setCommunityNotifications,
  touchMemberActivity: mocks.touchMemberActivity,
}));

vi.mock("@/backend/supabase/controllers/communityRequestController", () => ({
  fetchCommunityRequests: mocks.fetchCommunityRequests,
}));

vi.mock("@/backend/supabase/controllers/chatController", () => ({
  likeMessage: mocks.likeMessage,
  sendMessage: mocks.sendMessage,
}));

vi.mock("@/backend/supabase/controllers/userController", () => ({
  getPublicUserProfile: mocks.getPublicUserProfile,
}));

vi.mock("@/backend/supabase/client", () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(async () => undefined),
  },
}));

vi.mock("@/hooks/useCommunityMessagesRealtime", () => ({
  useCommunityMessagesRealtime: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/lib/communityChat.seed", () => ({
  buildDefaultCommunities: vi.fn(() => []),
}));

vi.mock("@/lib/communityCache", () => ({
  readCachedCommunities: vi.fn(() => null),
  readCachedMessages: vi.fn(() => null),
  writeCachedCommunities: vi.fn(),
  writeCachedMessages: vi.fn(),
}));

vi.mock("@/lib/blockedCommunitySenders", () => ({
  getCommunitySenderBlockKey: vi.fn((senderId: string, senderName: string) => `${senderId}:${senderName}`),
  readBlockedCommunitySenders: vi.fn(() => []),
  writeBlockedCommunitySenders: vi.fn(),
}));

vi.mock("@/lib/adminData", () => ({
  readCommunityJoinRequests: vi.fn(() => []),
}));

vi.mock("@/lib/avatarCatalog", () => ({
  buildAvatarIdToLevelMap: vi.fn(() => ({})),
  readAvatarCatalogLocal: vi.fn(() => []),
}));

vi.mock("@/lib/avataridentity", () => ({
  getPrivateAvatarLevel: vi.fn(() => 0),
}));

vi.mock("@/lib/identitySelection", () => ({
  CHAT_IDENTITY_CHANGED_EVENT: "chat-identity-changed",
  readSelectedChatAlias: vi.fn(() => null),
}));

vi.mock("@/lib/communityChat", () => ({
  canManageCommunity: vi.fn(() => false),
  countOnlineMembers: vi.fn(() => 0),
  countUnreadMessages: vi.fn(() => 0),
  formatChatDayLabel: vi.fn(() => "Today"),
}));

vi.mock("@/lib/inputSecurity", () => ({
  escapeRegExp: vi.fn((value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  getUserTextModerationMessage: vi.fn(() => ""),
  moderateUserText: vi.fn((text: string) => ({ allowed: true, text })),
}));

vi.mock("@/lib/chatSendError", () => ({
  getChatSendErrorInfo: vi.fn(() => ({ title: "Failed", description: "Try again", retryable: false })),
}));

vi.mock("@/lib/communityPushNotifications", () => ({
  sendCommunityPushNotification: vi.fn(),
}));

const community: PersistedCommunityRecord = {
  id: "c1",
  abbr: "C1",
  title: "Community One",
  description: "Test community",
  topic: "testing",
  status: "Active",
  createdAt: new Date().toISOString(),
  members: [
    {
      userId: "user-1",
      username: "user",
      joinedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      notificationsEnabled: false,
    },
  ],
  messages: [],
};

const savedMessage: CommunityChatMessageRecord = {
  id: "m1",
  communityId: "c1",
  senderId: "user-1",
  senderName: "user",
  text: "hello world",
  createdAt: new Date().toISOString(),
  likedBy: [],
};

async function renderChat() {
  const rendered = renderHook(() => useCommunityChat("c1", "user-1", "user", 1, ""));
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return rendered;
}

describe("useCommunityChat send clears draft", () => {
  beforeEach(() => {
    mocks.fetchCommunities.mockClear();
    mocks.fetchCommunities.mockResolvedValue([community]);
    mocks.sendMessage.mockReset();
  });

  it("clears the composer immediately, before the send resolves", async () => {
    let resolveSend: (message: CommunityChatMessageRecord) => void = () => {};
    mocks.sendMessage.mockImplementation(
      () => new Promise<CommunityChatMessageRecord>((resolve) => { resolveSend = resolve; }),
    );

    const { result, unmount } = await renderChat();

    act(() => {
      result.current.setMessageDraft("hello world");
    });
    expect(result.current.messageDraft).toBe("hello world");

    let sendPromise: Promise<void> = Promise.resolve();
    act(() => {
      sendPromise = result.current.sendMessage();
    });

    // The send is still in flight — the draft must already be empty.
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1);
    expect(result.current.messageDraft).toBe("");

    await act(async () => {
      resolveSend(savedMessage);
      await sendPromise;
    });
    expect(result.current.messageDraft).toBe("");

    unmount();
  });

  it("restores the draft when the send is rejected permanently", async () => {
    mocks.sendMessage.mockRejectedValue(new Error("blocked_word"));

    const { result, unmount } = await renderChat();

    act(() => {
      result.current.setMessageDraft("hello world");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    // Non-retryable failure: the optimistic bubble is removed, so the text
    // returns to the composer instead of being lost.
    expect(result.current.messageDraft).toBe("hello world");

    unmount();
  });
});
