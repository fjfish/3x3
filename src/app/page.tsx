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

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl flex-col items-center justify-center gap-16 px-6 py-24 text-center">

      <section className="w-full space-y-4">

        <div style={{ position: "relative", paddingBottom: "56.25%", height: "0" }}>
          <iframe
            src="https://www.loom.com/embed/7329cb8363e54d58a543d71458b13dfc"
            allowFullScreen={true}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          />
        </div>
      </section>

      <section className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-500">
          3 × 3 Goals
        </p>
        <h1 className="text-4xl font-semibold text-slate-900 sm:text-6xl">
          Align ambitions with daily execution
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Build a resilient planning cadence with yearly, quarterly, monthly,
          weekly, and daily tiers. Capture notes in Markdown, toggle your view,
          and stay centred on what matters most.
        </p>
      </section>

      <section className="grid w-full gap-6 text-left sm:grid-cols-3">
        {highlights.map((highlight) => (
          <article
            key={highlight.title}
            className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {highlight.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {highlight.description}
            </p>
          </article>
        ))}
      </section>

      <p className="text-sm text-slate-500">
        Already onboard?{" "}
        <Link
          href="/dashboard"
          className="font-semibold text-blue-600 underline underline-offset-4"
        >
          Go to your dashboard
        </Link>
      </p>
    </main>
  );
}
