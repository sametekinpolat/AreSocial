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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteUserForm } from "@/components/communities/invite-user-form";
import { joinCommunityAction, leaveCommunityAction } from "@/actions/communities";
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
  commentCount: number;
  createdAt: string;
  authorHandle: string;
  flair: { name: string; colorHex: string | null } | null;
};

type Moderator = {
  userId: string;
  handle: string;
  image: string | null;
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
  isMember: boolean;
  canManageSettings: boolean;
  currentSort: string;
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
}: {
  post: CommunityPost;
  communityName: string;
}) {
  const score = post.upvotes - post.downvotes;
  const postUrl = `/communities/${communityName}/comments/${post.id}/${slugify(post.title)}`;

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
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          aria-label="Upvote"
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
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Downvote"
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

// ─── Right info panel ─────────────────────────────────────────────────────────

function InfoPanel({
  community,
  moderators,
  canManageSettings,
}: {
  community: CommunityPageClientProps["community"];
  moderators: Moderator[];
  canManageSettings: boolean;
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
        </div>
      </div>

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
  isMember,
  canManageSettings,
  currentSort,
}: CommunityPageClientProps) {
  const { data: session } = useSession();
  const [memberState, setMemberState] = useState(isMember);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
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
              />
            ))}

            {/* Regular posts */}
            {regularPosts.length > 0 ? (
              regularPosts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  communityName={community.name}
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
                moderators={moderators}
                canManageSettings={canManageSettings}
              />
            </div>
          </aside>

          {/* Mobile info panel (below feed) */}
          <div className="lg:hidden">
            <InfoPanel
              community={community}
              moderators={moderators}
              canManageSettings={canManageSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
