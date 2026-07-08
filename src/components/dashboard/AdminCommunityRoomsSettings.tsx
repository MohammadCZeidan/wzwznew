import { useState } from "react";
import { Lock, RefreshCw, Search, Users, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CommunityBadge } from "@/components/dashboard/CommunityBadge";
import { CommunityMessageComposer } from "@/components/dashboard/CommunityMessageComposer";
import { CommunityMessageTimeline } from "@/components/dashboard/CommunityMessageTimeline";
import { useCommunityChat } from "@/hooks/useCommunityChat";
import { countOnlineMembers } from "@/lib/communityChat";

const MAX_COMMUNITY_MESSAGE_LENGTH = 150;

interface AdminCommunityRoomsSettingsProps {
  userId: string;
  username: string;
  avatarLevel?: number;
}

export function AdminCommunityRoomsSettings({
  userId,
  username,
  avatarLevel = 1,
}: AdminCommunityRoomsSettingsProps) {
  const [inspectedCommunityId, setInspectedCommunityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const chat = useCommunityChat(
    inspectedCommunityId,
    userId,
    username,
    avatarLevel,
    searchQuery,
  );

  const inspectedCommunity = chat.selectedCommunity;

  return (
    <div className="overflow-hidden rounded-2xl border border-raw-border/30 bg-raw-surface/30">
      <div className="flex items-start justify-between gap-3 border-b border-raw-border/20 px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-raw-text">Community rooms</p>
          <p className="mt-1 text-xs text-raw-silver/40">
            Inspect a room to preview the live community chat and reply as admin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { void chat.reload(); }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-raw-border/30 bg-raw-black/30 text-raw-silver/55 transition-colors hover:border-raw-gold/30 hover:text-raw-gold"
          aria-label="Refresh community rooms"
          title="Refresh"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="divide-y divide-raw-border/15">
        {chat.isInitialCommunitiesLoading && chat.communities.length === 0 && (
          <p className="px-4 py-6 text-sm text-raw-silver/40">Loading community rooms...</p>
        )}

        {!chat.isInitialCommunitiesLoading && chat.communities.length === 0 && (
          <p className="px-4 py-6 text-sm text-raw-silver/40">No communities found yet.</p>
        )}

        {chat.communities.map((community) => {
          const isInspecting = community.id === inspectedCommunityId;
          const onlineNow = countOnlineMembers(community);
          const prompt = community.topic || community.description;

          return (
            <div key={community.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <CommunityBadge abbr={community.abbr} title={community.title} logoUrl={community.logoUrl} size="sm" />
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-baseline gap-1.5">
                      <p className="truncate text-sm font-semibold text-raw-text">{community.title}</p>
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-raw-silver/35">
                        {community.abbr}
                      </span>
                    </div>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-[11px] text-raw-silver/40">
                      <span className={community.locked ? "text-red-300/80" : "text-emerald-300/80"}>
                        {community.locked ? "Locked" : "Active"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {onlineNow}
                      </span>
                      <span className="min-w-0 truncate">{prompt}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setInspectedCommunityId(isInspecting ? null : community.id);
                  }}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    isInspecting
                      ? "border-raw-text/60 bg-raw-text text-raw-black"
                      : "border-raw-border/30 bg-raw-black/25 text-raw-text hover:border-raw-gold/30 hover:text-raw-gold"
                  }`}
                >
                  {isInspecting ? "Close" : "Inspect"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast({
                      title: "Room lock unavailable",
                      description: "This panel can inspect and reply. Locking still needs a backend action.",
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/25 bg-red-500/[0.06] px-3 py-2 text-xs font-semibold text-red-200/85 transition-colors hover:bg-red-500/10"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Lock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {inspectedCommunity && (
        <div className="border-t border-raw-border/20 px-3 pb-3 pt-4 sm:px-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-raw-text">Inspecting: {inspectedCommunity.title}</p>
              <p className="mt-1 text-xs text-raw-silver/40">
                This preview uses the same message layout as the live community chat.
              </p>
            </div>
            <div className="rounded-full border border-raw-border/30 px-3 py-1 text-[11px] text-raw-silver/45">
              {chat.onlineNow} online now
            </div>
          </div>

          <div className="flex h-[min(620px,calc(100dvh-260px))] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-raw-border/20 bg-raw-black/35">
            <div className="flex items-center gap-2 border-b border-raw-border/15 px-3 py-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-raw-border/25 bg-raw-surface/40 px-3 py-1.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-raw-silver/40" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search this group chat"
                  className="w-full bg-transparent text-sm text-raw-text placeholder:text-raw-silver/30 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="rounded-full p-0.5 text-raw-silver/40 hover:text-raw-text"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <CommunityMessageTimeline
              containerRef={chat.messagesContainerRef}
              polls={[]}
              groupedMessages={chat.groupedMessages}
              activeMessageCount={chat.activeMessages.length}
              isLoading={chat.messagesLoading}
              canManagePolls={false}
              canModerateUsers
              userId={userId}
              username={username}
              senderAvatarLevels={chat.senderAvatarLevels}
              onDeletePoll={() => {}}
              onVotePoll={() => {}}
              onRetryMessage={(message) => { void chat.retryMessage(message); }}
              onLikeMessage={(message) => { void chat.likeMessage(message); }}
              onOpenMessageReport={() => {
                toast({
                  title: "Open from live chat",
                  description: "Use the community chat report menu for full report context.",
                });
              }}
              onBlockMessageSender={chat.blockSender}
              onOpenSenderProfile={chat.openSenderProfile}
            />

            <CommunityMessageComposer
              inputRef={chat.messageInputRef}
              draft={chat.messageDraft}
              maxLength={MAX_COMMUNITY_MESSAGE_LENGTH}
              members={inspectedCommunity.members}
              mentionQuery={chat.mentionQuery}
              mentionIndex={chat.mentionIndex}
              canManagePolls={false}
              disabled={false}
              onDraftChange={chat.setMessageDraft}
              onMentionQueryChange={chat.setMentionQuery}
              onMentionIndexChange={chat.setMentionIndex}
              onOpenPollComposer={() => {}}
              onSendMessage={() => { void chat.sendMessage(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
