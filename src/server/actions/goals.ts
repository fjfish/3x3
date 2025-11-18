"use server";

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db, schema } from "@/db";
import { and, eq, isNull, max, ne, sql } from "drizzle-orm";


const { goals, users } = schema;

export type GoalActionState = {
  error?: string;
  success?: boolean;
};

const goalSchema = z.object({
  title: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().trim().min(1, "Title is required").max(256),
  ),
  notes: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    },
    z.string().optional(),
  ),
  tier: z.preprocess(
    (value) => {
      if (typeof value === "number") {
        return value;
      }
      if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
      }
      return undefined;
    },
    z.number().int().min(1).max(5),
  ),
  isPrimary: z.preprocess(
    (value) => {
      if (value === null || value === undefined || value === "") {
        return undefined;
      }
      if (typeof value === "boolean") {
        return value;
      }
      if (typeof value === "string") {
        return value === "true" || value === "on" || value === "1";
      }
      return undefined;
    },
    z.boolean().optional(),
  ),
  parentGoalId: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }
      return value.length ? value : undefined;
    },
    z.string().uuid().optional(),
  ),
});

const updateGoalSchema = goalSchema.extend({
  goalId: z.string().uuid(),
});

const moveGoalSchema = z.object({
  goalId: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

async function ensureUser(userId: string) {
  await db
    .insert(users)
    .values({
      id: userId,
    })
    .onConflictDoNothing();
}

async function countPrimaryGoals(
  userId: string,
  tier: number,
  excludeGoalId?: string,
) {
  const conditions = [
    eq(goals.userId, userId),
    eq(goals.tier, tier),
    eq(goals.isPrimary, true),
    isNull(goals.completedAt),
  ];

  if (excludeGoalId) {
    conditions.push(ne(goals.id, excludeGoalId));
  }

  const [result] = await db
    .select({ value: sql<number>`count(*)` })
    .from(goals)
    .where(and(...conditions));

  return Number(result?.value ?? 0);
}

async function getNextOrder(userId: string, tier: number, isPrimary: boolean) {
  const [result] = await db
    .select({ value: max(goals.order) })
    .from(goals)
    .where(
      and(eq(goals.userId, userId), eq(goals.tier, tier), eq(goals.isPrimary, isPrimary)),
    );

  const nextOrder = (result?.value ?? -1) + 1;
  return nextOrder;
}

async function validateParentGoal(
  userId: string,
  tier: number,
  parentGoalId?: string,
) {
  if (!parentGoalId) {
    return undefined;
  }

  const [parent] = await db
    .select({
      id: goals.id,
      tier: goals.tier,
    })
    .from(goals)
    .where(and(eq(goals.id, parentGoalId), eq(goals.userId, userId)));

  if (!parent) {
    throw new Error("Parent goal was not found.");
  }

  if (parent.tier !== tier - 1) {
    throw new Error("Parent goal must live in the immediately higher tier.");
  }

  return parentGoalId;
}

export async function createGoalAction(
  prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "You must be signed in to create goals." };
  }

  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes"),
    tier: formData.get("tier"),
    isPrimary: formData.get("isPrimary"),
    parentGoalId: formData.get("parentGoalId"),
  });

  if (!parsed.success) {
    const [firstError] = parsed.error.issues;
    return { error: firstError?.message ?? "Invalid goal details." };
  }

  const { title, notes, tier } = parsed.data;
  let { isPrimary, parentGoalId } = parsed.data;

  await ensureUser(userId);

  if (tier <= 3) {
    isPrimary = true;
    parentGoalId = undefined;
  } else {
    isPrimary = isPrimary ?? false;
  }

  if (isPrimary) {
    const primaryCount = await countPrimaryGoals(userId, tier);
    if (primaryCount >= 3) {
      return {
        error: "You already have 3 primary items in this tier. Mark another goal as extra or complete one before adding a new primary goal.",
      };
    }
  }

  try {
    parentGoalId = await validateParentGoal(userId, tier, parentGoalId);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unable to use the selected parent goal." };
  }

  const order = await getNextOrder(userId, tier, isPrimary);

  await db.insert(goals).values({
    userId,
    title,
    notes: notes ?? null,
    tier,
    isPrimary,
    parentGoalId: parentGoalId ?? null,
    order,
  });

  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateGoalAction(
  goalId: string,
  prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "You must be signed in to update goals." };
  }

  const parsed = updateGoalSchema.safeParse({
    goalId,
    title: formData.get("title"),
    notes: formData.get("notes"),
    tier: formData.get("tier"),
    isPrimary: formData.get("isPrimary"),
    parentGoalId: formData.get("parentGoalId"),
  });

  if (!parsed.success) {
    const [firstError] = parsed.error.issues;
    return { error: firstError?.message ?? "Invalid goal details." };
  }

  const existingGoal = await db
    .select({
      tier: goals.tier,
      isPrimary: goals.isPrimary,
    })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  if (!existingGoal.length) {
    return { error: "Goal not found." };
  }

  const original = existingGoal[0];

  const { title, notes, tier } = parsed.data;
  let { isPrimary, parentGoalId } = parsed.data;

  if (tier <= 3) {
    isPrimary = true;
    parentGoalId = undefined;
  } else {
    isPrimary = isPrimary ?? false;
  }

  if (isPrimary) {
    const primaryCount = await countPrimaryGoals(userId, tier, goalId);
    if (primaryCount >= 3 && !original.isPrimary) {
      return {
        error: "You already have 3 primary items in this tier. Mark another goal as extra before upgrading this one.",
      };
    }
  }

  try {
    parentGoalId = await validateParentGoal(userId, tier, parentGoalId);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unable to use the selected parent goal." };
  }

  await db
    .update(goals)
    .set({
      title,
      notes: notes ?? null,
      tier,
      isPrimary,
      parentGoalId: parentGoalId ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteGoalAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to delete goals.");
  }

  const goalId = formData.get("goalId");

  if (!goalId || typeof goalId !== "string") {
    throw new Error("Goal id is required.");
  }

  await db
    .delete(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  revalidatePath("/dashboard");
}

export async function toggleCompleteGoalAction(
  prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "You must be signed in to complete goals." };
  }

  const goalId = formData.get("goalId");

  if (!goalId || typeof goalId !== "string") {
    return { error: "Goal id is required." };
  }

  const [existingGoal] = await db
    .select({
      completedAt: goals.completedAt,
      tier: goals.tier,
      isPrimary: goals.isPrimary,
    })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  if (!existingGoal) {
    return { error: "Goal not found." };
  }

  const isCurrentlyCompleted = existingGoal.completedAt !== null;
  const willBeCompleted = !isCurrentlyCompleted;

  // If uncompleting a primary goal, check if there are already 3 active primary goals
  if (!willBeCompleted && existingGoal.isPrimary) {
    const primaryCount = await countPrimaryGoals(userId, existingGoal.tier);
    if (primaryCount >= 3) {
      return {
        error:
          "You already have 3 active primary goals in this tier. Mark another goal as extra or complete one before uncompleting this goal.",
      };
    }
  }

  await db
    .update(goals)
    .set({
      completedAt: willBeCompleted ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  revalidatePath("/dashboard");

  return { success: true };
}

export async function moveGoalTierAction(
  prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "You must be signed in to move goals between tiers." };
  }

  const parsed = moveGoalSchema.safeParse({
    goalId: formData.get("goalId"),
    direction: formData.get("direction"),
  });

  if (!parsed.success) {
    const [firstError] = parsed.error.issues;
    return { error: firstError?.message ?? "Unable to move goal between tiers." };
  }

  const { goalId, direction } = parsed.data;

  const [goalRecord] = await db
    .select({
      tier: goals.tier,
      isPrimary: goals.isPrimary,
      parentGoalId: goals.parentGoalId,
    })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  if (!goalRecord) {
    return { error: "Goal not found." };
  }

  const isMovingUp = direction === "up";
  const isMovingDown = direction === "down";

  if (isMovingUp && goalRecord.tier <= 2) {
    return { error: "Tier 1 and Tier 2 goals can only move down to lower-focus tiers." };
  }

  const tierDelta = isMovingUp ? -1 : 1;
  const newTier = goalRecord.tier + tierDelta;

  if (newTier < 1 || newTier > 5) {
    return { error: "Goals can only live between tiers 1 and 5." };
  }

  let newIsPrimary = goalRecord.isPrimary;
  let newParentGoalId: string | null = goalRecord.parentGoalId;

  if (newTier <= 3) {
    newIsPrimary = true;
    newParentGoalId = null;
  } else {
    newIsPrimary = !!goalRecord.isPrimary;
    newParentGoalId = null;
  }

  if (newIsPrimary) {
    const primaryCount = await countPrimaryGoals(userId, newTier, goalId);
    if (primaryCount >= 3) {
      if (isMovingDown && newTier >= 4) {
        newIsPrimary = false;
      } else {
        return {
          error:
            "You already have 3 primary items in the destination tier. Mark another goal as extra or complete one before moving this goal.",
        };
      }
    }
  }

  const nextOrder = await getNextOrder(userId, newTier, newIsPrimary);

  await db
    .update(goals)
    .set({
      tier: newTier,
      isPrimary: newIsPrimary,
      parentGoalId: newParentGoalId,
      order: nextOrder,
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  revalidatePath("/dashboard");

  return { success: true };
}

