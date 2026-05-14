import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "../../lib/styles/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "pill";
type ButtonSize = "md" | "lg";
type ButtonMotion = "lift" | "none";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  motion?: ButtonMotion;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-950 text-white shadow-xl shadow-slate-950/15 hover:bg-slate-900",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700 hover:shadow-md",
  ghost:
    "text-slate-600 hover:bg-white/70 hover:text-slate-950",
  pill:
    "rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700 hover:shadow-md",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-base",
};

const motionClasses: Record<ButtonMotion, string> = {
  lift: "hover:-translate-y-0.5",
  none: "",
};

export function Button({
  children,
  className,
  icon,
  motion = "lift",
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-black transition focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        motionClasses[motion],
        className,
      )}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
