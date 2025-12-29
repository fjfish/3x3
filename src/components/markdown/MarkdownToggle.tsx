"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";
import remarkGfm from "remark-gfm";

type MarkdownToggleProps = {
  content?: string | null;
  isEditing?: boolean;
};

export function MarkdownToggle({ content, isEditing = false }: MarkdownToggleProps) {
  const [mode, setMode] = useState<"preview" | "markdown">("preview");
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) {
    return null;
  }

  // When not editing, always show rendered markdown without toggle buttons
  if (!isEditing) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
        >
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <svg
            className={clsx(
              "h-5 w-5 text-slate-500 transition-transform duration-200",
              isExpanded && "rotate-180",
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
            isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="pt-2">
            <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-inner">
              <div className="prose prose-sm max-w-none space-y-3 leading-relaxed text-slate-700 [&_a]:text-blue-600 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_strong]:text-slate-900 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-2 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-slate-900 [&_h4]:mt-2 [&_h4]:mb-1 [&_h5]:text-sm [&_h5]:font-medium [&_h5]:text-slate-800 [&_h5]:mt-2 [&_h5]:mb-1 [&_h6]:text-xs [&_h6]:font-medium [&_h6]:text-slate-700 [&_h6]:mt-2 [&_h6]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm [&_thead]:bg-slate-50 [&_th]:border [&_th]:border-slate-300 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-slate-900 [&_td]:border [&_td]:border-slate-300 [&_td]:px-3 [&_td]:py-2 [&_td]:text-slate-700 [&_tr:nth-child(even)]:bg-slate-50 [&_tr:hover]:bg-slate-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // When editing, show toggle buttons to switch between preview and markdown
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
      >
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <svg
          className={clsx(
            "h-5 w-5 text-slate-500 transition-transform duration-200",
            isExpanded && "rotate-180",
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
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="space-y-3 pt-2">
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
              <div className="prose prose-sm max-w-none space-y-3 leading-relaxed text-slate-700 [&_a]:text-blue-600 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_strong]:text-slate-900 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-2 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-slate-900 [&_h4]:mt-2 [&_h4]:mb-1 [&_h5]:text-sm [&_h5]:font-medium [&_h5]:text-slate-800 [&_h5]:mt-2 [&_h5]:mb-1 [&_h6]:text-xs [&_h6]:font-medium [&_h6]:text-slate-700 [&_h6]:mt-2 [&_h6]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm [&_thead]:bg-slate-50 [&_th]:border [&_th]:border-slate-300 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-slate-900 [&_td]:border [&_td]:border-slate-300 [&_td]:px-3 [&_td]:py-2 [&_td]:text-slate-700 [&_tr:nth-child(even)]:bg-slate-50 [&_tr:hover]:bg-slate-100">
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
      </div>
    </div>
  );
}

