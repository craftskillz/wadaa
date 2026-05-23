import { type ChangeEvent, useState } from "react";
import { Bell, Check, Clock, X } from "lucide-react";

import { Button, Card, Input } from "../../components/ui";
import { addReminderTime, removeReminderTime } from "./settingsStorage";

const DEFAULT_CUSTOM_REMINDER_TIME = "18:00";

type RemindersSectionProps = {
  reminderTimes: string[];
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

export function RemindersSection({
  reminderTimes,
  onError,
  onSuccess,
}: RemindersSectionProps) {
  const [customReminderTime, setCustomReminderTime] = useState(
    DEFAULT_CUSTOM_REMINDER_TIME,
  );
  const [isBusy, setIsBusy] = useState(false);

  async function handleAdd() {
    if (!customReminderTime) {
      return;
    }

    setIsBusy(true);
    try {
      await addReminderTime(customReminderTime);
      onSuccess("Heure de rappel ajoutée.");
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter cette heure.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRemove(time: string) {
    setIsBusy(true);
    try {
      await removeReminderTime(time);
      onSuccess("Heure de rappel retirée.");
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Impossible de retirer cette heure.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  function handleCustomChange(event: ChangeEvent<HTMLInputElement>) {
    setCustomReminderTime(event.target.value);
  }

  return (
    <Card className="mt-4">
      <div className="mb-4 flex items-center gap-3 px-2 text-slate-700">
        <Bell aria-hidden="true" className="size-6 text-violet-600" />
        <span className="font-bold">Heures de rappel</span>
      </div>

      {reminderTimes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {reminderTimes.map((time) => (
            <Button
              aria-pressed="true"
              disabled={isBusy}
              icon={<Check aria-hidden="true" className="size-4" />}
              key={time}
              onClick={() => handleRemove(time)}
              variant="primary"
            >
              <span>{time}</span>
              <X aria-hidden="true" className="size-4" />
            </Button>
          ))}
        </div>
      ) : (
        <p className="px-2 text-sm text-slate-500">
          Aucun rappel configuré pour le moment.
        </p>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          label="Ajouter une heure"
          onChange={handleCustomChange}
          type="time"
          value={customReminderTime}
        />
        <Button
          className="self-end"
          disabled={isBusy}
          icon={<Clock aria-hidden="true" className="size-5" />}
          onClick={handleAdd}
          variant="secondary"
        >
          Ajouter
        </Button>
      </div>
    </Card>
  );
}
