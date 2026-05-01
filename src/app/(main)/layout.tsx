import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let userCommunities: { name: string }[] = [];

  if (session?.user?.id) {
    const memberships = await prisma.communityMember.findMany({
      where: { userId: session.user.id },
      include: { community: { select: { name: true } } },
      orderBy: { joinedAt: "desc" },
      take: 15,
    });

    userCommunities = memberships.map((m) => ({ name: m.community.name }));
  }

  return (
    <AppShell userCommunities={userCommunities}>{children}</AppShell>
  );
}
