"use client";

import { useState } from "react";
import clsx from "clsx";

import { GoalCard } from "@/components/dashboard/GoalCard";
import { CollapsibleGoalForm } from "@/components/dashboard/CollapsibleGoalForm";
import type { DashboardGoal } from "@/components/dashboard/TierSection";
import type { ParentOption } from "@/components/dashboard/CreateGoalForm";

type TierSectionWithToggleProps = {
  meta: {
    tier: number;
    title: string;
    description: string;
    allowExtras: boolean;
  };
  goals: DashboardGoal[];
  parentOptions: ParentOption[];
};

export function TierSectionWithToggle({
  meta,
  goals,
  parentOptions,
}: TierSectionWithToggleProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const activeGoals = goals.filter((goal) => goal.completedAt === null);
  const completedGoals = goals.filter((goal) => goal.completedAt !== null);

  const primaryGoals = activeGoals.filter((goal) => goal.isPrimary);
  const extraGoals = activeGoals.filter((goal) => !goal.isPrimary);

  const completedPrimaryGoals = completedGoals.filter((goal) => goal.isPrimary);
  const completedExtraGoals = completedGoals.filter((goal) => !goal.isPrimary);

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
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              <span className={accent.heading}>Tier {meta.tier}</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">{meta.title}</h2>
            <p className="text-sm text-slate-600">{meta.description}</p>
          </div>
          {completedGoals.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCompleted(!showCompleted)}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 whitespace-nowrap"
            >
              {showCompleted ? "Hide" : "Show"} completed ({completedGoals.length})
            </button>
          )}
        </div>
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

      {showCompleted && completedPrimaryGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Completed Primary
          </h3>
          <div className="space-y-3">
            {completedPrimaryGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} parentOptions={parentOptions} />
            ))}
          </div>
        </div>
      )}

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

      {showCompleted && completedExtraGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Completed Extra
          </h3>
          <div className="space-y-3">
            {completedExtraGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} parentOptions={parentOptions} />
            ))}
          </div>
        </div>
      )}

      <CollapsibleGoalForm tier={meta.tier} parentOptions={parentOptions} />
    </section>
  );
}

