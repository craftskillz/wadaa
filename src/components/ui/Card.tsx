import type { HTMLAttributes } from "react";

import { classNames } from "../../lib/styles/classNames";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "glass" | "solid" | "muted" | "dashed";
};

const toneClasses: Record<NonNullable<CardProps["tone"]>, string> = {
  glass:
    "border border-white/70 bg-white/75 shadow-xl shadow-slate-900/10 backdrop-blur-xl",
  solid: "bg-white/85 shadow-lg shadow-slate-900/10",
  muted: "bg-slate-950/5",
  dashed: "border border-dashed border-slate-300 bg-white/50",
};

export function Card({
  children,
  className,
  tone = "glass",
  ...props
}: CardProps) {
  return (
    <div
      className={classNames("rounded-[1.75rem] p-5", toneClasses[tone], className)}
      {...props}
    >
      {children}
    </div>
  );
}
