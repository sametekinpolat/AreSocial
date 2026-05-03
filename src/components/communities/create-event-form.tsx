"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createEventAction } from "@/actions/events";

type CreateEventFormProps = {
  communityId: string;
  communityName: string;
  onSuccess?: () => void;
};

export function CreateEventForm({ communityId, communityName, onSuccess }: CreateEventFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("communityId", communityId);
    formData.set("communityName", communityName);

    setError(null);
    startTransition(async () => {
      const result = await createEventAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        form.reset();
        onSuccess?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor="event-title" className="block text-xs font-medium mb-1">
          Title
        </label>
        <input
          id="event-title"
          name="title"
          type="text"
          required
          maxLength={120}
          placeholder="Event title"
          disabled={isPending}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="event-description" className="block text-xs font-medium mb-1">
          Description (optional)
        </label>
        <textarea
          id="event-description"
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="Describe the event…"
          disabled={isPending}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="event-start" className="block text-xs font-medium mb-1">
            Start time
          </label>
          <input
            id="event-start"
            name="startTime"
            type="datetime-local"
            required
            disabled={isPending}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="event-end" className="block text-xs font-medium mb-1">
            End time
          </label>
          <input
            id="event-end"
            name="endTime"
            type="datetime-local"
            required
            disabled={isPending}
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending} size="sm" className="w-full">
        {isPending ? "Creating…" : "Create Event"}
      </Button>
    </form>
  );
}
