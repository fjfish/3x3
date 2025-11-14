import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { TierSection } from "@/components/dashboard/TierSection";
import type { ParentOption } from "@/components/dashboard/CreateGoalForm";
import { getGoalsGroupedByTier } from "@/server/queries/goals";

const tierMeta = [
  {
    tier: 1,
    title: "Yearly Vision",
    description: "Set the three outcomes that anchor your year.",
    allowExtras: false,
  },
  {
    tier: 2,
    title: "Quarterly Milestones",
    description:
      "Break the year into quarterly targets that ladder up to your annual vision.",
    allowExtras: false,
  },
  {
    tier: 3,
    title: "Monthly Commitments",
    description: "Translate quarterly milestones into focused monthly outputs.",
    allowExtras: false,
  },
  {
    tier: 4,
    title: "Weekly Priorities",
    description:
      "Define your top weekly actions and capture supporting tasks as needed.",
    allowExtras: true,
  },
  {
    tier: 5,
    title: "Daily Focus",
    description:
      "Choose three daily priorities and log any additional work that emerges.",
    allowExtras: true,
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const grouped = await getGoalsGroupedByTier(userId);

  const tierData = tierMeta.map((meta) => {
    const goalsInTier = grouped.find((group) => group.tier === meta.tier)?.goals ?? [];
    const parentTier = meta.tier - 1;
    const parentOptions: ParentOption[] =
      parentTier >= 1
        ? (grouped.find((group) => group.tier === parentTier)?.goals ?? []).map((goal) => ({
          id: goal.id,
          title: goal.title,
          tier: goal.tier,
        }))
        : [];

    const goals = goalsInTier.map((goal) => ({
      id: goal.id,
      title: goal.title,
      notes: goal.notes,
      tier: goal.tier,
      isPrimary: goal.isPrimary,
      parentGoalId: goal.parentGoalId,
      parentTitle: goal.parent?.title ?? null,
      completedAt: goal.completedAt,
      updatedAt: goal.updatedAt,
    }));

    return {
      meta,
      goals,
      parentOptions,
    };
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500">
              Dashboard
            </p>
            <a
              href="https://ko-fi.com/fjfish"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5E5B] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#FF4A47] shadow-sm"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 11h14M5 11a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 11v6a2 2 0 002 2h10a2 2 0 002-2v-6m-9 4h10"
                />
              </svg>
              Buy me a coffee
            </a>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Tiered planning at a glance
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Keep a tight feedback loop from yearly ambitions to daily focus. Use the tiers below to update goals, add contextual notes in Markdown, and reference how each effort connects to the bigger picture.
          </p>
        </div>
      </section>

      <div className="mt-10 space-y-8 pb-12">
        {tierData.map(({ meta, goals, parentOptions }) => (
          <TierSection
            key={meta.tier}
            meta={meta}
            goals={goals}
            parentOptions={parentOptions}
          />
        ))}
      </div>
    </main>
  );
}

