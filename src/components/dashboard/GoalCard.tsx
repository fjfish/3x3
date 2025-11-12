"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import clsx from "clsx";

import { MarkdownToggle } from "@/components/markdown/MarkdownToggle";
import {
  deleteGoalAction,
  updateGoalAction,
  type GoalActionState,
} from "@/server/actions/goals";

import type { ParentOption } from "./CreateGoalForm";

type GoalCardProps = {
  goal: {
    id: string;
    title: string;
    notes: string | null;
    tier: number;
    isPrimary: boolean;
    parentGoalId: string | null;
    parentTitle?: string | null;
  };
  parentOptions: ParentOption[];
};

const initialState: GoalActionState = {};

export function GoalCard({ goal, parentOptions }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateAction = updateGoalAction.bind(null, goal.id);
  const [state, formAction] = useFormState(updateAction, initialState);

  return (
    <article className="space-y-4 rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span
              className={clsx(
                "rounded-full px-3 py-1 font-medium",
                goal.isPrimary
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-neutral-800 text-neutral-300",
              )}
            >
              {goal.isPrimary ? "Primary" : "Extra"}
            </span>
            {goal.parentTitle ? (
              <span className="rounded-full bg-neutral-800 px-3 py-1 font-medium text-neutral-300">
                Linked to: {goal.parentTitle}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="rounded-full border border-neutral-700 px-4 py-1 text-sm font-medium text-white transition hover:border-white"
          >
            {isEditing ? "Close" : "Edit"}
          </button>
          <form
            action={deleteGoalAction}
            onSubmit={(event) => {
              if (!window.confirm("Delete this goal? This can't be undone.")) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="goalId" value={goal.id} />
            <button
              type="submit"
              className="rounded-full border border-transparent px-4 py-1 text-sm font-medium text-rose-300 transition hover:border-rose-500 hover:text-rose-200"
            >
              Delete
            </button>
          </form>
        </div>
      </header>

      <MarkdownToggle content={goal.notes} />

      {isEditing ? (
        <form action={formAction} className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
          <input type="hidden" name="tier" value={goal.tier} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-200">
              Goal title
            </label>
            <input
              name="title"
              defaultValue={goal.title}
              required
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white outline-none transition focus:border-white focus:ring-2 focus:ring-white/20"
            />
          </div>

          {goal.tier >= 4 ? (
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                name="isPrimary"
                defaultChecked={goal.isPrimary}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-neutral-900 focus:ring-white/40"
              />
              Treat as one of the three primary items
            </label>
          ) : null}

          {goal.tier > 1 && parentOptions.length ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-200">
                Parent goal
              </label>
              <select
                name="parentGoalId"
                defaultValue={goal.parentGoalId ?? ""}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white outline-none transition focus:border-white focus:ring-2 focus:ring-white/20"
              >
                <option value="">No parent selected</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    Tier {option.tier}: {option.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-200">
              Notes (Markdown)
            </label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={goal.notes ?? ""}
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white outline-none transition focus:border-white focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div className="min-h-[1.5rem]">
            {state.error ? (
              <p className="text-sm text-rose-400">{state.error}</p>
            ) : null}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:border-white"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}

