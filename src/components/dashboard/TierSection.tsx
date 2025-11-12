import { CreateGoalForm, type ParentOption } from "@/components/dashboard/CreateGoalForm";
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

  return (
    <section className="space-y-6 rounded-3xl border border-neutral-900 bg-neutral-950/60 p-8 shadow-xl shadow-black/30">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">
          Tier {meta.tier}: {meta.title}
        </h2>
        <p className="text-sm text-neutral-400">{meta.description}</p>
      </header>

      <CreateGoalForm tier={meta.tier} parentOptions={parentOptions} />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">
          Primary ({primaryGoals.length}/3)
        </h3>
        {primaryGoals.length ? (
          <div className="space-y-4">
            {primaryGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} parentOptions={parentOptions} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
            No primary goals yet. Add your top three targets for this tier.
          </p>
        )}
      </div>

      {meta.allowExtras ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">
            Extra
          </h3>
          {extraGoals.length ? (
            <div className="space-y-4">
              {extraGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} parentOptions={parentOptions} />
              ))}
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
              Capture supporting tasks or ideas here when you have more than three focus items.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}

