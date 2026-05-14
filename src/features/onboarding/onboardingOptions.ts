export const DEFAULT_REMINDER_TIMES = ["09:00", "14:00", "20:00"];

export const INITIAL_PRESET_OPTIONS = [
  {
    id: "technical-concept",
    emoji: "💡",
    label: "J'ai appris un concept technique",
  },
  {
    id: "understood-error",
    emoji: "🔍",
    label: "J'ai compris une erreur",
  },
  {
    id: "discovered-tool",
    emoji: "🛠️",
    label: "J'ai découvert un outil",
  },
  {
    id: "discovered-music",
    emoji: "🎶",
    label: "J'ai découvert de la bonne musique",
  },
  {
    id: "self-learning",
    emoji: "🌱",
    label: "J'ai appris quelque chose sur moi",
  },
  {
    id: "good-discussion",
    emoji: "💬",
    label: "J'ai eu une bonne discussion",
  },
  {
    id: "nothing-yet",
    emoji: "🌙",
    label: "Je n'ai rien appris pour le moment",
  },
] as const;

export type InitialPresetId = (typeof INITIAL_PRESET_OPTIONS)[number]["id"];
