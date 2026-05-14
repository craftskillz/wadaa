import { Outlet } from "react-router-dom";

import { BottomNav } from "./BottomNav";

export function AppShell() {
  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(196,181,253,0.35),_transparent_30rem),linear-gradient(135deg,_#fbfaf7_0%,_#eef6ff_48%,_#f3fff8_100%)] text-slate-950">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
