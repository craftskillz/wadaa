import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertTriangle, X } from "lucide-react";

import { Button, Input } from "../../components/ui";

const RESET_CONFIRMATION_KEYWORD = "RESET";

type ConfirmResetModalProps = {
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmResetModal({
  isBusy,
  onCancel,
  onConfirm,
}: ConfirmResetModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isConfirmed = typed.trim().toUpperCase() === RESET_CONFIRMATION_KEYWORD;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isConfirmed && !isBusy) {
      onConfirm();
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setTyped(event.target.value);
  }

  return (
    <div
      aria-labelledby="confirm-reset-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/95 p-6 shadow-2xl shadow-slate-950/20">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
            <AlertTriangle aria-hidden="true" className="size-6" />
          </span>
          <div className="flex-1">
            <h2
              className="text-lg font-black text-slate-950"
              id="confirm-reset-title"
            >
              Réinitialiser les données locales
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Toutes les entrées, presets, revues et réglages locaux seront
              effacés. L'application reviendra à l'onboarding initial.
            </p>
          </div>
          <button
            aria-label="Fermer"
            className="text-slate-400 hover:text-slate-700"
            disabled={isBusy}
            onClick={onCancel}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <Input
            autoComplete="off"
            id="confirm-reset-input"
            label={`Pour confirmer, tape ${RESET_CONFIRMATION_KEYWORD}`}
            onChange={handleChange}
            placeholder={RESET_CONFIRMATION_KEYWORD}
            ref={inputRef}
            spellCheck={false}
            value={typed}
          />

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              disabled={isBusy}
              onClick={onCancel}
              type="button"
              variant="secondary"
            >
              Annuler
            </Button>
            <Button
              className="bg-rose-600 text-white shadow-rose-500/30 hover:bg-rose-700"
              disabled={!isConfirmed || isBusy}
              type="submit"
            >
              {isBusy ? "Suppression…" : "Tout effacer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
