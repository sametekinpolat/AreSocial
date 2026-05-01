"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, ShieldAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateCommunityForm } from "@/components/communities/create-community-form";

type CommunityItem = {
  id: string;
  name: string;
  description: string | null;
  isNsfw: boolean;
  memberCount: number;
  createdAt: string;
};

type CommunitiesPageClientProps = {
  communities: CommunityItem[];
};

export function CommunitiesPageClient({ communities }: CommunitiesPageClientProps) {
  const { data: session } = useSession();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Communities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover spaces to discuss what you care about.
          </p>
        </div>
        {session?.user && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Create a Community</SheetTitle>
              </SheetHeader>
              <div className="mt-6 px-1">
                <CreateCommunityForm onSuccess={() => setIsSheetOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* List */}
      {communities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-3">
          <Users className="h-10 w-10 opacity-40" />
          <p className="text-sm">No communities yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {communities.map((community) => (
            <Link key={community.id} href={`/communities/${community.name}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    c/{community.name}
                    {community.isNsfw && (
                      <span className="flex items-center gap-1 rounded border border-destructive/30 px-1.5 py-0.5 text-xs font-medium text-destructive">
                        <ShieldAlert className="h-3 w-3" /> NSFW
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {community.description && (
                    <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                      {community.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {community.memberCount.toLocaleString()}{" "}
                    {community.memberCount === 1 ? "member" : "members"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
