import { type FormEvent, useState } from "react";
import { ArrowRight, Bell, CalendarDays, Check, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../components/layout/PageHeader";
import { Button, Card, EmojiBadge, Input } from "../../components/ui";
import { classNames } from "../../lib/styles/classNames";
import { completeOnboarding } from "./onboardingStorage";
import {
  DEFAULT_REMINDER_TIMES,
  INITIAL_PRESET_OPTIONS,
  type InitialPresetId,
} from "./onboardingOptions";

const initialSelectedPresetIds = INITIAL_PRESET_OPTIONS.map((option) => option.id);
const defaultCustomReminderTime = "18:00";

export function OnboardingPage() {
  const navigate = useNavigate();
  const [reminderTimes, setReminderTimes] = useState(DEFAULT_REMINDER_TIMES);
  const [customReminderTime, setCustomReminderTime] = useState(
    defaultCustomReminderTime,
  );
  const [selectedPresetIds, setSelectedPresetIds] = useState<InitialPresetId[]>(
    initialSelectedPresetIds,
  );
  const [weekStartsOn, setWeekStartsOn] = useState<"monday" | "sunday">("monday");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleReminderTime(time: string) {
    setReminderTimes((currentTimes) =>
      currentTimes.includes(time)
        ? currentTimes.filter((currentTime) => currentTime !== time)
        : [...currentTimes, time].sort(),
    );
  }

  function addCustomReminderTime() {
    if (!customReminderTime || reminderTimes.includes(customReminderTime)) {
      return;
    }

    setReminderTimes((currentTimes) => [...currentTimes, customReminderTime].sort());
  }

  function togglePreset(id: InitialPresetId) {
    setSelectedPresetIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await completeOnboarding({
        reminderTimes,
        selectedPresetIds,
        weekStartsOn,
      });
      navigate("/", { replace: true });
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "L'onboarding n'a pas pu être sauvegardé.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Première expérience"
        title="Qu'as-tu appris aujourd'hui ?"
        description="Note tes apprentissages au fil de la journée, garde les meilleurs en fin de semaine, et visualise ta progression."
      />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <Bell aria-hidden="true" className="size-6 text-violet-600" />
            <p className="font-black text-slate-900">Heures de rappel</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {DEFAULT_REMINDER_TIMES.map((time) => {
              const isSelected = reminderTimes.includes(time);

              return (
                <Button
                  aria-pressed={isSelected}
                  icon={
                    isSelected ? (
                      <Check aria-hidden="true" className="size-4" />
                    ) : null
                  }
                  key={time}
                  onClick={() => toggleReminderTime(time)}
                  variant={isSelected ? "primary" : "secondary"}
                >
                  {time}
                </Button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              label="Ajouter une heure"
              onChange={(event) => setCustomReminderTime(event.target.value)}
              type="time"
              value={customReminderTime}
            />
            <Button
              className="self-end"
              icon={<Clock aria-hidden="true" className="size-5" />}
              onClick={addCustomReminderTime}
              variant="secondary"
            >
              Ajouter
            </Button>
          </div>

          {reminderTimes.length > DEFAULT_REMINDER_TIMES.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {reminderTimes
                .filter((time) => !DEFAULT_REMINDER_TIMES.includes(time))
                .map((time) => (
                  <Button
                    aria-pressed="true"
                    key={time}
                    onClick={() => toggleReminderTime(time)}
                    variant="pill"
                  >
                    {time}
                  </Button>
                ))}
            </div>
          ) : null}
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <EmojiBadge emoji="✨" className="size-10 text-lg" />
            <p className="font-black text-slate-900">Choix rapides</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {INITIAL_PRESET_OPTIONS.map((option) => {
              const isSelected = selectedPresetIds.includes(option.id);

              return (
                <button
                  aria-pressed={isSelected}
                  className={classNames(
                    "flex min-h-16 items-center gap-3 rounded-2xl border px-4 py-3 text-left font-bold transition focus:outline-none focus:ring-4 focus:ring-violet-100",
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                      : "border-slate-200 bg-white/75 text-slate-700 hover:border-violet-200 hover:text-violet-700",
                  )}
                  key={option.id}
                  onClick={() => togglePreset(option.id)}
                  type="button"
                >
                  <EmojiBadge emoji={option.emoji} className="size-9 text-base" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays aria-hidden="true" className="size-6 text-emerald-600" />
            <p className="font-black text-slate-900">Début de semaine</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              aria-pressed={weekStartsOn === "monday"}
              onClick={() => setWeekStartsOn("monday")}
              variant={weekStartsOn === "monday" ? "primary" : "secondary"}
            >
              Lundi
            </Button>
            <Button
              aria-pressed={weekStartsOn === "sunday"}
              onClick={() => setWeekStartsOn("sunday")}
              variant={weekStartsOn === "sunday" ? "primary" : "secondary"}
            >
              Dimanche
            </Button>
          </div>
        </Card>

        {statusMessage ? (
          <p className="px-2 text-sm font-bold text-rose-600" role="alert">
            {statusMessage}
          </p>
        ) : null}

        <Button
          className="w-full"
          disabled={isSubmitting}
          icon={<ArrowRight aria-hidden="true" className="size-5" />}
          size="lg"
          type="submit"
        >
          Commencer
        </Button>
      </form>
    </section>
  );
}
