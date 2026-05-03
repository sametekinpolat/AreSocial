"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationType, PostStatus } from "@/generated/prisma/client";
import { CreateEventSchema } from "@/lib/validations/events";
import { slugify } from "@/lib/utils";

type EventActionResult = {
  error?: string;
  success?: string;
  eventId?: string;
};

// ─── Create Event ─────────────────────────────────────────────────────────────

export async function createEventAction(formData: FormData): Promise<EventActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in to create events." };
  }

  const validated = CreateEventSchema.safeParse({
    communityId: formData.get("communityId"),
    communityName: formData.get("communityName"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Event could not be created." };
  }

  const { communityId, communityName, title, description, startTime, endTime } = validated.data;
  const userId = session.user.id;

  const mod = await prisma.communityModerator.findUnique({
    where: { userId_communityId: { userId, communityId } },
    select: { canManagePosts: true },
  });

  if (!mod?.canManagePosts) {
    return { error: "Unauthorized: you must be a moderator with post management permission." };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const formattedStart = start.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      const formattedEnd = end.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const bodyParts: string[] = [];
      if (description) bodyParts.push(description, "");
      bodyParts.push(`**Start:** ${formattedStart}`, `**End:** ${formattedEnd}`);
      const postBody = bodyParts.join("\n");

      const post = await tx.post.create({
        data: {
          title: `[Event] ${title}`,
          body: postBody,
          status: PostStatus.PUBLISHED,
          communityId,
          userId,
          isPinned: true,
          upvotes: 1,
        },
        select: { id: true },
      });

      await tx.postVote.create({
        data: { userId, postId: post.id, voteValue: 1 },
      });

      const event = await tx.event.create({
        data: {
          communityId,
          creatorId: userId,
          postId: post.id,
          title,
          description,
          startTime: start,
          endTime: end,
        },
        select: { id: true },
      });

      const members = await tx.communityMember.findMany({
        where: { communityId },
        select: { userId: true },
      });

      const notifData = members
        .filter((m) => m.userId !== userId)
        .map((m) => ({
          userId: m.userId,
          actorId: userId,
          type: NotificationType.COMMUNITY_EVENT,
          postId: post.id,
        }));

      if (notifData.length > 0) {
        await tx.notification.createMany({ data: notifData });
      }

      return event;
    });

    revalidatePath(`/communities/${communityName}`);
    return { success: "Event created and announcement post published.", eventId: result.id };
  } catch (error) {
    console.error("createEventAction failed", error);
    return { error: "Something went wrong while creating the event." };
  }
}

// ─── RSVP Event ───────────────────────────────────────────────────────────────

export async function rsvpEventAction(
  eventId: string,
  communityName: string
): Promise<EventActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in to RSVP." };
  }

  const userId = session.user.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, endTime: true, postId: true, title: true },
  });

  if (!event) return { error: "Event not found." };
  if (new Date() > event.endTime) return { error: "This event has already ended." };

  const existing = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

  try {
    if (existing) {
      await prisma.eventParticipant.delete({
        where: { eventId_userId: { eventId, userId } },
      });
    } else {
      await prisma.eventParticipant.create({
        data: { eventId, userId },
      });
    }

    revalidatePath(`/communities/${communityName}`);
    if (event.postId) {
      revalidatePath(
        `/communities/${communityName}/comments/${event.postId}/${slugify(event.title)}`
      );
    }
    return { success: existing ? "RSVP removed." : "You're going!" };
  } catch (error) {
    console.error("rsvpEventAction failed", error);
    return { error: "Something went wrong." };
  }
}
