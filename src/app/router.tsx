import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { CalendarPage } from "../features/entries/CalendarPage";
import { DayDetailPage } from "../features/entries/DayDetailPage";
import { TodayPage } from "../features/entries/TodayPage";
import { InsightsPage } from "../features/insights/InsightsPage";
import { OnboardingPage } from "../features/onboarding/OnboardingPage";
import { WeekPage } from "../features/reviews/WeekPage";
import { SettingsPage } from "../features/settings/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: "week", element: <WeekPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "calendar/:date", element: <DayDetailPage /> },
      { path: "insights", element: <InsightsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "onboarding", element: <OnboardingPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
