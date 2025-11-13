"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";
import remarkGfm from "remark-gfm";

type MarkdownToggleProps = {
  content?: string | null;
};

export function MarkdownToggle({ content }: MarkdownToggleProps) {
  const [mode, setMode] = useState<"preview" | "markdown">("preview");

  if (!content) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
        No notes yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setMode("preview")}
          className={clsx(
            "rounded-full px-4 py-1 text-xs font-semibold transition",
            mode === "preview"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          HTML view
        </button>
        <button
          type="button"
          onClick={() => setMode("markdown")}
          className={clsx(
            "rounded-full px-4 py-1 text-xs font-semibold transition",
            mode === "markdown"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          Markdown
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-inner">
        {mode === "preview" ? (
          <div className="prose prose-sm max-w-none space-y-3 leading-relaxed text-slate-700 [&_a]:text-blue-600 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_strong]:text-slate-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-500">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}

