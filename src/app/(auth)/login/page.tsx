"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { loginAction, loginWithGithub } from "@/actions/auth";
import { XCircle } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        const result = await loginAction(formData);
        if (result?.requiresVerification) {
           window.location.href = `/verify-email?email=${encodeURIComponent(result.email ?? (formData.get("identifier") as string))}`;
        } else if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          window.location.href = "/";
        }
      } catch {
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Login
          </CardTitle>
          <CardDescription>
            Enter your username/email and password to access your account.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form id="login-form" onSubmit={handleSubmit} className="space-y-4 shadow-none border-none">
            {error && (
              <div className="flex items-center justify-center p-3 text-sm rounded bg-destructive/15 text-destructive border border-destructive/20 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                <XCircle className="h-4 w-4 mr-2 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="identifier">Email / Username</Label>
              <Input 
                id="identifier" 
                name="identifier"
                type="text" 
                placeholder="student@istanbularel.edu" 
                required 
                disabled={isPending}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="#" 
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending} className="w-full text-md h-10 mt-4">
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form action={loginWithGithub} className="mt-4">
            <Button variant="outline" type="submit" className="w-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-2 h-4 w-4"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
              GitHub
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link 
              href="/register" 
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
