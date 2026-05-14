import { NavLink } from "react-router-dom";

import { primaryNavigation } from "../../app/navigation";

export function BottomNav() {
  return (
    <nav className="z-10 border-t border-white/70 bg-white/80 px-3 py-3 shadow-[0_-18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1 rounded-[1.75rem] bg-slate-950/5 p-1">
        {primaryNavigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "group flex min-h-14 flex-col items-center justify-center gap-1 rounded-3xl px-2 text-[0.72rem] font-semibold transition",
                isActive
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                  : "text-slate-500 hover:bg-white/80 hover:text-slate-900",
              ].join(" ")
            }
          >
            <item.icon
              aria-hidden="true"
              className="size-5 transition group-hover:scale-105"
              strokeWidth={2.2}
            />
            <span className="max-w-full truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
