import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function VerifyPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return <StatusCard error="Invalid or missing verification token." />;
  }

  const existingToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!existingToken) {
    return <StatusCard error="Verification token is invalid or has expired." />;
  }

  const hasExpired = new Date(existingToken.expires).getTime() < new Date().getTime();
  if (hasExpired) {
    return <StatusCard error="Verification token has expired. Please register or request a new one." />;
  }

  // Find user and verify
  const user = await prisma.user.findFirst({
    where: { email: existingToken.identifier },
  });

  if (!user) {
    return <StatusCard error="User associated with this token does not exist." />;
  }

  // Update user inside a transaction and clean up
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);

  return (
    <StatusCard success="Email successfully verified! You can now access your account." />
  );
}

function StatusCard({ error, success }: { error?: string; success?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader className="space-y-4 pt-8">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${success ? 'bg-green-100' : 'bg-red-100'}`}>
            {success ? <CheckCircle className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {success ? "Verification Complete" : "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {success || error}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 pt-4">
          <Link href="/login">
            <Button className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
