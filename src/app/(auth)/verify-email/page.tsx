"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { resendVerificationEmailAction } from "@/actions/auth";
import { CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [timeRemaining]);

  const handleResend = async () => {
    if (!email || timeRemaining > 0) return;
    
    setResending(true);
    setMessage(null);
    
    const res = await resendVerificationEmailAction(email);
    if (res?.error) {
      setMessage({ type: "error", text: res.error });
      setResending(false);
    } else {
      setMessage({ type: "success", text: "A new verification link has been sent to your email." });
      setTimeRemaining(60); // 60 seconds cooldown
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader className="space-y-4 pt-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            We&apos;ve sent a verification link to {email ? <span className="font-semibold text-foreground">{email}</span> : "your email address"}. Please click the link to verify your account so you can log in.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-8 pt-4 space-y-4">
          
          {message && (
            <div className={`flex items-center justify-center p-3 text-sm rounded border animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-500/15 text-green-600 dark:text-green-500 border-green-500/20' : 'bg-destructive/15 text-destructive border-destructive/20'}`}>
              {message.type === "success" ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              {message.text}
            </div>
          )}

          <Button 
            onClick={handleResend} 
            disabled={!email || timeRemaining > 0 || resending}
            className="w-full"
          >
            {resending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {timeRemaining > 0 ? `Resend Email (${timeRemaining}s)` : "Resend Email"}
          </Button>

          <Link href="/login" className="block mt-4">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailNotice() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><RefreshCw className="animate-spin h-8 w-8 text-primary" /></div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
