"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { RenderMarkdown } from "@/components/markdown/RenderMarkdown";
import {
  deleteGoalAction,
  moveGoalTierAction,
  toggleCompleteGoalAction,
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
    completedAt: Date | null;
    updatedAt: Date;
  };
  parentOptions: ParentOption[];
};

const initialState: GoalActionState = {};

export function GoalCard({ goal, parentOptions }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const updateAction = updateGoalAction.bind(null, goal.id);
  const [updateState, updateFormAction] = useActionState(updateAction, initialState);
  const [completeState, completeFormAction] = useActionState(
    toggleCompleteGoalAction,
    initialState,
  );
  const [moveState, moveFormAction] = useActionState(moveGoalTierAction, initialState);

  const isCompleted = goal.completedAt !== null;
  const canMoveUp = goal.tier > 2;
  const canMoveDown = goal.tier < 5;
  const hasMoveActions = canMoveUp || canMoveDown;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!actionMenuRef.current) return;
      if (actionMenuRef.current.contains(event.target as Node)) {
        return;
      }
      setIsActionMenuOpen(false);
    }

    if (isActionMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionMenuOpen]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    return formatDate(date);
  };

  return (
    <article
      className={clsx(
        "space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md",
        "border-l-4",
        goal.isPrimary ? "border-l-emerald-500" : "border-l-blue-200",
        isCompleted && "opacity-60",
      )}
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h3
            className={clsx(
              "text-lg font-semibold text-slate-900",
              isCompleted && "line-through",
            )}
          >
            {goal.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span
              className={clsx(
                "rounded-full px-3 py-1 font-semibold",
                goal.isPrimary
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-blue-50 text-blue-600",
              )}
            >
              {goal.isPrimary ? "Primary" : "Extra"}
            </span>
            {goal.parentTitle ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                Linked to: {goal.parentTitle}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Updated {formatRelativeTime(goal.updatedAt)}</span>
            {isCompleted && goal.completedAt && (
              <span className="text-emerald-600">
                • Completed {formatRelativeTime(goal.completedAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 relative">
          <div className="flex flex-wrap items-center gap-2 justify-end">
            {hasMoveActions ? (
              <div className="relative" ref={actionMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsActionMenuOpen((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                  aria-haspopup="menu"
                  aria-expanded={isActionMenuOpen}
                >
                  ⋮
                </button>
                {isActionMenuOpen ? (
                  <div className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                    <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Move
                    </p>
                    {canMoveUp ? (
                      <form
                        action={moveFormAction}
                        onSubmit={() => setIsActionMenuOpen(false)}
                        className="mb-1"
                      >
                        <input type="hidden" name="goalId" value={goal.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Move up
                        </button>
                      </form>
                    ) : null}
                    {canMoveDown ? (
                      <form
                        action={moveFormAction}
                        onSubmit={() => setIsActionMenuOpen(false)}
                      >
                        <input type="hidden" name="goalId" value={goal.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Move down
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
            <form action={completeFormAction}>
              <input type="hidden" name="goalId" value={goal.id} />
              <button
                type="submit"
                className={clsx(
                  "rounded-full px-4 py-1 text-sm font-semibold transition",
                  isCompleted
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
                )}
              >
                {isCompleted ? "Completed" : "Complete"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
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
                className="rounded-full border border-rose-100 bg-rose-50 px-4 py-1 text-sm font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-100"
              >
                Delete
              </button>
            </form>
          </div>
          {completeState.error && (
            <p className="text-xs text-rose-600 text-right max-w-xs">
              {completeState.error}
            </p>
          )}
          {moveState.error && (
            <p className="text-xs text-rose-600 text-right max-w-xs">{moveState.error}</p>
          )}
        </div>
      </header>

      <RenderMarkdown content={goal.notes} />

      {isEditing ? (
        <form
          action={updateFormAction}
          className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <input type="hidden" name="tier" value={goal.tier} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Goal title
            </label>
            <input
              name="title"
              defaultValue={goal.title}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {goal.tier >= 4 ? (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="isPrimary"
                defaultChecked={goal.isPrimary}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
              />
              Treat as one of the three primary items
            </label>
          ) : null}

          {goal.tier > 1 && parentOptions.length ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Parent goal
              </label>
              <select
                name="parentGoalId"
                defaultValue={goal.parentGoalId ?? ""}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
            <label className="text-sm font-medium text-slate-700">
              Notes (Markdown)
            </label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={goal.notes ?? ""}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="min-h-[1.5rem]">
            {updateState.error ? (
              <p className="text-sm text-rose-600">{updateState.error}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}

