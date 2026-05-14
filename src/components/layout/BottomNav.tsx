import { useState } from "react";
import { NavLink } from "react-router-dom";

import { primaryNavigation } from "../../app/navigation";

export function BottomNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      aria-label="Navigation principale"
      className={[
        "group fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl px-3 pb-3 transition-transform duration-300 ease-out focus-within:translate-y-0 sm:px-0",
        isOpen ? "translate-y-0" : "translate-y-[calc(100%-2.4rem)]",
      ].join(" ")}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        aria-expanded={isOpen}
        aria-label="Navigation"
        className="mx-auto mb-2 flex h-9 w-28 items-center justify-center rounded-t-[1.5rem] border border-b-0 border-violet-300 bg-violet-600 shadow-[0_-14px_36px_rgba(124,58,237,0.28)] focus:outline-none focus:ring-4 focus:ring-violet-100"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span className="h-1.5 w-12 rounded-full bg-white/95 transition group-hover:bg-white group-focus-within:bg-white" />
      </button>
      <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-2 shadow-[0_-24px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1 rounded-[1.35rem] bg-slate-950/5 p-1">
          {primaryNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "group/item flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[0.72rem] font-semibold transition",
                  isActive
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                    : "text-slate-500 hover:bg-white/80 hover:text-slate-900",
                ].join(" ")
              }
            >
              <item.icon
                aria-hidden="true"
                className="size-5 transition group-hover/item:scale-105"
                strokeWidth={2.2}
              />
              <span className="max-w-full truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
