"use server";

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db, schema } from "@/db";
import { and, eq, max, ne, sql } from "drizzle-orm";


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
    isPrimary = isPrimary ?? true;
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
    isPrimary = isPrimary ?? original.isPrimary ?? true;
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

export async function toggleCompleteGoalAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to complete goals.");
  }

  const goalId = formData.get("goalId");

  if (!goalId || typeof goalId !== "string") {
    throw new Error("Goal id is required.");
  }

  const [existingGoal] = await db
    .select({
      completedAt: goals.completedAt,
    })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  if (!existingGoal) {
    throw new Error("Goal not found.");
  }

  await db
    .update(goals)
    .set({
      completedAt: existingGoal.completedAt ? null : new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  revalidatePath("/dashboard");
}

