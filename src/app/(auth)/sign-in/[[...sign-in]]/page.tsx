"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12">
      <SignIn
        appearance={{ elements: { card: "shadow-xl bg-neutral-900 text-white" } }}
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}

