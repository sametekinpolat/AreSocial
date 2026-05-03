"use client";

import { useTransition, useState } from "react";
import { resolveReportAction, dismissReportAction } from "@/actions/moderation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Report = {
  id: string;
  status: string;
  customReason: string | null;
  createdAt: Date;
  reporter: { username: string | null; email: string | null };
  reportedUser: { username: string | null; email: string | null } | null;
  post: { title: string; id: string } | null;
  comment: { body: string; id: string } | null;
  rule: { title: string } | null;
};

type ReportsTabProps = {
  communityId: string;
  reports: Report[];
};

export function ReportsTab({ communityId, reports: initial }: ReportsTabProps) {
  const [reports, setReports] = useState(initial);
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "RESOLVED" | "DISMISSED">("PENDING");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayed = reports.filter((r) => r.status === statusFilter);

  function actOnReport(
    reportId: string,
    action: "resolve" | "dismiss"
  ) {
    setMessage(null);
    startTransition(async () => {
      const fn = action === "resolve" ? resolveReportAction : dismissReportAction;
      const result = await fn(reportId, communityId);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: action === "resolve" ? "RESOLVED" : "DISMISSED" }
            : r
        )
      );
      setMessage({ type: "success", text: result.success ?? "Done." });
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        {(["PENDING", "RESOLVED", "DISMISSED"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "secondary" : "ghost"}
            onClick={() => setStatusFilter(s)}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {message && (
        <p
          className={cn(
            "text-sm",
            message.type === "error" ? "text-destructive" : "text-green-600 dark:text-green-400"
          )}
        >
          {message.text}
        </p>
      )}

      {displayed.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No {statusFilter.toLowerCase()} reports.</p>
      ) : (
        <div className="rounded-xl border border-border divide-y divide-border">
          {displayed.map((report) => (
            <div key={report.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {report.post
                      ? `Post: ${report.post.title}`
                      : report.comment
                      ? `Comment: ${report.comment.body.slice(0, 80)}…`
                      : report.reportedUser
                      ? `User: ${report.reportedUser.username ?? report.reportedUser.email}`
                      : "Unknown target"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reported by {report.reporter.username ?? report.reporter.email ?? "unknown"} ·{" "}
                    {new Date(report.createdAt).toLocaleDateString()}
                    {report.rule && ` · Rule: ${report.rule.title}`}
                  </p>
                  {report.customReason && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      &ldquo;{report.customReason}&rdquo;
                    </p>
                  )}
                </div>
                {report.status === "PENDING" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => actOnReport(report.id, "resolve")}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => actOnReport(report.id, "dismiss")}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
                {report.status !== "PENDING" && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {report.status.charAt(0) + report.status.slice(1).toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
