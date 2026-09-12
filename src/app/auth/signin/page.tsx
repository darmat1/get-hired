"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { GoogleIcon } from "@/components/ui/icons/google";
import { LinkedinIcon } from "@/components/ui/icons/linkedin";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (error) {
        if (
          error.status === 403 &&
          error.message?.includes("Email not verified")
        ) {
          setError(
            "Your email is not verified. Please check your inbox or sign up again to resend the link.",
          );
        } else {
          setError(error.message || "Invalid credentials");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-warm-950">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-warm-900 dark:text-warm-50">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-warm-300 placeholder-warm-400 text-warm-900 rounded-t-md focus:outline-none focus:ring-terracotta-500 focus:border-terracotta-500 focus:z-10 sm:text-sm dark:bg-warm-800 dark:border-warm-600 dark:placeholder-warm-500 dark:text-warm-50"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-warm-300 placeholder-warm-400 text-warm-900 rounded-b-md focus:outline-none focus:ring-terracotta-500 focus:border-terracotta-500 focus:z-10 sm:text-sm dark:bg-warm-800 dark:border-warm-600 dark:placeholder-warm-500 dark:text-warm-50"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 dark:hover:text-terracotta-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-terracotta-600 hover:bg-terracotta-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-500 disabled:opacity-50 dark:bg-terracotta-600 dark:hover:bg-terracotta-500"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-warm-200 dark:border-warm-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-warm-50 dark:bg-warm-950 text-warm-500 dark:text-warm-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={async () => {
                  await signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard",
                  });
                }}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-warm-300 dark:border-warm-600 rounded-md shadow-sm text-sm font-medium text-warm-700 dark:text-warm-50 bg-white dark:bg-warm-800 hover:bg-warm-50 dark:hover:bg-warm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-500"
              >
                <GoogleIcon />
                Sign in with Google
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={async () => {
                  await signIn.social({
                    provider: "linkedin",
                    callbackURL: "/dashboard",
                  });
                }}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-warm-300 dark:border-warm-600 rounded-md shadow-sm text-sm font-medium text-warm-700 dark:text-warm-50 bg-white dark:bg-warm-800 hover:bg-warm-50 dark:hover:bg-warm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-500"
              >
                <LinkedinIcon brand />
                Sign in with LinkedIn
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/auth/signup"
                className="text-terracotta-600 dark:text-terracotta-400 font-medium hover:underline"
              >
                Don&apos;t have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
