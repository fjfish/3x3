"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12">
      <SignUp appearance={{ elements: { card: "shadow-xl bg-neutral-900 text-white" } }} />
    </div>
  );
}

