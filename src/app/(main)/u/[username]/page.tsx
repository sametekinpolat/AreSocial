import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserProfileClient } from "@/components/user-profile-client";

export const dynamic = "force-dynamic";

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { username } = await params;
  return { title: `u/${username}` };
}

export default async function UserProfilePage({ params }: { params: Params }) {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      postKarma: true,
      commentKarma: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  return (
    <UserProfileClient
      username={user.username ?? user.name ?? "unknown"}
      image={user.image}
      postKarma={user.postKarma}
      commentKarma={user.commentKarma}
      createdAt={user.createdAt.toISOString()}
    />
  );
}
