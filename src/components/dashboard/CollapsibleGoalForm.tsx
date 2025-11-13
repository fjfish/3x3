"use client";

import { useState } from "react";
import clsx from "clsx";

import { CreateGoalForm, type ParentOption } from "@/components/dashboard/CreateGoalForm";

type CollapsibleGoalFormProps = {
  tier: number;
  parentOptions?: ParentOption[];
};

export function CollapsibleGoalForm({
  tier,
  parentOptions = [],
}: CollapsibleGoalFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
      >
        <span className="text-sm font-medium text-slate-700">Add goal</span>
        <svg
          className={clsx(
            "h-5 w-5 text-slate-500 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={clsx(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="pt-2">
          <CreateGoalForm tier={tier} parentOptions={parentOptions} />
        </div>
      </div>
    </div>
  );
}

