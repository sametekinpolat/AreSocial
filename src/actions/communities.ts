"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, InviteStatus, NotificationType } from "@/generated/prisma/client";
import { AddRuleSchema, CreateCommunitySchema, InviteUserSchema } from "@/lib/validations/community";

type CommunityActionResult = {
  error?: string;
  success?: string;
};

// ─── Story 1: Create Community ───────────────────────────────────────────────

export async function createCommunityAction(
  formData: FormData
): Promise<CommunityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in before creating a community." };
  }

  const validated = CreateCommunitySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    isNsfw: formData.get("isNsfw"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Community could not be created." };
  }

  const { name, description, isNsfw } = validated.data;
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      const community = await tx.community.create({
        data: { name, description, isNsfw, ownerId: userId },
        select: { id: true },
      });

      await tx.communityMember.create({
        data: { userId, communityId: community.id },
      });

      await tx.communityModerator.create({
        data: {
          userId,
          communityId: community.id,
          canManageSettings: true,
          canManagePosts: true,
          canRestrictUsers: true,
        },
      });
    });

    revalidatePath("/communities");
    return { success: name };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "This community name is already taken." };
    }
    console.error("createCommunityAction failed", error);
    return { error: "Something went wrong while creating the community." };
  }
}

// ─── Story 3: Join Community ─────────────────────────────────────────────────

export async function joinCommunityAction(
  communityId: string,
  communityName: string
): Promise<CommunityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in to join a community." };
  }

  try {
    await prisma.communityMember.create({
      data: { userId: session.user.id, communityId },
    });

    revalidatePath(`/communities/${communityName}`);
    return { success: "You have joined the community." };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "You are already a member of this community." };
    }
    console.error("joinCommunityAction failed", error);
    return { error: "Something went wrong while joining the community." };
  }
}

// ─── Story 3: Leave Community ────────────────────────────────────────────────

export async function leaveCommunityAction(
  communityId: string,
  communityName: string
): Promise<CommunityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in to leave a community." };
  }

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { ownerId: true },
  });

  if (!community) {
    return { error: "Community not found." };
  }

  if (community.ownerId === session.user.id) {
    return {
      error: "You cannot leave a community you own. Transfer ownership or delete it first.",
    };
  }

  try {
    await prisma.communityMember.delete({
      where: {
        userId_communityId: { userId: session.user.id, communityId },
      },
    });

    revalidatePath(`/communities/${communityName}`);
    return { success: "You have left the community." };
  } catch (error) {
    console.error("leaveCommunityAction failed", error);
    return { error: "Something went wrong while leaving the community." };
  }
}

// ─── Story 2: Add Community Rule ─────────────────────────────────────────────

export async function addRuleAction(
  formData: FormData
): Promise<CommunityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in to manage community rules." };
  }

  const validated = AddRuleSchema.safeParse({
    communityId: formData.get("communityId"),
    communityName: formData.get("communityName"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Rule could not be added." };
  }

  const { communityId, communityName, title, description } = validated.data;

  const mod = await prisma.communityModerator.findUnique({
    where: { userId_communityId: { userId: session.user.id, communityId } },
    select: { canManageSettings: true },
  });

  if (!mod?.canManageSettings) {
    return { error: "Unauthorized: you do not have permission to manage rules." };
  }

  const lastRule = await prisma.communityRule.findFirst({
    where: { communityId },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });

  const nextOrder = (lastRule?.displayOrder ?? -1) + 1;

  try {
    await prisma.communityRule.create({
      data: { communityId, title, description, displayOrder: nextOrder },
    });

    revalidatePath(`/communities/${communityName}/settings`);
    revalidatePath(`/communities/${communityName}`);
    return { success: "Rule added." };
  } catch (error) {
    console.error("addRuleAction failed", error);
    return { error: "Something went wrong while adding the rule." };
  }
}

// ─── Story 2: Reorder Rules ───────────────────────────────────────────────────

export async function reorderRulesAction(
  orderedIds: string[],
  communityId: string,
  communityName: string
): Promise<CommunityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in to manage community rules." };
  }

  const mod = await prisma.communityModerator.findUnique({
    where: { userId_communityId: { userId: session.user.id, communityId } },
    select: { canManageSettings: true },
  });

  if (!mod?.canManageSettings) {
    return { error: "Unauthorized: you do not have permission to manage rules." };
  }

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.communityRule.updateMany({
          where: { id, communityId },
          data: { displayOrder: index },
        })
      )
    );

    revalidatePath(`/communities/${communityName}/settings`);
    revalidatePath(`/communities/${communityName}`);
    return { success: "Rules reordered." };
  } catch (error) {
    console.error("reorderRulesAction failed", error);
    return { error: "Something went wrong while reordering rules." };
  }
}

