"use client"

import Link from "next/link"
import { useAuthActions } from "@convex-dev/auth/react"
import { ArrowLeftIcon } from "lucide-react"

export default function Page() {
  const { signIn } = useAuthActions()

  return (
    <div className="relative flex h-svh w-full flex-col items-center justify-center px-2">
      <div className="absolute top-0 left-0 p-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-200 focus:text-neutral-200"
        >
          <ArrowLeftIcon className="size-4" />
          <span>Back to Chat</span>
        </Link>
      </div>

      <span className="block text-4xl leading-none font-bold text-blue-500">ChatX</span>
      <p className="mb-4 text-sm text-neutral-400">Sign in to your account</p>

      <button
        onClick={() => void signIn("google")}
        className="flex items-center justify-center gap-2 rounded-md bg-neutral-100 px-4 py-2 font-bold text-neutral-900 transition-colors hover:bg-neutral-200"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="size-6">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
    </div>
  )
}
