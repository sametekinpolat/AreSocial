"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, FileText, Calendar } from "lucide-react";
import { formatKarma } from "@/lib/utils";

type UserProfileClientProps = {
  username: string;
  image: string | null;
  postKarma: number;
  commentKarma: number;
  createdAt: string;
};

export function UserProfileClient({
  username,
  image,
  postKarma,
  commentKarma,
  createdAt,
}: UserProfileClientProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const totalKarma = postKarma + commentKarma;

  const joinDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(createdAt));

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.06),_transparent_30%)]">
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        {/* Profile card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* Banner */}
          <div className="h-20 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />

          {/* Avatar + basic info */}
          <div className="px-6 pb-6">
            <div className="-mt-10 mb-4 flex items-end gap-4">
              <div className="h-20 w-20 shrink-0 rounded-full border-4 border-card bg-primary/15 overflow-hidden flex items-center justify-center text-2xl font-bold text-primary shadow-sm">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  username[0]?.toUpperCase() ?? "U"
                )}
              </div>
            </div>

            <h1 className="text-xl font-bold text-foreground">u/{username}</h1>

            <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Joined {joinDate}</span>
            </div>
          </div>
        </div>

        {/* Karma card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/30 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-foreground">Karma</h2>
          </div>

          <div className="p-5">
            {/* Total karma row */}
            <button
              onClick={() => setShowBreakdown((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <ChevronUp className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    Total Karma
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click to {showBreakdown ? "collapse" : "see breakdown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    totalKarma >= 0
                      ? "text-lg font-bold text-foreground"
                      : "text-lg font-bold text-destructive"
                  }
                >
                  {formatKarma(totalKarma)}
                </span>
                {showBreakdown ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Breakdown */}
            {showBreakdown && (
              <div className="mt-2 space-y-1 border-t border-border pt-3">
                {/* Post karma */}
                <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-foreground">Post Karma</span>
                  </div>
                  <span
                    className={
                      postKarma >= 0
                        ? "text-sm font-semibold text-foreground"
                        : "text-sm font-semibold text-destructive"
                    }
                  >
                    {formatKarma(postKarma)}
                  </span>
                </div>

                {/* Comment karma */}
                <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-foreground">Comment Karma</span>
                  </div>
                  <span
                    className={
                      commentKarma >= 0
                        ? "text-sm font-semibold text-foreground"
                        : "text-sm font-semibold text-destructive"
                    }
                  >
                    {formatKarma(commentKarma)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
