import { AlertCircle, CheckCircle2 } from "lucide-react";

export type StatusToastTone = "success" | "error";

export type StatusToastValue = {
  id: number;
  message: string;
  tone: StatusToastTone;
};

type StatusToastBannerProps = {
  toast: StatusToastValue | null;
  isVisible: boolean;
};

export function StatusToastBanner({ toast, isVisible }: StatusToastBannerProps) {
  if (!toast) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={[
        "fixed left-1/2 top-6 z-50 flex w-[min(92vw,32rem)] -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-4 text-base font-black shadow-2xl backdrop-blur-xl transition duration-300 ease-out",
        toast.tone === "success"
          ? "bg-emerald-500/95 text-white shadow-emerald-500/40"
          : "bg-rose-500/95 text-white shadow-rose-500/40",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
      ].join(" ")}
      role="status"
    >
      {toast.tone === "success" ? (
        <CheckCircle2 aria-hidden="true" className="size-6 shrink-0" />
      ) : (
        <AlertCircle aria-hidden="true" className="size-6 shrink-0" />
      )}
      <span className="flex-1 leading-snug">{toast.message}</span>
    </div>
  );
}
