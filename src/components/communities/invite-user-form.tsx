"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendInviteAction } from "@/actions/communities";

type InviteUserFormProps = {
  communityId: string;
  communityName: string;
};

export function InviteUserForm({ communityId, communityName }: InviteUserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [inviteeUsername, setInviteeUsername] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.set("communityId", communityId);
    formData.set("communityName", communityName);
    formData.set("inviteeUsername", inviteeUsername);

    startTransition(async () => {
      const result = await sendInviteAction(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "success", text: result.success ?? "Invite sent." });
      setInviteeUsername("");
    });
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold mb-3">Invite a User</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={inviteeUsername}
          onChange={(e) => setInviteeUsername(e.target.value)}
          placeholder="Username"
          disabled={isPending}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isPending || !inviteeUsername.trim()}>
          {isPending ? "Sending…" : "Invite"}
        </Button>
      </form>
      {message && (
        <p className={`mt-2 text-xs ${message.type === "error" ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
