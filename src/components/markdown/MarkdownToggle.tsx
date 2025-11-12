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
      <p className="rounded-md border border-dashed border-neutral-700 bg-neutral-900/40 px-3 py-2 text-sm text-neutral-500">
        No notes yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-full border border-neutral-700 bg-neutral-900/40 p-1">
        <button
          type="button"
          onClick={() => setMode("preview")}
          className={clsx(
            "rounded-full px-4 py-1 text-xs font-medium transition",
            mode === "preview"
              ? "bg-white text-neutral-900"
              : "text-neutral-300 hover:text-white",
          )}
        >
          HTML view
        </button>
        <button
          type="button"
          onClick={() => setMode("markdown")}
          className={clsx(
            "rounded-full px-4 py-1 text-xs font-medium transition",
            mode === "markdown"
              ? "bg-white text-neutral-900"
              : "text-neutral-300 hover:text-white",
          )}
        >
          Markdown
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm leading-relaxed text-neutral-200">
        {mode === "preview" ? (
          <ReactMarkdown
            className="space-y-3 leading-relaxed [&_a]:text-white [&_code]:rounded [&_code]:bg-neutral-800 [&_code]:px-1 [&_strong]:text-white"
            remarkPlugins={[remarkGfm]}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-xs text-neutral-300">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}

