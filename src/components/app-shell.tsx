"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ArrowLeft,
  Bell,
  Hash,
  Home,
  Mail,
  Menu,
  Search,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/explore", icon: Hash, label: "Explore" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/messages", icon: Mail, label: "Messages" },
  { href: "/communities", icon: Users, label: "Communities" },
];

function SidebarContent({
  userCommunities,
}: {
  userCommunities: { name: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_LINKS.map(({ href, icon: Icon, label }) => (
        <Button
          key={href}
          variant={pathname === href ? "secondary" : "ghost"}
          className="justify-start"
          asChild
        >
          <Link href={href}>
            <Icon className="mr-3 h-5 w-5" />
            {label}
          </Link>
        </Button>
      ))}

      {userCommunities.length > 0 && (
        <div className="mt-4 flex flex-col gap-1">
          <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            My Communities
          </p>
          {userCommunities.map((c) => (
            <Button
              key={c.name}
              variant={
                pathname === `/communities/${c.name}` ? "secondary" : "ghost"
              }
              className="justify-start truncate"
              asChild
            >
              <Link href={`/communities/${c.name}`}>c/{c.name}</Link>
            </Button>
          ))}
        </div>
      )}
    </nav>
  );
}

type AppShellProps = {
  userCommunities: { name: string }[];
  children: React.ReactNode;
};

export function AppShell({ userCommunities, children }: AppShellProps) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* ── Header ── */}
      {isMobileSearchActive ? (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSearchActive(false)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            autoFocus
            type="search"
            placeholder="Search posts or users…"
            className="flex-1 border-none bg-muted/50 shadow-none focus-visible:ring-0"
          />
        </header>
      ) : (
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
          {/* Left */}
          <div className="flex items-center gap-3 md:w-1/3">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setIsSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Mobile sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80%] p-0 sm:w-72">
                <SheetHeader className="border-b p-4 text-left">
                  <SheetTitle>ArelSocial</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-5rem)]">
                  <SidebarContent userCommunities={userCommunities} />
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <Link
              href="/"
              className="text-xl font-bold tracking-tight select-none"
            >
              ArelSocial
            </Link>
          </div>

          {/* Center — search (desktop) */}
          <div className="hidden md:flex w-1/3 justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts or users…"
                className="w-full bg-muted/50 pl-9"
              />
            </div>
          </div>

          {/* Right — actions */}
          <div className="flex items-center justify-end gap-2 md:w-1/3 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileSearchActive(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <ModeToggle />

            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-sm font-semibold">
                      {(
                        session.user.username?.[0] ||
                        session.user.email?.[0] ||
                        session.user.name?.[0] ||
                        "U"
                      ).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col gap-0.5 p-2">
                    <p className="text-sm font-medium leading-none">
                      {session.user.username || session.user.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => signOut()}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm">
                  <User className="mr-2 h-4 w-4 hidden md:block" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </header>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden border-r bg-muted/10 transition-[width] duration-300 ease-in-out md:block shrink-0 overflow-hidden",
            isSidebarOpen ? "w-64" : "w-0 border-r-0"
          )}
        >
          <ScrollArea className="h-full w-64">
            <SidebarContent userCommunities={userCommunities} />
          </ScrollArea>
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
