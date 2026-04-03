"use client";

import { useTransition, useState, useEffect, useRef } from "react";
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
import { registerAction, loginWithGithub, checkUsernameAvailability } from "@/actions/auth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const usernameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Password requirements state
  const reqs = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const fulfilledCount = Object.values(reqs).filter(Boolean).length;
  const totalReqs = Object.keys(reqs).length;
  const strengthPercentage = (fulfilledCount / totalReqs) * 100;

  // Determine progress bar color
  let progressColor = "bg-destructive";
  if (fulfilledCount === 2) progressColor = "bg-orange-500";
  if (fulfilledCount === 3) progressColor = "bg-yellow-500";
  if (fulfilledCount === 4) progressColor = "bg-green-500";
  
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    if (usernameAvailable === false) {
      setError("Please choose an available username before submitting.");
      return;
    }

    if (fulfilledCount < totalReqs) {
      setError("Please fulfill all password requirements.");
      return;
    }
    
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await registerAction(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success && result.email) {
          window.location.href = `/verify-email?email=${encodeURIComponent(result.email)}`;
        } else {
          window.location.href = "/verify-email";
        }
      } catch {
        // Handled next.js redirect from auth.js action wrapper.
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Create an Account
          </CardTitle>
          <CardDescription>
            Join now. We will send a verification link to your email.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded bg-destructive/15 text-destructive border border-destructive/20 text-center">
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
                  placeholder="johndoe"
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
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="student@istanbularel.edu"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              
              {/* password strenght */}
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  (isPasswordFocused || password.length > 0) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-2 pt-2">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ease-in-out ${progressColor}`} 
                        style={{ width: `${strengthPercentage}%` }}
                      />
                    </div>
                    
                    {fulfilledCount < totalReqs && (
                      <ul className="text-xs text-muted-foreground space-y-1 mt-1 transition-all duration-300">
                        {!reqs.length && <li>• At least 8 characters long</li>}
                        {!reqs.uppercase && <li>• One uppercase letter</li>}
                        {!reqs.lowercase && <li>• One lowercase letter</li>}
                        {!reqs.number && <li>• One number</li>}
                      </ul>
                    )}
                    {fulfilledCount === totalReqs && (
                      <div className="text-xs text-green-600 dark:text-green-500 flex items-center font-medium animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Password meets all requirements
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={isPending}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setIsConfirmFocused(true)}
                onBlur={() => setIsConfirmFocused(false)}
              />
              
              {/* confirm password */}
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  (isConfirmFocused || confirmPassword.length > 0) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pt-2">
                    {passwordsMatch ? (
                      <div className="text-xs text-green-600 dark:text-green-500 flex items-center font-medium animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Passwords are matching
                      </div>
                    ) : confirmPassword.length > 0 ? (
                      <div className="text-xs text-destructive flex items-center font-medium animate-in fade-in slide-in-from-top-1">
                        <XCircle className="h-3 w-3 mr-1" /> Passwords do not match
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isPending || usernameAvailable === false || fulfilledCount < totalReqs || !passwordsMatch} 
              className="w-full text-md h-10 mt-4"
            >
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : "Sign Up"}
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
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              GitHub
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
