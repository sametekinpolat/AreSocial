import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RulesSettingsClient } from "@/components/communities/rules-settings-client";

export const dynamic = "force-dynamic";

type Params = Promise<{ name: string }>;

export default async function CommunitySettingsPage({
  params,
}: {
  params: Params;
}) {
  const { name } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const community = await prisma.community.findUnique({
    where: { name },
    select: { id: true, name: true },
  });

  if (!community) notFound();

  const mod = await prisma.communityModerator.findUnique({
    where: {
      userId_communityId: {
        userId: session.user.id,
        communityId: community.id,
      },
    },
    select: { canManageSettings: true },
  });

  if (!mod?.canManageSettings) redirect(`/communities/${name}`);

  const rules = await prisma.communityRule.findMany({
    where: { communityId: community.id },
    orderBy: { displayOrder: "asc" },
    select: { id: true, title: true, description: true, displayOrder: true },
  });

  return (
    <RulesSettingsClient
      community={{ id: community.id, name: community.name }}
      rules={rules}
    />
  );
}
