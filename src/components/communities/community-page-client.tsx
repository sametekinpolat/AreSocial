"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Pin,
  Settings,
  ShieldAlert,
  Users,
  Flame,
  TrendingUp,
  Clock,
  Calendar,
  CalendarCheck,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteUserForm } from "@/components/communities/invite-user-form";
import { CreateEventForm } from "@/components/communities/create-event-form";
import { joinCommunityAction, leaveCommunityAction } from "@/actions/communities";
import { votePostAction } from "@/actions/posts";
import { rsvpEventAction } from "@/actions/events";
import { cn, slugify } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Rule = {
  id: string;
  title: string;
  description: string | null;
  displayOrder: number;
};

type CommunityPost = {
  id: string;
  title: string;
  body: string | null;
  isPinned: boolean;
  upvotes: number;
  downvotes: number;
  myVote: 1 | -1 | null;
  commentCount: number;
  createdAt: string;
  authorId: string;
  authorHandle: string;
  flair: { name: string; colorHex: string | null } | null;
};

type Moderator = {
  userId: string;
  handle: string;
  image: string | null;
};

type CommunityEvent = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  postId: string | null;
  participantCount: number;
  isParticipating: boolean;
};

type CommunityPageClientProps = {
  community: {
    id: string;
    name: string;
    description: string | null;
    isNsfw: boolean;
    ownerId: string;
    memberCount: number;
    rules: Rule[];
    createdAt: string;
  };
  posts: CommunityPost[];
  moderators: Moderator[];
  events: CommunityEvent[];
  isMember: boolean;
  canManageSettings: boolean;
  canManagePosts: boolean;
  hasModerationAccess: boolean;
  currentSort: string;
  currentUserId: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

// ─── Auth Modal ────────────────────────────────────────────────────────────────

function AuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-semibold">
          Join the conversation
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Log in or create an account to vote, comment, and more.
        </p>
        <div className="mt-4 flex gap-3">
          <Button asChild className="flex-1">
            <Link href="/login">Log in</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Sort tabs ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { key: "new", label: "New", icon: Clock },
  { key: "top", label: "Top", icon: TrendingUp },
  { key: "controversial", label: "Controversial", icon: Flame },
] as const;