// ─── Story 4: Send Community Invite ──────────────────────────────────────────

export async function sendInviteAction(
  formData: FormData
): Promise<CommunityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in to invite users." };
  }

  const validated = InviteUserSchema.safeParse({
    communityId: formData.get("communityId"),
    communityName: formData.get("communityName"),
    inviteeUsername: formData.get("inviteeUsername"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invite could not be sent." };
  }

  const { communityId, communityName, inviteeUsername } = validated.data;
  const inviterId = session.user.id;

  const invitee = await prisma.user.findUnique({
    where: { username: inviteeUsername },
    select: { id: true },
  });

  if (!invitee) {
    return { error: "User not found." };
  }

  if (invitee.id === inviterId) {
    return { error: "You cannot invite yourself." };
  }

  const isMember = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: inviterId, communityId } },
    select: { userId: true },
  });

  if (!isMember) {
    return { error: "You must be a member to invite others." };
  }

  const alreadyMember = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: invitee.id, communityId } },
    select: { userId: true },
  });

  if (alreadyMember) {
    return { error: "This user is already a member." };
  }

  const pendingInvite = await prisma.communityInvite.findFirst({
    where: { communityId, inviteeId: invitee.id, status: InviteStatus.PENDING },
    select: { id: true },
  });

  if (pendingInvite) {
    return { error: "An invite is already pending for this user." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const invite = await tx.communityInvite.create({
        data: {
          communityId,
          inviterId,
          inviteeId: invitee.id,
          status: InviteStatus.PENDING,
        },
        select: { id: true },
      });

      await tx.notification.create({
        data: {
          userId: invitee.id,
          actorId: inviterId,
          type: NotificationType.COMMUNITY_INVITE,
          inviteId: invite.id,
        },
      });
    });

    revalidatePath(`/communities/${communityName}`);
    return { success: `Invite sent to ${inviteeUsername}.` };
  } catch (error) {
    console.error("sendInviteAction failed", error);
    return { error: "Something went wrong while sending the invite." };
  }
}

// ─── Story 4: Respond to Invite ───────────────────────────────────────────────

export async function respondToInviteAction(
  inviteId: string,
  accept: boolean
): Promise<CommunityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in to respond to invites." };
  }

  const invite = await prisma.communityInvite.findUnique({
    where: { id: inviteId },
    select: { inviteeId: true, communityId: true, status: true },
  });

  if (!invite) {
    return { error: "Invite not found." };
  }

  if (invite.inviteeId !== session.user.id) {
    return { error: "Unauthorized." };
  }

  if (invite.status !== InviteStatus.PENDING) {
    return { error: "This invite has already been responded to." };
  }

  try {
    if (accept) {
      await prisma.$transaction([
        prisma.communityInvite.update({
          where: { id: inviteId },
          data: { status: InviteStatus.ACCEPTED },
        }),
        prisma.communityMember.upsert({
          where: {
            userId_communityId: {
              userId: session.user.id,
              communityId: invite.communityId,
            },
          },
          update: {},
          create: { userId: session.user.id, communityId: invite.communityId },
        }),
      ]);
    } else {
      await prisma.communityInvite.update({
        where: { id: inviteId },
        data: { status: InviteStatus.REJECTED },
      });
    }

    revalidatePath("/communities");
    return { success: accept ? "You joined the community." : "Invite declined." };
  } catch (error) {
    console.error("respondToInviteAction failed", error);
    return { error: "Something went wrong while responding to the invite." };
  }
}
