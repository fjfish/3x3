"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";

import {
  createGoalAction,
  type GoalActionState,
} from "@/server/actions/goals";

export type ParentOption = {
  id: string;
  title: string;
  tier: number;
};

type CreateGoalFormProps = {
  tier: number;
  parentOptions?: ParentOption[];
};

const initialState: GoalActionState = {};

export function CreateGoalForm({
  tier,
  parentOptions = [],
}: CreateGoalFormProps) {
  const [state, formAction] = useFormState(createGoalAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-3xl border border-neutral-800 bg-neutral-950/40 p-6"
    >
      <input type="hidden" name="tier" value={tier} />
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">
          Goal title
        </label>
        <input
          name="title"
          required
          placeholder="Name the outcome you want to achieve"
          className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white outline-none transition focus:border-white focus:ring-2 focus:ring-white/20"
        />
      </div>

      {tier >= 4 ? (
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            name="isPrimary"
            defaultChecked
            className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-neutral-900 focus:ring-white/40"
          />
          Treat as one of the three primary items
        </label>
      ) : null}

      {tier > 1 && parentOptions.length ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">
            Connect to a parent goal
          </label>
          <select
            name="parentGoalId"
            defaultValue=""
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
        <label className="text-sm font-medium text-neutral-200">Notes</label>
        <textarea
          name="notes"
          rows={4}
          placeholder="Use Markdown to add context, links, or checklists."
          className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white outline-none transition focus:border-white focus:ring-2 focus:ring-white/20"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-rose-400">{state.error}</p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
      >
        Add goal
      </button>
    </form>
  );
}

