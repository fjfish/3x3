import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const highlights = [
  {
    title: "Stay aligned",
    description:
      "Connect yearly aspirations to the daily actions that drive them forward.",
  },
  {
    title: "Prioritise with intent",
    description:
      "Set three primary targets for every tier and keep extra tasks organised.",
  },
  {
    title: "Reflect with clarity",
    description:
      "Capture context-rich notes in Markdown and toggle between raw and rendered views.",
  },
];

export default function Home() {
  const { userId } = auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-16 px-6 py-24 text-center">
      <section className="space-y-6">
        <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">
          3 × 3 Goals
        </p>
        <h1 className="text-4xl font-semibold text-white sm:text-6xl">
          Align ambitions with daily execution
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-neutral-300">
          Build a resilient planning cadence with yearly, quarterly, monthly,
          weekly, and daily tiers. Capture notes in Markdown, toggle your view,
          and stay centred on what matters most.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SignUpButton mode="modal">
            <button className="rounded-full bg-white px-6 py-3 font-medium text-neutral-950 transition hover:bg-neutral-200">
              Create your workspace
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="rounded-full border border-neutral-700 px-6 py-3 font-medium text-white transition hover:border-neutral-500">
              Sign in
            </button>
          </SignInButton>
        </div>
      </section>

      <section className="grid w-full gap-6 text-left sm:grid-cols-3">
        {highlights.map((highlight) => (
          <article
            key={highlight.title}
            className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 shadow-lg shadow-black/20"
          >
            <h2 className="text-xl font-semibold text-white">
              {highlight.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">
              {highlight.description}
            </p>
          </article>
        ))}
      </section>

      <p className="text-sm text-neutral-500">
        Already onboard?{" "}
        <Link href="/dashboard" className="text-white underline underline-offset-4">
          Go to your dashboard
        </Link>
      </p>
    </main>
  );
}
