import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@/generated/prisma/client";
import { slugify } from "@/lib/utils";

type Params = Promise<{ id: string }>;

/**
 * Legacy route — permanently redirects to the SEO-friendly canonical URL:
 * /communities/[name]/comments/[id]/[slug]
 */
export default async function PostRedirectPage({ params }: { params: Params }) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id, isDeleted: false, status: PostStatus.PUBLISHED },
    select: {
      title: true,
      community: { select: { name: true } },
    },
  });

  if (!post) notFound();

  redirect(
    `/communities/${post.community.name}/comments/${id}/${slugify(post.title)}`
  );
}
