import { useState } from "react";
import { CalendarDays } from "lucide-react";

import { Button, Card } from "../../components/ui";
import type { WeekStartDay } from "../../lib/db";
import { updateWeekStartsOn } from "./settingsStorage";

type WeekStartSectionProps = {
  weekStartsOn: WeekStartDay;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

export function WeekStartSection({
  weekStartsOn,
  onError,
  onSuccess,
}: WeekStartSectionProps) {
  const [isBusy, setIsBusy] = useState(false);

  async function handleChange(next: WeekStartDay) {
    if (next === weekStartsOn) {
      return;
    }

    setIsBusy(true);
    try {
      await updateWeekStartsOn(next);
      onSuccess(
        next === "monday"
          ? "Semaine alignée sur lundi."
          : "Semaine alignée sur dimanche.",
      );
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour le début de semaine.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card className="mt-4">
      <div className="mb-4 flex items-center gap-3 px-2 text-slate-700">
        <CalendarDays aria-hidden="true" className="size-6 text-emerald-600" />
        <span className="font-bold">Premier jour de la semaine</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          aria-pressed={weekStartsOn === "monday"}
          disabled={isBusy}
          onClick={() => handleChange("monday")}
          variant={weekStartsOn === "monday" ? "primary" : "secondary"}
        >
          Lundi
        </Button>
        <Button
          aria-pressed={weekStartsOn === "sunday"}
          disabled={isBusy}
          onClick={() => handleChange("sunday")}
          variant={weekStartsOn === "sunday" ? "primary" : "secondary"}
        >
          Dimanche
        </Button>
      </div>
    </Card>
  );
}
