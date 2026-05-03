"use client";

import { startTransition, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ChevronDown,
  Ellipsis,
  MessageSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  createPostAction,
  deletePostAction,
  updatePostAction,
} from "@/actions/posts";
import { cn, slugify } from "@/lib/utils";

type FeedPost = {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  communityName: string;
  authorName: string;
  authorHandle: string;
  authorId: string;
};

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

function PostComposer() {
  const { data: session } = useSession();
  const composerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileComposerOpen, setIsMobileComposerOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startPostTransition] = useTransition();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const syncViewport = (event?: MediaQueryListEvent) => {
      const matches = event?.matches ?? mediaQuery.matches;
      setIsMobileViewport(matches);
      if (matches) setIsExpanded(false);
      else setIsMobileComposerOpen(false);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!isExpanded || isMobileViewport) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!composerRef.current?.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isExpanded, isMobileViewport]);

  async function submitPost(options?: { closeMobileComposer?: boolean }) {
    setStatusMessage(null);

    startPostTransition(async () => {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("body", body);

      const result = await createPostAction({}, formData);

      if (result.error) {
        setStatusMessage({ type: "error", text: result.error });
        return;
      }

      setTitle("");
      setBody("");
      setStatusMessage({
        type: "success",
        text: result.success ?? "Post published.",
      });

      if (options?.closeMobileComposer) setIsMobileComposerOpen(false);
      else setIsExpanded(false);
    });
  }

  const sharedBodyFieldClassName =
    "flex min-h-32 w-full rounded-xl border border-sky-200/70 bg-background/80 px-3 py-3 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-900/60";

  const messageBlock = statusMessage ? (
    <p
      className={cn(
        "text-sm",
        statusMessage.type === "error"
          ? "text-destructive"
          : "text-emerald-600 dark:text-emerald-400"
      )}
    >
      {statusMessage.text}
    </p>
  ) : null;

  if (!session?.user) return null;

  return (
    <>
      <div ref={composerRef}>
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-sky-50 via-card to-cyan-50 shadow-sm ring-1 ring-sky-200/70 dark:from-sky-950/40 dark:via-card dark:to-cyan-950/30 dark:ring-sky-900/60">
          <CardHeader className="border-b border-sky-200/70 dark:border-sky-900/60">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary">
                {(
                  session.user.username?.[0] ||
                  session.user.email?.[0] ||
                  session.user.name?.[0] ||
                  "U"
                ).toUpperCase()}
              </div>
              <div className="flex-1 space-y-1">
                <CardTitle>Create a post</CardTitle>
                <Input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (!isMobileViewport) setIsExpanded(true);
                  }}
                  onFocus={() => {
                    setStatusMessage(null);
                    if (isMobileViewport) {
                      setIsMobileComposerOpen(true);
                      return;
                    }
                    setIsExpanded(true);
                  }}
                  readOnly={isMobileViewport}
                  placeholder="Share something with the community"
                  className="h-11 border-sky-200/70 bg-background/80 text-base dark:border-sky-900/60"
                />
              </div>
            </div>
          </CardHeader>
          <div
            className={cn(
              "grid transition-all duration-200 ease-out",
              isExpanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitPost();
                }}
              >
                <CardContent className="space-y-4 pt-4">
                  <textarea
                    name="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Add some details if you want."
                    disabled={isPending}
                    maxLength={2000}
                    rows={5}
                    className={sharedBodyFieldClassName}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        setIsExpanded(false);
                        setStatusMessage(null);
                      }}
                    >
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Collapse
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending || title.trim().length < 3}
                    >
                      {isPending ? "Posting…" : "Publish Post"}
                    </Button>
                  </div>
                  {messageBlock}
                </CardContent>
              </form>
            </div>
          </div>
        </Card>
      </div>

      {isMobileComposerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="font-heading text-lg font-semibold">Create a post</p>
              <p className="text-sm text-muted-foreground">
                @{session.user.username || session.user.name || "user"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileComposerOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <form
            className="flex flex-1 flex-col p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submitPost({ closeMobileComposer: true });
            }}
          >
            <div className="space-y-4">
              <Input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                disabled={isPending}
                maxLength={120}
                minLength={3}
                required
                autoFocus
                className="h-11 text-base"
              />
              <textarea
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add some details if you want."
                disabled={isPending}
                maxLength={2000}
                rows={10}
                className="flex min-h-56 w-full rounded-xl border bg-background px-3 py-3 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {messageBlock}
            </div>
            <div className="mt-auto pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isPending || title.trim().length < 3}
              >
                {isPending ? "Posting…" : "Publish Post"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function FeedPostCard({ post }: { post: FeedPost }) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === post.authorId;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState(post.title);
  const [draftBody, setDraftBody] = useState(post.body ?? "");

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/#post-${post.id}`
      );
      setActionError(null);
    } catch {
      setActionError("Link could not be copied.");
    }
  }

  function handleEditSubmit() {
    const formData = new FormData();
    formData.set("postId", post.id);
    formData.set("title", draftTitle);
    formData.set("body", draftBody);

    setIsSaving(true);
    setActionError(null);

    startTransition(async () => {
      const result = await updatePostAction(formData);
      setIsSaving(false);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      setIsEditing(false);
    });
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("postId", post.id);

    setIsDeleting(true);
    setActionError(null);

    startTransition(async () => {
      const result = await deletePostAction(formData);
      setIsDeleting(false);
      if (result.error) setActionError(result.error);
    });
  }

  return (
    <Card
      id={`post-${post.id}`}
      className="gap-0 overflow-hidden border-0 shadow-sm ring-1 ring-black/5"
    >
      <CardHeader className="gap-3 border-b bg-gradient-to-r from-muted/40 via-card to-card">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                c/{post.communityName}
              </span>
              <span>@{post.authorHandle}</span>
              <span>{formatRelativeDate(post.createdAt)}</span>
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  maxLength={120}
                  className="h-11 bg-background"
                />
                <textarea
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="flex min-h-28 w-full rounded-xl border bg-background px-3 py-3 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleEditSubmit}
                    disabled={isSaving || draftTitle.trim().length < 3}
                  >
                    {isSaving ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDraftTitle(post.title);
                      setDraftBody(post.body ?? "");
                      setActionError(null);
                      setIsEditing(false);
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <CardTitle className="text-lg">
                  <Link
                    href={`/communities/${post.communityName}/comments/${post.id}/${slugify(post.title)}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                {post.body && (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {post.body}
                  </p>
                )}
              </div>
            )}
            {actionError && (
              <p className="text-sm text-destructive">{actionError}</p>
            )}
          </div>
          <div className="flex items-start gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground"
                >
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>Share</DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setActionError(null);
                        setIsEditing(true);
                      }}
                    >
                      Edit post
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-destructive focus:text-destructive"
                    >
                      {isDeleting ? "Deleting…" : "Delete post"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
              {post.authorName[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{post.upvotes - post.downvotes} score</span>
          <Link
            href={`/communities/${post.communityName}/comments/${post.id}/${slugify(post.title)}`}
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            {post.commentCount} comments
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">Saved in PostgreSQL</p>
      </CardFooter>
    </Card>
  );
}

export function HomePageClient({ posts }: { posts: FeedPost[] }) {
  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_28%),linear-gradient(to_bottom,_transparent,_rgba(148,163,184,0.06))]">
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <section className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Home feed
          </h1>
          <PostComposer />
        </section>

        <section className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => <FeedPostCard key={post.id} post={post} />)
          ) : (
            <Card className="border-dashed bg-card/80">
              <CardContent className="space-y-2 pt-4 text-center">
                <p className="text-base font-medium">No posts yet</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to start the conversation.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
