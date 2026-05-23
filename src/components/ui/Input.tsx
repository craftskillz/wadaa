import type { InputHTMLAttributes, Ref } from "react";

import { classNames } from "../../lib/styles/classNames";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  ref?: Ref<HTMLInputElement>;
};

export function Input({ className, id, label, ref, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      {label ? (
        <span className="mb-2 block text-sm font-bold text-slate-700">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        ref={ref}
        className={classNames(
          "min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100",
          className,
        )}
        {...props}
      />
    </label>
  );
}
