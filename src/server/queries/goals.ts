import "server-only";

import { db } from "@/db";

export async function getGoalsForUser(userId: string) {
  return db.query.goals.findMany({
    where: (goal, { eq: eqInner }) => eqInner(goal.userId, userId),
    with: {
      parent: true,
      children: true,
    },
    orderBy: (goal, { asc: ascInner }) => [
      ascInner(goal.tier),
      ascInner(goal.isPrimary),
      ascInner(goal.order),
      ascInner(goal.createdAt),
    ],
  });
}

export async function getGoalsGroupedByTier(userId: string) {
  const allGoals = await getGoalsForUser(userId);
  return [1, 2, 3, 4, 5].map((tier) => ({
    tier,
    goals: allGoals.filter((goal) => goal.tier === tier),
  }));
}

