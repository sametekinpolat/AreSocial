import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@/generated/prisma/client";
import { CommunityPageClient } from "@/components/communities/community-page-client";

export const dynamic = "force-dynamic";

type Params = Promise<{ name: string }>;
type SearchParams = Promise<{ sort?: string }>;

function getPostOrderBy(sort?: string) {
  if (sort === "top") {
    return [{ isPinned: "desc" as const }, { upvotes: "desc" as const }];
  }
  if (sort === "controversial") {
    return [{ isPinned: "desc" as const }, { downvotes: "desc" as const }];
  }
  return [{ isPinned: "desc" as const }, { createdAt: "desc" as const }];
}

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { name } = await params;
  const { sort } = await searchParams;
  const currentSort = ["top", "controversial"].includes(sort ?? "") ? sort! : "new";

  const community = await prisma.community.findUnique({
    where: { name },
    include: {
      rules: { orderBy: { displayOrder: "asc" } },
      _count: { select: { members: true } },
    },
  });

  if (!community) notFound();

  const session = await auth();
  const currentUserId = session?.user?.id ?? "";

  let isMember = false;
  let canManageSettings = false;

  if (session?.user?.id) {
    const [membership, modRecord] = await Promise.all([
      prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId: community.id,
          },
        },
        select: { userId: true },
      }),
      prisma.communityModerator.findUnique({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId: community.id,
          },
        },
        select: { canManageSettings: true },
      }),
    ]);

    isMember = !!membership;
    canManageSettings = modRecord?.canManageSettings ?? false;
  }

  const [posts, moderators] = await Promise.all([
    prisma.post.findMany({
      where: {
        communityId: community.id,
        status: PostStatus.PUBLISHED,
        isDeleted: false,
      },
      orderBy: getPostOrderBy(currentSort),
      include: {
        user: { select: { id: true, username: true, name: true } },
        flair: { select: { name: true, colorHex: true } },
        votes: {
          where: {
            userId: currentUserId || "00000000-0000-0000-0000-000000000000",
          },
          select: { voteValue: true },
        },
        _count: { select: { comments: true } },
      },
      take: 25,
    }),
    prisma.communityModerator.findMany({
      where: { communityId: community.id },
      include: {
        user: { select: { id: true, username: true, name: true, image: true } },
      },
    }),
  ]);

  return (
    <CommunityPageClient
      community={{
        id: community.id,
        name: community.name,
        description: community.description,
        isNsfw: community.isNsfw,
        ownerId: community.ownerId,
        memberCount: community._count.members,
        rules: community.rules.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          displayOrder: r.displayOrder,
        })),
        createdAt: community.createdAt.toISOString(),
      }}
      posts={posts.map((p) => ({
        id: p.id,
        title: p.title,
        body: p.body,
        isPinned: p.isPinned,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        myVote: (p.votes[0]?.voteValue ?? null) as 1 | -1 | null,
        commentCount: p._count.comments,
        createdAt: p.createdAt.toISOString(),
        authorId: p.user.id,
        authorHandle: p.user.username || p.user.name || "anonymous",
        flair: p.flair
          ? { name: p.flair.name, colorHex: p.flair.colorHex }
          : null,
      }))}
      moderators={moderators.map((m) => ({
        userId: m.userId,
        handle: m.user.username || m.user.name || "moderator",
        image: m.user.image,
      }))}
      isMember={isMember}
      canManageSettings={canManageSettings}
      currentSort={currentSort}
      currentUserId={currentUserId || null}
    />
  );
}
