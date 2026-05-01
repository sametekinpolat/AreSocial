import { prisma } from "@/lib/prisma";
import { CommunitiesPageClient } from "@/components/communities/communities-page-client";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
  const communities = await prisma.community.findMany({
    where: { isUserProfile: false },
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = communities.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    isNsfw: c.isNsfw,
    memberCount: c._count.members,
    createdAt: c.createdAt.toISOString(),
  }));

  return <CommunitiesPageClient communities={serialized} />;
}
