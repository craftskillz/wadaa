import type { TextareaHTMLAttributes } from "react";

import { classNames } from "../../lib/styles/classNames";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ className, id, label, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <label className="block" htmlFor={textareaId}>
      {label ? (
        <span className="mb-2 block text-sm font-bold text-slate-700">
          {label}
        </span>
      ) : null}
      <textarea
        id={textareaId}
        className={classNames(
          "min-h-24 w-full resize-none rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100",
          className,
        )}
        {...props}
      />
    </label>
  );
}
