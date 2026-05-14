import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useOnboardingStatus } from "../../features/onboarding/useOnboardingStatus";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  const location = useLocation();
  const onboardingStatus = useOnboardingStatus();
  const isOnboardingRoute = location.pathname === "/onboarding";

  if (onboardingStatus === "loading") {
    return (
      <div className="grid h-screen place-items-center bg-[linear-gradient(135deg,_#fbfaf7_0%,_#eef6ff_48%,_#f3fff8_100%)] px-6 text-center text-slate-950">
        <div>
          <p className="text-sm font-black uppercase text-violet-500">
            Chargement
          </p>
          <p className="mt-3 text-2xl font-black">Préparation de ton espace</p>
        </div>
      </div>
    );
  }

  if (onboardingStatus === "missing" && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboardingStatus === "complete" && isOnboardingRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(196,181,253,0.35),_transparent_30rem),linear-gradient(135deg,_#fbfaf7_0%,_#eef6ff_48%,_#f3fff8_100%)] text-slate-950">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        {isOnboardingRoute ? null : <BottomNav />}
      </div>
    </div>
  );
}
