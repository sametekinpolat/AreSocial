"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, User, Home, Hash, Bell, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";


const SidebarNavLinks = () => (
  <nav className="flex flex-col space-y-2 p-4">
    <Button variant="ghost" className="justify-start">
      <Home className="mr-3 h-5 w-5" /> Home
    </Button>
    <Button variant="ghost" className="justify-start">
      <Hash className="mr-3 h-5 w-5" /> Explore
    </Button>
    <Button variant="ghost" className="justify-start">
      <Bell className="mr-3 h-5 w-5" /> Notifications
    </Button>
    <Button variant="ghost" className="justify-start">
      <Mail className="mr-3 h-5 w-5" /> Messages
    </Button>

    <div className="mt-8 space-y-2">
      <p className="px-4 text-xs font-semibold text-muted-foreground">TRENDING</p>
      {Array.from({ length: 10 }).map((_, i) => (
        <Button key={i} variant="ghost" className="w-full justify-start text-sm">
          #TrendingTopic{i + 1}
        </Button>
      ))}
    </div>
  </nav>
);

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      
      {/*TOP NAVBAR*/}
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
            placeholder="Search posts or users..."
            className="flex-1 bg-muted/50 border-none focus-visible:ring-0 shadow-none"
          />
          <Button size="sm">Search</Button>
        </header>
      ) : (
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-4 md:w-1/3">
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80%] sm:w-80 p-0">
                <SheetHeader className="p-4 text-left border-b">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-5rem)] w-full">
                  <SidebarNavLinks />
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <span className="text-xl font-bold tracking-tight">SocialApp</span>
          </div>
          
          <div className="hidden w-1/3 justify-center md:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts or users..."
                className="w-full bg-muted/50 pl-9"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 md:w-1/3 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileSearchActive(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <ModeToggle />
            
            <Link href="/login">
              <Button size="sm" className="md:px-4 md:py-2">
                <User className="mr-2 hidden h-4 w-4 md:block" />
                Login
              </Button>
            </Link>
          </div>
        </header>
      )}

      {/* --- BOTTOM LAYOUT AREA --- */}
      <div className="relative flex flex-1 overflow-hidden">
        
        <div
          className={cn(
            "hidden border-r bg-muted/10 transition-all duration-300 ease-in-out md:block",
            isSidebarOpen ? "w-64" : "w-0 border-r-0 opacity-0"
          )}
        >
          <ScrollArea className="h-full w-64">
            <SidebarNavLinks />
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1 bg-background">
          <main className="p-4 md:p-6">
            <div className="mx-auto max-w-2xl space-y-6">
              
              <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
                <Input placeholder="What's on your mind?" className="border-none bg-muted/50" />
                <div className="flex justify-end">
                  <Button>Post</Button>
                </div>
              </div>

              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20" />
                    <div className="text-sm font-semibold">User {i + 1}</div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien augue. Sed at nunc nec ipsum convallis tincidunt.
                  </p>
                </div>
              ))}
              
            </div>
          </main>
        </ScrollArea>

        {isMobileSearchActive && (
          <div className="absolute inset-0 z-40 bg-background/95 backdrop-blur-sm p-4 md:hidden">
            <div className="mx-auto max-w-md space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">Recent Searches</p>
              <div className="flex flex-col rounded-md border bg-card text-card-foreground shadow-sm">
                <Button variant="ghost" className="justify-start px-4 py-6 font-normal">
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  Prisma ORM setup
                </Button>
                <div className="border-t" />
                <Button variant="ghost" className="justify-start px-4 py-6 font-normal">
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  Docker CI/CD
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}