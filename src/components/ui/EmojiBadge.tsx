import type { HTMLAttributes } from "react";

import { classNames } from "../../lib/styles/classNames";

type EmojiBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  emoji: string;
};

export function EmojiBadge({ className, emoji, ...props }: EmojiBadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex size-9 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-slate-200/80",
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {emoji}
    </span>
  );
}
