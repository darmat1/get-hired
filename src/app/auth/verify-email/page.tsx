"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is missing. Please try signing up again.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: code,
      });

      if (error) {
        setError(
          error.message || "Invalid verification code. Please try again.",
        );
      } else {
        setIsSuccess(true);
        // Automatically redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (error) {
        setError(error.message || "Failed to resend code.");
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md border-emerald-100 dark:border-emerald-900/30">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-heading">
            Email Verified!
          </CardTitle>
          <CardDescription className="text-base">
            Your email has been successfully verified. You're now being
            redirected to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/dashboard">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Mail className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold font-heading">
          Verify your email
        </CardTitle>
        <CardDescription className="text-base text-balance">
          {email ? (
            <>
              We've sent a 6-digit confirmation code to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </>
          ) : (
            "Please enter the confirmation code sent to your email."
          )}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resendSuccess && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/30">
              <AlertDescription>
                Verification code resent successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center space-y-4 pt-2">
            <Input
              id="code"
              placeholder="000000"
              className="text-center text-3xl tracking-[0.5em] font-mono h-14"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full h-11"
            disabled={isVerifying || code.length < 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || !email}
                className="font-medium text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? "Resending..." : "Resend"}
              </button>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Loading verification flow...
            </p>
          </Card>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
