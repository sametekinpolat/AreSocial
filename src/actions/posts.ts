"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@/generated/prisma/client";

const CreatePostSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title is too long."),
  body: z
    .string()
    .trim()
    .max(2000, "Post content is too long.")
    .optional()
    .transform((value) => value || ""),
});

export type CreatePostState = {
  error?: string;
  success?: string;
};

export type PostActionResult = {
  error?: string;
  success?: string;
};

async function getOrCreateDemoCommunity(userId: string) {
  const existingCommunity = await prisma.community.findFirst({
    where: { isUserProfile: false },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (existingCommunity) {
    return existingCommunity;
  }

  return prisma.community.create({
    data: {
      name: "demo-feed",
      description: "Temporary community used for initial posting.",
      ownerId: userId,
    },
    select: { id: true },
  });
}

export async function createPostAction(
  _prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Please log in before creating a post." };
  }

  const validated = CreatePostSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Post could not be created." };
  }

  const { title, body } = validated.data;

  try {
    const community = await getOrCreateDemoCommunity(session.user.id);

    await prisma.$transaction([
      prisma.communityMember.upsert({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId: community.id,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          communityId: community.id,
        },
      }),
      prisma.post.create({
        data: {
          title,
          body: body || null,
          status: PostStatus.PUBLISHED,
          communityId: community.id,
          userId: session.user.id,
        },
      }),
    ]);

    revalidatePath("/");

    return { success: "Your post is now live in the feed." };
  } catch (error) {
    console.error("createPostAction failed", error);
    return { error: "Something went wrong while saving the post." };
  }
}

export async function updatePostAction(formData: FormData): Promise<PostActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Please log in before editing a post." };
  }

  const postId = String(formData.get("postId") || "");
  const validated = CreatePostSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!postId) {
    return { error: "Post could not be found." };
  }

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Post could not be updated." };
  }

  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true, isDeleted: true },
  });

  if (!existingPost || existingPost.isDeleted) {
    return { error: "Post could not be found." };
  }

  if (existingPost.userId !== session.user.id) {
    return { error: "You are not allowed to edit this post." };
  }

  const { title, body } = validated.data;

  try {
    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        body: body || null,
      },
    });

    revalidatePath("/");

    return { success: "Post updated." };
  } catch (error) {
    console.error("updatePostAction failed", error);
    return { error: "Something went wrong while updating the post." };
  }
}

export async function deletePostAction(formData: FormData): Promise<PostActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Please log in before deleting a post." };
  }

  const postId = String(formData.get("postId") || "");

  if (!postId) {
    return { error: "Post could not be found." };
  }

  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true, isDeleted: true, status: true },
  });

  if (!existingPost || existingPost.isDeleted) {
    return { error: "Post could not be found." };
  }

  if (existingPost.userId !== session.user.id) {
    return { error: "You are not allowed to delete this post." };
  }

  try {
    await prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        status: PostStatus.REMOVED,
      },
    });

    revalidatePath("/");

    return { success: "Post deleted." };
  } catch (error) {
    console.error("deletePostAction failed", error);
    return { error: "Something went wrong while deleting the post." };
  }
}
