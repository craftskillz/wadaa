import type { ReactNode } from "react";

import { classNames } from "../../lib/styles/classNames";

import { Card } from "./Card";

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  icon?: ReactNode;
  title: string;
  className?: string;
};

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <Card
      tone="dashed"
      className={classNames("text-center text-slate-500", className)}
    >
      {icon ? <div className="mb-3 flex justify-center">{icon}</div> : null}
      <p className="text-base font-black text-slate-700">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}
