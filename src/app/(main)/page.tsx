import { PostStatus } from "@/generated/prisma/client";
import { HomePageClient } from "@/components/home-page-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      isDeleted: false,
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      user: {
        select: {
          name: true,
          username: true,
          email: true,
        },
      },
      community: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    take: 25,
  });

  const feedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    createdAt: post.createdAt.toISOString(),
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    commentCount: post._count.comments,
    communityName: post.community.name,
    authorName:
      post.user.name || post.user.username || post.user.email || "Anonymous",
    authorHandle:
      post.user.username || post.user.email?.split("@")[0] || "anonymous",
    authorId: post.userId,
  }));

  return <HomePageClient posts={feedPosts} />;
}
