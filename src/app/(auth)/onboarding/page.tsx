"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession, signOut } from "next-auth/react";
import { completeOnboardingAction, checkUsernameAvailability } from "@/actions/auth";
import { Loader2, XCircle } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const usernameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, []);

  const handleUsernameChange = (value: string) => {
    setUsername(value);

    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    if (value.length < 3) {
      setUsernameAvailable(null);
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);
    usernameCheckTimeoutRef.current = setTimeout(async () => {
      const isAvailable = await checkUsernameAvailability(value);
      setUsernameAvailable(isAvailable);
      setIsCheckingUsername(false);
    }, 500);
  };

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!session?.user) return;
    
    const formData = new FormData(e.currentTarget);
    formData.append("userId", session.user.id!);
    
    if (usernameAvailable === false) {
      setError("Please choose an available username.");
      return;
    }

    startTransition(async () => {
      const result = await completeOnboardingAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success && result.email) {
        // Automatically redirects them out
        await signOut({ callbackUrl: `/verify-email?email=${encodeURIComponent(result.email)}` });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome! Let&apos;s finish setting up.
          </CardTitle>
          <CardDescription>
            Please provide your preferred username and an official university email address to complete your profile.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center justify-center p-3 text-sm rounded bg-destructive/15 text-destructive border border-destructive/20 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                <XCircle className="h-4 w-4 mr-2 shrink-0" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input 
                  id="username" 
                  name="username"
                  type="text" 
                  placeholder="john_doe" 
                  required 
                  disabled={isPending}
                  maxLength={30}
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-2.5">
                     <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {!isCheckingUsername && usernameAvailable === true && (
                <p className="text-sm font-medium text-green-600 dark:text-green-500">This username is free you can take</p>
              )}
              {!isCheckingUsername && usernameAvailable === false && (
                <p className="text-sm font-medium text-destructive">This username is taken</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                defaultValue={session.user.email!}
                required 
                disabled={isPending}
              />
            </div>

            <Button type="submit" disabled={isPending || usernameAvailable === false} className="w-full text-md h-10 mt-4">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing...</> : "Finish Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