function SortTabs({
  currentSort,
  communityName,
}: {
  currentSort: string;
  communityName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
      {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() =>
            router.push(`${pathname}?sort=${key}`, { scroll: false })
          }
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            currentSort === key
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────

function CommunityPostCard({
  post,
  communityName,
  currentUserId,
  onGuestAction,
}: {
  post: CommunityPost;
  communityName: string;
  currentUserId: string | null;
  onGuestAction: () => void;
}) {
  const [myVote, setMyVote] = useState<1 | -1 | null>(post.myVote);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [isVoting, startVoteTransition] = useTransition();

  const score = upvotes - downvotes;
  const postUrl = `/communities/${communityName}/comments/${post.id}/${slugify(post.title)}`;

  function handleVote(val: 1 | -1) {
    if (!currentUserId) {
      onGuestAction();
      return;
    }

    const prevVote = myVote;
    const prevUp = upvotes;
    const prevDown = downvotes;

    // Optimistic update
    if (myVote === val) {
      setMyVote(null);
      if (val === 1) setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      if (myVote !== null) {
        if (val === 1) {
          setUpvotes((v) => v + 1);
          setDownvotes((v) => v - 1);
        } else {
          setDownvotes((v) => v + 1);
          setUpvotes((v) => v - 1);
        }
      } else {
        if (val === 1) setUpvotes((v) => v + 1);
        else setDownvotes((v) => v + 1);
      }
      setMyVote(val);
    }

    startVoteTransition(async () => {
      const result = await votePostAction(post.id, val);
      if (result.error) {
        setMyVote(prevVote);
        setUpvotes(prevUp);
        setDownvotes(prevDown);
      }
    });
  }

  return (
    <article
      className={cn(
        "group flex gap-0 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-border/80 hover:bg-muted/20",
        post.isPinned && "border-primary/25 bg-primary/[0.03]"
      )}
    >
      {/* Vote column */}
      <div className="flex w-10 shrink-0 flex-col items-center gap-0.5 bg-muted/30 py-3 px-1">
        <button
          onClick={() => handleVote(1)}
          disabled={isVoting}
          aria-label="Upvote"
          className={cn(
            "rounded p-0.5 transition-colors",
            myVote === 1
              ? "text-primary"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
            isVoting && "pointer-events-none opacity-40"
          )}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            score > 0
              ? "text-primary"
              : score < 0
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          disabled={isVoting}
          aria-label="Downvote"
          className={cn(
            "rounded p-0.5 transition-colors",
            myVote === -1
              ? "text-destructive"
              : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            isVoting && "pointer-events-none opacity-40"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 min-w-0">
        {/* Pinned badge */}
        {post.isPinned && (
          <div className="flex items-center gap-1 text-xs font-medium text-primary">
            <Pin className="h-3 w-3" />
            Pinned
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>u/{post.authorHandle}</span>
          <span>·</span>
          <span>{formatRelativeDate(post.createdAt)}</span>
          {post.flair && (
            <>
              <span>·</span>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{
                  backgroundColor: post.flair.colorHex ?? "#64748b",
                }}
              >
                {post.flair.name}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold leading-snug text-foreground">
          <Link href={postUrl} className="hover:underline">
            {post.title}
          </Link>
        </h3>

        {/* Body preview */}
        {post.body && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {post.body}
          </p>
        )}

        {/* Footer */}
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <Link
            href={postUrl}
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {post.commentCount}{" "}
            {post.commentCount === 1 ? "comment" : "comments"}
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Events card (sidebar) ────────────────────────────────────────────────────

function EventsCard({
  events: initialEvents,
  canManagePosts,
  communityId,
  communityName,
  currentUserId,
  onGuestAction,
}: {
  events: CommunityEvent[];
  canManagePosts: boolean;
  communityId: string;
  communityName: string;
  currentUserId: string | null;
  onGuestAction: () => void;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRsvp(eventId: string) {
    if (!currentUserId) {
      onGuestAction();
      return;
    }

    const prev = events;
    setEvents((es) =>
      es.map((e) =>
        e.id === eventId
          ? {
              ...e,
              isParticipating: !e.isParticipating,
              participantCount: e.isParticipating
                ? e.participantCount - 1
                : e.participantCount + 1,
            }
          : e
      )
    );

    startTransition(async () => {
      const result = await rsvpEventAction(eventId, communityName);
      if (result.error) setEvents(prev);
    });
  }

  if (events.length === 0 && !canManagePosts) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b bg-muted/30 px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Upcoming Events
        </h2>
        {canManagePosts && (
          <button
            onClick={() => setShowCreateForm((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" />
            {showCreateForm ? "Cancel" : "Schedule"}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="p-4 border-b border-border">
          <CreateEventForm
            communityId={communityId}
            communityName={communityName}
            onSuccess={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {events.length === 0 ? (
        <p className="p-4 text-xs text-muted-foreground text-center">
          No upcoming events yet.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {events.map((event) => {
            const start = new Date(event.startTime);
            const formattedDate = new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
            }).format(start);
            const formattedTime = new Intl.DateTimeFormat("en", {
              hour: "numeric",
              minute: "2-digit",
            }).format(start);

            return (
              <div key={event.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {event.postId ? (
                      <Link
                        href={`/communities/${communityName}/comments/${event.postId}/${slugify(event.title)}`}
                        className="text-sm font-medium text-foreground hover:underline line-clamp-2"
                      >
                        {event.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {event.title}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formattedDate} · {formattedTime}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {event.participantCount}{" "}
                      {event.participantCount === 1 ? "going" : "going"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRsvp(event.id)}
                    disabled={isPending}
                    className={cn(
                      "shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50",
                      event.isParticipating
                        ? "bg-primary text-primary-foreground hover:bg-primary/80"
                        : "border border-border hover:bg-muted"
                    )}
                  >
                    <CalendarCheck className="h-3 w-3" />
                    {event.isParticipating ? "Going" : "RSVP"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Right info panel ─────────────────────────────────────────────────────────

function InfoPanel({
  community,
  moderators,
  events,
  canManageSettings,
  canManagePosts,
  hasModerationAccess,
  currentUserId,
  onGuestAction,
}: {
  community: CommunityPageClientProps["community"];
  moderators: Moderator[];
  events: CommunityEvent[];
  canManageSettings: boolean;
  canManagePosts: boolean;
  hasModerationAccess: boolean;
  currentUserId: string | null;
  onGuestAction: () => void;
}) {
  const createdAt = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(community.createdAt));

  return (
    <div className="flex flex-col gap-4">
      {/* About card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b bg-muted/30 px-4 py-3">
          <h2 className="text-sm font-semibold">About c/{community.name}</h2>
        </div>
        <div className="p-4 text-sm space-y-3">
          {community.description && (
            <p className="text-muted-foreground leading-relaxed">
              {community.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              <strong className="text-foreground font-semibold">
                {community.memberCount.toLocaleString()}
              </strong>{" "}
              {community.memberCount === 1 ? "member" : "members"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Created {createdAt}</p>
          {canManageSettings && (
            <Button variant="outline" size="sm" className="w-full mt-1" asChild>
              <Link href={`/communities/${community.name}/settings`}>
                <Settings className="h-3.5 w-3.5 mr-2" />
                Manage Community
              </Link>
            </Button>
          )}
          {hasModerationAccess && (
            <Button variant="outline" size="sm" className="w-full mt-1" asChild>
              <Link href={`/communities/${community.name}/moderation`}>
                <ShieldAlert className="h-3.5 w-3.5 mr-2" />
                Moderation Panel
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Events card */}
      <EventsCard
        events={events}
        canManagePosts={canManagePosts}
        communityId={community.id}
        communityName={community.name}
        currentUserId={currentUserId}
        onGuestAction={onGuestAction}
      />

      {/* Rules card */}
      {community.rules.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b bg-muted/30 px-4 py-3">
            <h2 className="text-sm font-semibold">Community Rules</h2>
          </div>
          <div className="divide-y divide-border">
            {community.rules.map((rule, index) => (
              <div key={rule.id} className="px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  {index + 1}. {rule.title}
                </p>
                {rule.description && (
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {rule.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moderators card */}
      {moderators.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b bg-muted/30 px-4 py-3">
            <h2 className="text-sm font-semibold">Moderators</h2>
          </div>
          <div className="divide-y divide-border">
            {moderators.map((mod) => (
              <div
                key={mod.userId}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <div className="h-7 w-7 shrink-0 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary overflow-hidden">
                  {mod.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mod.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    mod.handle[0]?.toUpperCase() ?? "M"
                  )}
                </div>
                <span className="text-sm text-foreground">
                  u/{mod.handle}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CommunityPageClient({
  community,
  posts,
  moderators,
  events,
  isMember,
  canManageSettings,
  canManagePosts,
  hasModerationAccess,
  currentSort,
  currentUserId,
}: CommunityPageClientProps) {
  const { data: session } = useSession();
  const [memberState, setMemberState] = useState(isMember);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isOwner = session?.user?.id === community.ownerId;

  function handleJoinLeave() {
    const joining = !memberState;
    setMemberState(joining);
    setActionMessage(null);

    startTransition(async () => {
      const result = joining
        ? await joinCommunityAction(community.id, community.name)
        : await leaveCommunityAction(community.id, community.name);

      if (result.error) {
        setMemberState(!joining);
        setActionMessage(result.error);
      }
    });
  }

  const pinnedPosts = posts.filter((p) => p.isPinned);
  const regularPosts = posts.filter((p) => !p.isPinned);

  return (
    <>
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      <div className="min-h-full">
        {/* ── Community banner + header ── */}
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

        <div className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="mx-auto max-w-screen-xl px-4 py-4 md:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              {/* Community identity */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight">
                    c/{community.name}
                  </h1>
                  {community.isNsfw && (
                    <span className="flex items-center gap-1 rounded border border-destructive/30 px-1.5 py-0.5 text-xs font-medium text-destructive">
                      <ShieldAlert className="h-3 w-3" />
                      NSFW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {community.memberCount.toLocaleString()}{" "}
                    {community.memberCount === 1 ? "member" : "members"}
                  </span>
                </div>
                {community.description && (
                  <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    {community.description}
                  </p>
                )}
                {actionMessage && (
                  <p className="text-sm text-destructive">{actionMessage}</p>
                )}
              </div>

              {/* Join / Leave */}
              {session?.user ? (
                !isOwner && (
                  <Button
                    variant={memberState ? "outline" : "default"}
                    onClick={handleJoinLeave}
                    disabled={isPending}
                    className="shrink-0 self-start sm:self-auto"
                  >
                    {memberState ? "Leave" : "Join"}
                  </Button>
                )
              ) : (
                <Button asChild className="shrink-0 self-start sm:self-auto">
                  <Link href="/login">Join</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="mx-auto max-w-screen-xl px-4 py-6 md:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* ── Feed column ── */}
            <div className="flex flex-col gap-4 min-w-0">
              {/* Sort tabs */}
              <SortTabs currentSort={currentSort} communityName={community.name} />

              {/* Pinned posts */}
              {pinnedPosts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  communityName={community.name}
                  currentUserId={currentUserId}
                  onGuestAction={() => setShowAuthModal(true)}
                />
              ))}

              {/* Regular posts */}
              {regularPosts.length > 0 ? (
                regularPosts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    communityName={community.name}
                    currentUserId={currentUserId}
                    onGuestAction={() => setShowAuthModal(true)}
                  />
                ))
              ) : pinnedPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground gap-2">
                  <MessageSquare className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No posts yet — be the first to share something.</p>
                </div>
              ) : null}

              {/* Invite form — members only */}
              {session?.user && memberState && (
                <InviteUserForm
                  communityId={community.id}
                  communityName={community.name}
                />
              )}
            </div>

            {/* ── Info panel ── */}
            <aside className="hidden lg:block">
              <div className="sticky top-6">
                <InfoPanel
                  community={community}
                  events={events}
                  canManagePosts={canManagePosts}
                  currentUserId={currentUserId}
                  onGuestAction={() => setShowAuthModal(true)}
                  moderators={moderators}
                  canManageSettings={canManageSettings}
                  hasModerationAccess={hasModerationAccess}
                />
              </div>
            </aside>

            {/* Mobile info panel (below feed) */}
            <div className="lg:hidden">
              <InfoPanel
                community={community}
                moderators={moderators}
                events={events}
                canManageSettings={canManageSettings}
                canManagePosts={canManagePosts}
                hasModerationAccess={hasModerationAccess}
                currentUserId={currentUserId}
                onGuestAction={() => setShowAuthModal(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
