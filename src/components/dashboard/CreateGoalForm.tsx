"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  createGoalAction,
  type GoalActionState,
} from "@/server/actions/goals";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";

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
  const [state, formAction] = useActionState(createGoalAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Controlled form state to preserve values on error
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);
  const [parentGoalId, setParentGoalId] = useState("");

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
      // Reset form state on success
      setTitle("");
      setNotes("");
      setIsPrimary(true);
      setParentGoalId("");
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="tier" value={tier} />
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Goal title
        </label>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Name the outcome you want to achieve"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {tier >= 4 ? (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name="isPrimary"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
          />
          Treat as one of the three primary items
        </label>
      ) : null}

      {tier > 1 && parentOptions.length ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Connect to a parent goal
          </label>
          <select
            name="parentGoalId"
            value={parentGoalId}
            onChange={(e) => setParentGoalId(e.target.value)}
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

      <MarkdownEditor
        label="Notes"
        name="notes"
        value={notes}
        onChange={setNotes}
        rows={4}
        placeholder="Use Markdown to add context, links, or checklists."
      />

      {state.error ? (
        <p className="text-sm text-rose-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        Add goal
      </button>
    </form>
  );
}
