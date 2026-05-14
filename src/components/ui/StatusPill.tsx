type StatusPillProps = {
  children: string;
  tone?: "mint" | "violet" | "blue" | "slate";
};

const toneClasses: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  mint: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  violet: "bg-violet-100 text-violet-800 ring-violet-200",
  blue: "bg-sky-100 text-sky-800 ring-sky-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function StatusPill({ children, tone = "slate" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
