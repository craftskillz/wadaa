import {
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Home,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

export const primaryNavigation: NavigationItem[] = [
  { to: "/", label: "Jour", icon: Home, end: true },
  { to: "/week", label: "Semaine", icon: BookOpenCheck },
  { to: "/calendar", label: "Mois", icon: CalendarDays },
  { to: "/insights", label: "Stats", icon: ChartNoAxesColumnIncreasing },
  { to: "/settings", label: "Réglages", icon: Settings },
];

export const onboardingNavigationItem: NavigationItem = {
  to: "/onboarding",
  label: "Onboarding",
  icon: Sparkles,
};
