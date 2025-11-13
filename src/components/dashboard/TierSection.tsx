import clsx from "clsx";

import type { ParentOption } from "@/components/dashboard/CreateGoalForm";
import { CollapsibleGoalForm } from "@/components/dashboard/CollapsibleGoalForm";
import { GoalCard } from "@/components/dashboard/GoalCard";

export type DashboardGoal = {
  id: string;
  title: string;
  notes: string | null;
  tier: number;
  isPrimary: boolean;
  parentGoalId: string | null;
  parentTitle?: string | null;
};

type TierSectionProps = {
  meta: {
    tier: number;
    title: string;
    description: string;
    allowExtras: boolean;
  };
  goals: DashboardGoal[];
  parentOptions: ParentOption[];
};

export function TierSection({ meta, goals, parentOptions }: TierSectionProps) {
  const primaryGoals = goals.filter((goal) => goal.isPrimary);
  const extraGoals = goals.filter((goal) => !goal.isPrimary);

  const accentByTier: Record<number, { border: string; heading: string }> = {
    1: {
      border: "border-l-purple-500",
      heading: "text-purple-600",
    },
    2: {
      border: "border-l-blue-500",
      heading: "text-blue-600",
    },
    3: {
      border: "border-l-emerald-500",
      heading: "text-emerald-600",
    },
    4: {
      border: "border-l-amber-500",
      heading: "text-amber-600",
    },
    5: {
      border: "border-l-rose-500",
      heading: "text-rose-600",
    },
  };

  const accent = accentByTier[meta.tier] ?? {
    border: "border-l-slate-400",
    heading: "text-slate-600",
  };

  return (
    <section
      className={clsx(
        "space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md",
        "border-l-4",
        accent.border,
      )}
    >
      <header className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          <span className={accent.heading}>Tier {meta.tier}</span>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">{meta.title}</h2>
        <p className="text-sm text-slate-600">{meta.description}</p>
      </header>

      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          Primary ({primaryGoals.length}/3)
        </h3>
        {primaryGoals.length ? (
          <div className="space-y-3">
            {primaryGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} parentOptions={parentOptions} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No primary goals yet. Add your top three targets for this tier.
          </p>
        )}
      </div>

      {meta.allowExtras ? (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Extra
          </h3>
          {extraGoals.length ? (
            <div className="space-y-3">
              {extraGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} parentOptions={parentOptions} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Capture supporting tasks or ideas here when you have more than three focus items.
            </p>
          )}
        </div>
      ) : null}

      <CollapsibleGoalForm tier={meta.tier} parentOptions={parentOptions} />
    </section>
  );
}

