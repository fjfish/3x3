"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type MarkdownEditorProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
};

export function MarkdownEditor({
  label,
  name,
  value,
  onChange,
  rows = 5,
  placeholder,
  className,
}: MarkdownEditorProps) {
  const editorHeight = Math.max(160, rows * 28 + 80);

  return (
    <div className={clsx("space-y-2", className)}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        data-color-mode="light"
      >
        <MDEditor
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          preview="live"
          height={editorHeight}
          visibleDragbar={false}
          textareaProps={{
            name,
            placeholder,
          }}
          previewOptions={{
            remarkPlugins: [remarkGfm],
          }}
        />
      </div>
      <p className="text-xs text-slate-400">
        Markdown supported, including links, lists, and checkboxes.
      </p>
    </div>
  );
}
