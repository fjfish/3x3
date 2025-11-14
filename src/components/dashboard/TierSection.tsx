import type { ParentOption } from "@/components/dashboard/CreateGoalForm";
import { TierSectionWithToggle } from "@/components/dashboard/TierSectionWithToggle";

export type DashboardGoal = {
  id: string;
  title: string;
  notes: string | null;
  tier: number;
  isPrimary: boolean;
  parentGoalId: string | null;
  parentTitle?: string | null;
  completedAt: Date | null;
  updatedAt: Date;
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
  return (
    <TierSectionWithToggle meta={meta} goals={goals} parentOptions={parentOptions} />
  );
}

