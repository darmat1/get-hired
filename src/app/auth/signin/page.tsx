"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">
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
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <svg
                className="h-5 w-5 mr-2"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12.0003 20.45c4.6667 0 8.0167-3.25 8.0167-8.1 0-.6667-.0667-1.3167-.1833-1.9333H12.0003v3.6666h4.5167c-.2 1.05-.8 1.9333-1.7 2.5334v2.1h2.7666c1.6167-1.5 2.55-3.7 2.55-6.2667 0-.6-.05-1.1833-.15-1.7333h-7.9833V9.0167H19.7c.0667.4333.1.8667.1 1.3333 0 3.2333-1.15 5.95-3.0833 7.7333l-2.7667-2.1c-.9667.65-2.2 1.0333-3.95 1.0333-3.0333 0-5.6-2.05-6.5167-4.8H.9167v2.0833C2.8167 18.0667 7.0833 20.45 12.0003 20.45z"
                  fill="#34A853"
                />
                <path
                  d="M5.4836 12.0001c0-.7.1167-1.3667.3333-2.0001V7.9167H.9169C.1669 9.3834-.2331 11.2334-.2331 13.2001c0 1.9667.4 3.8167 1.15 5.2834l2.5667-2.0833c-.2167-.6334-.3334-1.3001-.3334-2.0001z"
                  fill="#FBBC04"
                />
                <path
                  d="M12.0003 3.55c2.3167 0 4.3834.8 6.0167 2.3667l2.1333-2.65C17.75 1.15 15.0667 0 12.0003 0 7.0833 0 2.8167 2.3833.9167 6.45l2.5666 2.0833c.9167-2.75 3.4834-4.8 6.5167-4.8 1.35 0 2.6.4333 3.6333 1.1667l2.25-2.25C14.7336 1.5 13.4336 1 12.0003 1z"
                  style={{ mixBlendMode: "multiply" }}
                  fill="#EA4335"
                />
                <path
                  d="M12.0003 24c5.2333 0 9.6167-3.8 11.2-8.8667l-2.25-2.25c-1.5833 3.5667-5.15 6.1167-9.4 6.1167-3.0333 0-5.6-2.05-6.5167-4.8l-2.5666 2.0833C4.4336 21.05 7.9667 24 12.0003 24z"
                  fill="#4285F4"
                />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-500"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
