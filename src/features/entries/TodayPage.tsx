import {
  type ChangeEvent,
  type FormEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDownToLine,
  BookmarkPlus,
  Clock3,
  ExternalLink,
  ImageIcon,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import blossomTreeUrl from "../../assets/river-sprites/blossom-tree.png";
import palmTreeUrl from "../../assets/river-sprites/palm-tree.png";
import redTreeUrl from "../../assets/river-sprites/red-tree.png";
import rounderLeafTreeUrl from "../../assets/river-sprites/rounder-leaf-tree.png";
import denseShrubUrl from "../../assets/river-sprites/dense-shrub.png";
import doublePalmsUrl from "../../assets/river-sprites/double-palms.png";
import gentleTreeUrl from "../../assets/river-sprites/gentle-tree.png";
import leafPlantUrl from "../../assets/river-sprites/leaf-plant.png";
import roundBushUrl from "../../assets/river-sprites/round-bush.png";
import {
  Button,
  Card,
  EmptyState,
  Input,
  StatusPill,
  StatusToastBanner,
  Textarea,
  useStatusToast,
} from "../../components/ui";
import { formatDayLabel, formatTimeLabel } from "../../lib/dates";
import { classNames } from "../../lib/styles/classNames";
import {
  createCustomEntry,
  createEntryFromPreset,
  createPresetFromCustomEntry,
  deleteEntry,
  isEmptyPreset,
  normalizePresetLabel,
  updateEntryCoverImage,
} from "./entryStorage";
import { useTimelineData, type TimelineDay } from "./useTimelineData";
import { useActiveDay } from "./useActiveDay";
import type { LearningEntry, LearningPreset } from "../../lib/db";

const INITIAL_TIMELINE_DAYS_VISIBLE = 7;
const TIMELINE_DAYS_LOAD_STEP = 14;
const TIMELINE_MAX_MONTHS_VISIBLE = 6;
const TIMELINE_SCROLL_TOP_LOAD_THRESHOLD_PX = 80;
const TIMELINE_MS_PER_DAY = 24 * 60 * 60 * 1000;
const TIMELINE_INCLUSIVE_DAY_COUNT_OFFSET = 1;
const TIMELINE_VIEWBOX_WIDTH = 140;
const TIMELINE_VIEWBOX_HEIGHT = 1200;
const TIMELINE_PATH =
  "M70 0 C28 100 28 200 70 300 C112 400 112 500 70 600 C28 700 28 800 70 900 C112 1000 112 1100 70 1200";
const TIMELINE_RIVER_BANK_WIDTH = 84;
const TIMELINE_RIVER_BODY_WIDTH = 60;
const TIMELINE_RIVER_SHORE_WIDTH = 68;
const TIMELINE_RIVER_SECTION_CAP = "butt";
const AUTO_SCROLL_GRACE_PERIOD_MS = 2500;
const COVER_MIN_FILL_RATIO = 1.2;
const COVER_MAX_FILL_RATIO = 2.0;
const VIEWPORT_TOP_PX = 0;
const RIVER_SURFACE_STROKE_WIDTH = 1.6;
const RIVER_SURFACE_SOFT_STROKE_WIDTH = 4;
const RIVER_SURFACE_HALF_DIVISOR = 2;
const RIVER_SURFACE_CONTROL_DIVISOR = 3;
const RIVER_POSITION_PERCENT = 100;
const TIMELINE_PATH_SEGMENT_HEIGHT = 300;
const TIMELINE_PATH_SEGMENT_COUNT = 4;
const TIMELINE_PATH_CENTER_X = 70;
const TIMELINE_PATH_LEFT_CONTROL_X = 28;
const TIMELINE_PATH_RIGHT_CONTROL_X = 112;
const TIMELINE_PATH_ALTERNATION_DIVISOR = 2;
const CUBIC_BEZIER_CONTROL_WEIGHT = 3;
const RIVER_SPRITE_SCALE_MULTIPLIER = 2;
const WATER_PLANT_DISTANCE_PX = 52;
const TREE_GROUP_DISTANCE_PX = 144;
const RIVER_SPRITE_CLUSTER_SAME_SIDE_MULTIPLIER = 1;
const RIVER_SPRITE_CLUSTER_OPPOSITE_SIDE_MULTIPLIER = -1;
const RIVER_WATER_PLANT_PAIR_OFFSET_TIGHT = 14;
const RIVER_WATER_PLANT_PAIR_OFFSET_DIAGONAL = 22;
const RIVER_WATER_PLANT_PAIR_SCALE_SECONDARY = 0.92;
const RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT = 16;
const RIVER_TREE_GROUP_CLUSTER_OFFSET_WIDE = 28;
const RIVER_TREE_GROUP_CLUSTER_SCALE_SMALL = 0.82;
const RIVER_TREE_GROUP_CLUSTER_SCALE_MEDIUM = 0.9;
const RIVER_TREE_GROUP_CLUSTER_SCALE_FULL = 1;
const RIVER_ATLAS_HASH_OFFSET_BASIS = 2_166_136_261;
const RIVER_ATLAS_HASH_PRIME = 16_777_619;
const RIVER_ATLAS_HASH_MODULO = 2 ** 32;
const RIVER_ATLAS_MAX_PLACEMENTS_PER_SECTION = 6;
const RIVER_TREE_GROUP_CROWDING_GAP_PX = 520;
const RIVER_TREE_NEAR_SPRITE_GAP_PX = 520;
const RIVER_TREE_BOTTOM_SHIFT_PADDING_PX = 60;
const RIVER_CARD_OVERLAP_HALF_HEIGHT_PX = 320;
const RIVER_TODAY_FIRST_CARD_CENTER_Y = 560;
const RIVER_STANDARD_FIRST_CARD_CENTER_Y = 240;
const RIVER_ENTRY_CARD_CENTER_STEP_Y = 260;

function getTimelineMaxDaysCount(today = new Date()) {
  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);

  const oldestVisibleDate = new Date(todayMidnight);
  oldestVisibleDate.setMonth(
    oldestVisibleDate.getMonth() - TIMELINE_MAX_MONTHS_VISIBLE,
  );

  return (
    Math.floor(
      (todayMidnight.getTime() - oldestVisibleDate.getTime()) /
        TIMELINE_MS_PER_DAY,
    ) + TIMELINE_INCLUSIVE_DAY_COUNT_OFFSET
  );
}

type RiverAtlasSpriteId =
  | "palmTree"
  | "redTree"
  | "rounderLeafTree"
  | "blossomTree"
  | "denseShrub"
  | "doublePalms"
  | "gentleTree"
  | "leafPlant"
  | "roundBush";

type RiverSpriteAffinity = "waterPlant" | "treeGroup";
type RiverSpriteSide = "left" | "right";
type RiverTreeGroupClusterPatternId = "three" | "four" | "five";
type RiverWaterPlantClusterPatternId =
  | "single"
  | "sideBySide"
  | "oppositeDiagonal";
type RiverSpriteClusterPatternId =
  | RiverTreeGroupClusterPatternId
  | RiverWaterPlantClusterPatternId;

type RiverSurfaceRipple = {
  x: number;
  y: number;
  width: number;
  curve: number;
  rotation: number;
  opacity: number;
};

type RiverAtlasSprite = {
  url: string;
  width: number;
  height: number;
  scale: number;
};

type RiverAtlasSpritePlacement = {
  affinity: RiverSpriteAffinity;
  side: RiverSpriteSide;
  spriteId: RiverAtlasSpriteId;
  y: number;
  scale: number;
  opacity?: number;
  clusterPattern?: RiverSpriteClusterPatternId;
};

type RiverAtlasResolvedPlacement = {
  index: number;
  placement: RiverAtlasSpritePlacement;
};

type RiverCardOverlapZone = {
  y: number;
};

type RiverSpriteClusterItem = {
  offsetX: number;
  offsetY: number;
  scale: number;
  sideMultiplier?: number;
};

const RIVER_SPRITE_DISTANCE_BY_AFFINITY: Record<RiverSpriteAffinity, number> = {
  waterPlant: WATER_PLANT_DISTANCE_PX,
  treeGroup: TREE_GROUP_DISTANCE_PX,
};

const RIVER_SPRITE_SIDE_MULTIPLIER: Record<RiverSpriteSide, number> = {
  left: -1,
  right: 1,
};

const RIVER_SINGLE_SPRITE_CLUSTER: RiverSpriteClusterItem[] = [
  {
    offsetX: 0,
    offsetY: 0,
    scale: RIVER_TREE_GROUP_CLUSTER_SCALE_FULL,
    sideMultiplier: RIVER_SPRITE_CLUSTER_SAME_SIDE_MULTIPLIER,
  },
];

const RIVER_WATER_PLANT_CLUSTER_PATTERNS: Record<
  RiverWaterPlantClusterPatternId,
  RiverSpriteClusterItem[]
> = {
  single: RIVER_SINGLE_SPRITE_CLUSTER,
  sideBySide: [
    {
      offsetX: -RIVER_WATER_PLANT_PAIR_OFFSET_TIGHT,
      offsetY: -RIVER_WATER_PLANT_PAIR_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_FULL,
      sideMultiplier: RIVER_SPRITE_CLUSTER_SAME_SIDE_MULTIPLIER,
    },
    {
      offsetX: RIVER_WATER_PLANT_PAIR_OFFSET_TIGHT,
      offsetY: RIVER_WATER_PLANT_PAIR_OFFSET_TIGHT,
      scale: RIVER_WATER_PLANT_PAIR_SCALE_SECONDARY,
      sideMultiplier: RIVER_SPRITE_CLUSTER_SAME_SIDE_MULTIPLIER,
    },
  ],
  oppositeDiagonal: [
    {
      offsetX: 0,
      offsetY: -RIVER_WATER_PLANT_PAIR_OFFSET_DIAGONAL,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_FULL,
      sideMultiplier: RIVER_SPRITE_CLUSTER_SAME_SIDE_MULTIPLIER,
    },
    {
      offsetX: 0,
      offsetY: RIVER_WATER_PLANT_PAIR_OFFSET_DIAGONAL,
      scale: RIVER_WATER_PLANT_PAIR_SCALE_SECONDARY,
      sideMultiplier: RIVER_SPRITE_CLUSTER_OPPOSITE_SIDE_MULTIPLIER,
    },
  ],
};

const RIVER_TREE_GROUP_CLUSTER_PATTERNS: Record<
  RiverTreeGroupClusterPatternId,
  RiverSpriteClusterItem[]
> = {
  three: [
    {
      offsetX: -RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      offsetY: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_MEDIUM,
    },
    {
      offsetX: 0,
      offsetY: -RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_FULL,
    },
    {
      offsetX: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      offsetY: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_SMALL,
    },
  ],
  four: [
    {
      offsetX: -RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      offsetY: -RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_MEDIUM,
    },
    {
      offsetX: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      offsetY: -RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_FULL,
    },
    {
      offsetX: -RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      offsetY: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_SMALL,
    },
    {
      offsetX: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      offsetY: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_MEDIUM,
    },
  ],
  five: [
    {
      offsetX: -RIVER_TREE_GROUP_CLUSTER_OFFSET_WIDE,
      offsetY: 0,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_SMALL,
    },
    {
      offsetX: -RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      offsetY: -RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_MEDIUM,
    },
    {
      offsetX: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      offsetY: -RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_FULL,
    },
    {
      offsetX: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      offsetY: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_MEDIUM,
    },
    {
      offsetX: RIVER_TREE_GROUP_CLUSTER_OFFSET_WIDE,
      offsetY: RIVER_TREE_GROUP_CLUSTER_OFFSET_TIGHT,
      scale: RIVER_TREE_GROUP_CLUSTER_SCALE_SMALL,
    },
  ],
};

const RIVER_SURFACE_RIPPLES: RiverSurfaceRipple[] = [
  { x: 62, y: 115, width: 14, curve: 3, rotation: -9, opacity: 0.16 },
  { x: 80, y: 238, width: 18, curve: -4, rotation: 7, opacity: 0.12 },
  { x: 57, y: 378, width: 11, curve: 2, rotation: -13, opacity: 0.1 },
  { x: 84, y: 526, width: 16, curve: 4, rotation: 10, opacity: 0.14 },
  { x: 63, y: 690, width: 20, curve: -3, rotation: -5, opacity: 0.12 },
  { x: 78, y: 848, width: 13, curve: 3, rotation: 14, opacity: 0.11 },
  { x: 59, y: 1006, width: 17, curve: -4, rotation: -8, opacity: 0.13 },
  { x: 82, y: 1132, width: 12, curve: 2, rotation: 11, opacity: 0.1 },
];

const RIVER_ATLAS_SPRITES: Record<RiverAtlasSpriteId, RiverAtlasSprite> = {
  palmTree: {
    url: palmTreeUrl,
    width: 265,
    height: 265,
    scale: 0.35,
  },
  redTree: {
    url: redTreeUrl,
    width: 265,
    height: 265,
    scale: 0.23,
  },
  rounderLeafTree: {
    url: rounderLeafTreeUrl,
    width: 265,
    height: 265,
    scale: 0.16,
  },
  blossomTree: {
    url: blossomTreeUrl,
    width: 265,
    height: 265,
    scale: 0.21,
  },
  denseShrub: {
    url: denseShrubUrl,
    width: 265,
    height: 265,
    scale: 0.13,
  },
  doublePalms: {
    url: doublePalmsUrl,
    width: 265,
    height: 265,
    scale: 0.12,
  },
  gentleTree: {
    url: gentleTreeUrl,
    width: 265,
    height: 265,
    scale: 0.18,
  },
  leafPlant: {
    url: leafPlantUrl,
    width: 265,
    height: 265,
    scale: 0.12,
  },
  roundBush: {
    url: roundBushUrl,
    width: 265,
    height: 265,
    scale: 0.24,
  },
};

const RIVER_ATLAS_SPRITE_IDS_BY_AFFINITY: Record<
  RiverSpriteAffinity,
  RiverAtlasSpriteId[]
> = {
  waterPlant: ["doublePalms", "leafPlant"],
  treeGroup: [
    "roundBush",
    "gentleTree",
    "palmTree",
    "denseShrub",
    "blossomTree",
    "rounderLeafTree",
    "redTree",
  ],
};

const RIVER_ATLAS_PLACEMENTS: RiverAtlasSpritePlacement[] = [
  {
    affinity: "waterPlant",
    side: "left",
    spriteId: "doublePalms",
    y: 92,
    scale: 0.12,
    opacity: 0.86,
    clusterPattern: "sideBySide",
  },
  {
    affinity: "treeGroup",
    side: "right",
    spriteId: "roundBush",
    y: 185,
    scale: 0.12,
    opacity: 0.82,
    clusterPattern: "three",
  },
  {
    affinity: "waterPlant",
    side: "left",
    spriteId: "leafPlant",
    y: 360,
    scale: 0.12,
    opacity: 0.88,
    clusterPattern: "oppositeDiagonal",
  },
  {
    affinity: "treeGroup",
    side: "left",
    spriteId: "redTree",
    y: 520,
    scale: 0.12,
    opacity: 0.84,
    clusterPattern: "four",
  },
  {
    affinity: "treeGroup",
    side: "right",
    spriteId: "gentleTree",
    y: 650,
    scale: 0.12,
    opacity: 0.84,
    clusterPattern: "three",
  },
  {
    affinity: "treeGroup",
    side: "left",
    spriteId: "denseShrub",
    y: 785,
    scale: 0.12,
    opacity: 0.84,
    clusterPattern: "five",
  },
  {
    affinity: "treeGroup",
    side: "right",
    spriteId: "palmTree",
    y: 905,
    scale: 0.12,
    opacity: 0.84,
    clusterPattern: "three",
  },
  {
    affinity: "treeGroup",
    side: "left",
    spriteId: "rounderLeafTree",
    y: 1030,
    scale: 0.12,
    opacity: 0.82,
    clusterPattern: "four",
  },
  {
    affinity: "treeGroup",
    side: "right",
    spriteId: "blossomTree",
    y: 1140,
    scale: 0.11,
    opacity: 0.82,
    clusterPattern: "four",
  },
];

const RIVER_ATLAS_PLACEMENT_GROUPS: number[][] = [
  [0, 1],
  [2],
  [3, 4],
  [5],
  [6, 7],
  [8],
];

type DayTheme = {
  primaryColor: string;
  secondaryColor: string;
  pill: { background: string; color: string; ring: string };
};

type GradientDirection = "leftToRight" | "rightToLeft";

function buildDayBackground(
  theme: DayTheme,
  direction: GradientDirection,
): string {
  const primaryX = direction === "leftToRight" ? "22%" : "78%";
  const secondaryX = direction === "leftToRight" ? "78%" : "22%";
  return `radial-gradient(at ${primaryX} 28%, ${theme.primaryColor} 0%, transparent 55%), radial-gradient(at ${secondaryX} 75%, ${theme.secondaryColor} 0%, transparent 60%)`;
}

// Indexed by day of week (0 = Sunday, 6 = Saturday).
// Order chosen as a soft rainbow so adjacent calendar days share neighbouring hues.
// Composition (gradient layout) is unified — only colours vary per day.
const DAY_THEMES: DayTheme[] = [
  {
    // Sunday — Sage (lime/green)
    primaryColor: "rgba(190, 242, 100, 0.55)",
    secondaryColor: "rgba(134, 239, 172, 0.4)",
    pill: {
      background: "rgb(236 252 203)",
      color: "rgb(63 98 18)",
      ring: "rgb(217 249 157)",
    },
  },
  {
    // Monday — Sunset (orange/amber)
    primaryColor: "rgba(253, 186, 116, 0.55)",
    secondaryColor: "rgba(252, 211, 77, 0.4)",
    pill: {
      background: "rgb(255 237 213)",
      color: "rgb(154 52 18)",
      ring: "rgb(254 215 170)",
    },
  },
  {
    // Tuesday — Sunrise (amber/rose)
    primaryColor: "rgba(253, 224, 71, 0.55)",
    secondaryColor: "rgba(252, 165, 165, 0.4)",
    pill: {
      background: "rgb(254 243 199)",
      color: "rgb(146 64 14)",
      ring: "rgb(253 230 138)",
    },
  },
  {
    // Wednesday — Blossom (rose/pink)
    primaryColor: "rgba(249, 168, 212, 0.55)",
    secondaryColor: "rgba(244, 114, 182, 0.4)",
    pill: {
      background: "rgb(252 231 243)",
      color: "rgb(157 23 77)",
      ring: "rgb(251 207 232)",
    },
  },
  {
    // Thursday — Lavender (violet/indigo)
    primaryColor: "rgba(196, 181, 253, 0.55)",
    secondaryColor: "rgba(165, 180, 252, 0.4)",
    pill: {
      background: "rgb(237 233 254)",
      color: "rgb(76 29 149)",
      ring: "rgb(221 214 254)",
    },
  },
  {
    // Friday — Sky (sky/blue)
    primaryColor: "rgba(125, 211, 252, 0.55)",
    secondaryColor: "rgba(147, 197, 253, 0.4)",
    pill: {
      background: "rgb(224 242 254)",
      color: "rgb(7 89 133)",
      ring: "rgb(186 230 253)",
    },
  },
  {
    // Saturday — Mint (emerald/teal)
    primaryColor: "rgba(110, 231, 183, 0.55)",
    secondaryColor: "rgba(94, 234, 212, 0.4)",
    pill: {
      background: "rgb(209 250 229)",
      color: "rgb(6 95 70)",
      ring: "rgb(167 243 208)",
    },
  },
];

const NEUTRAL_PILL = {
  background: "rgb(241 245 249)",
  color: "rgb(51 65 85)",
  ring: "rgb(226 232 240)",
};

const DAY_BACKGROUND_FADE_MASK =
  "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)";

function hasVisiblePresetForEntry(
  entryContent: string,
  presets: LearningPreset[],
) {
  const normalizedEntryContent = normalizePresetLabel(entryContent);

  return presets.some(
    (preset) => normalizePresetLabel(preset.label) === normalizedEntryContent,
  );
}

function getEntrySourceLabel(source: LearningEntry["source"]) {
  if (source === "preset") {
    return "Choix rapide";
  }

  if (source === "custom") {
    return "Idée libre";
  }

  return "Pause";
}

function isStoredCoverImageUsable(
  coverImage: LearningEntry["coverImage"],
): coverImage is Blob {
  return coverImage instanceof Blob && coverImage.size > 0;
}

function useEntryCoverImageUrl(coverImage: Blob | undefined) {
  const [objectUrl, setObjectUrl] = useState<string | undefined>();

  useEffect(() => {
    let isCurrent = true;

    if (!isStoredCoverImageUsable(coverImage)) {
      queueMicrotask(() => {
        if (isCurrent) {
          setObjectUrl(undefined);
        }
      });

      return () => {
        isCurrent = false;
      };
    }

    const nextObjectUrl = URL.createObjectURL(coverImage);
    queueMicrotask(() => {
      if (isCurrent) {
        setObjectUrl(nextObjectUrl);
      }
    });

    return () => {
      isCurrent = false;
      URL.revokeObjectURL(nextObjectUrl);
    };
  }, [coverImage]);

  return objectUrl;
}

type CoverFitState = {
  key: string;
  value: "cover" | "contain";
};

type CoverErrorState = {
  hasError: boolean;
  key: string;
};

function getCoverRenderKey(entry: LearningEntry) {
  return `${entry.id}:${entry.updatedAt}:${entry.url ?? ""}`;
}

function EntryCoverImage({ entry }: { entry: LearningEntry }) {
  const coverRenderKey = getCoverRenderKey(entry);
  const hasUsableStoredCover = isStoredCoverImageUsable(entry.coverImage);
  const storedCoverUrl = useEntryCoverImageUrl(entry.coverImage);
  const [coverErrorState, setCoverErrorState] = useState<CoverErrorState>({
    hasError: false,
    key: coverRenderKey,
  });
  const [coverFitState, setCoverFitState] = useState<CoverFitState>({
    key: coverRenderKey,
    value: "cover",
  });
  const hasStoredCoverError =
    coverErrorState.key === coverRenderKey ? coverErrorState.hasError : false;
  const objectFit =
    coverFitState.key === coverRenderKey ? coverFitState.value : "cover";
  const youtubeFallback =
    hasUsableStoredCover && !hasStoredCoverError
      ? undefined
      : getYouTubeThumbnailUrl(entry.url);
  const previewUrl =
    hasUsableStoredCover && !hasStoredCoverError
      ? storedCoverUrl
      : youtubeFallback;

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const img = event.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) {
      return;
    }
    const ratio = img.naturalWidth / img.naturalHeight;
    const fillsContainerNicely =
      ratio >= COVER_MIN_FILL_RATIO && ratio <= COVER_MAX_FILL_RATIO;
    setCoverFitState({
      key: coverRenderKey,
      value: fillsContainerNicely ? "cover" : "contain",
    });
  }

  function handleImageError() {
    if (hasUsableStoredCover && !hasStoredCoverError) {
      setCoverErrorState({ hasError: true, key: coverRenderKey });
    }
  }

  if (previewUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden bg-slate-100">
        <img
          alt=""
          className={[
            "block h-full w-full",
            objectFit === "cover" ? "object-cover" : "object-contain",
          ].join(" ")}
          onError={handleImageError}
          onLoad={handleImageLoad}
          src={previewUrl}
        />
      </div>
    );
  }

  return (
    <div
      aria-busy="true"
      aria-label="Chargement de l'aperçu"
      className="relative flex aspect-video w-full animate-pulse items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-300"
      role="status"
    >
      <ImageIcon aria-hidden="true" className="size-7" />
    </div>
  );
}

function getYouTubeThumbnailUrl(entryUrl?: string) {
  if (!entryUrl) {
    return undefined;
  }

  try {
    const url = new URL(entryUrl);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : undefined;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId =
        url.searchParams.get("v") ??
        url.pathname.match(/^\/(?:shorts|embed)\/([^/?#]+)/)?.[1];

      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function normalizeEntryUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  try {
    return new URL(trimmedValue).toString();
  } catch {
    throw new Error("Entre une URL valide ou laisse le champ vide.");
  }
}

function scrollSectionToMainStart(
  section: HTMLElement,
  behavior: ScrollBehavior = "auto",
) {
  const scrollContainer = document.querySelector("main");

  if (!scrollContainer) {
    section.scrollIntoView({ block: "start", behavior });
    return;
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  const sectionRect = section.getBoundingClientRect();

  scrollContainer.scrollTo({
    behavior,
    top: scrollContainer.scrollTop + sectionRect.top - containerRect.top,
  });
}

function getCubicBezierX(progress: number, controlX: number) {
  const remainingProgress = 1 - progress;
  const firstControlWeight =
    CUBIC_BEZIER_CONTROL_WEIGHT *
    remainingProgress *
    remainingProgress *
    progress;
  const secondControlWeight =
    CUBIC_BEZIER_CONTROL_WEIGHT * remainingProgress * progress * progress;
  const endpointWeight =
    remainingProgress * remainingProgress * remainingProgress +
    progress * progress * progress;

  return (
    endpointWeight * TIMELINE_PATH_CENTER_X +
    (firstControlWeight + secondControlWeight) * controlX
  );
}

function getRiverCenterXAtY(y: number) {
  const clampedY = Math.min(Math.max(y, 0), TIMELINE_VIEWBOX_HEIGHT);
  const segmentIndex = Math.min(
    Math.floor(clampedY / TIMELINE_PATH_SEGMENT_HEIGHT),
    TIMELINE_PATH_SEGMENT_COUNT - 1,
  );
  const segmentStartY = segmentIndex * TIMELINE_PATH_SEGMENT_HEIGHT;
  const segmentProgress =
    (clampedY - segmentStartY) / TIMELINE_PATH_SEGMENT_HEIGHT;
  const bendsLeft = segmentIndex % TIMELINE_PATH_ALTERNATION_DIVISOR === 0;
  const controlX = bendsLeft
    ? TIMELINE_PATH_LEFT_CONTROL_X
    : TIMELINE_PATH_RIGHT_CONTROL_X;

  return getCubicBezierX(segmentProgress, controlX);
}

function getRiverPlacementHash(seed: string) {
  let hash = RIVER_ATLAS_HASH_OFFSET_BASIS;

  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, RIVER_ATLAS_HASH_PRIME) >>> 0;
  }

  return hash;
}

function getRiverPlacementScore(seed: string, placementIndex: number) {
  return (
    getRiverPlacementHash(`${seed}:${placementIndex}`) / RIVER_ATLAS_HASH_MODULO
  );
}

function getShuffledRiverSpriteIds(
  seed: string,
  affinity: RiverSpriteAffinity,
) {
  return RIVER_ATLAS_SPRITE_IDS_BY_AFFINITY[affinity]
    .map((spriteId, index) => ({
      spriteId,
      score: getRiverPlacementScore(`${seed}:${affinity}`, index),
    }))
    .sort((left, right) => left.score - right.score)
    .map((item) => item.spriteId);
}

function removeCrowdedRiverTreePlacements(selectedPlacementIndexes: number[]) {
  const indexesToRemove = new Set<number>();

  (["left", "right"] satisfies RiverSpriteSide[]).forEach((side) => {
    const treePlacements = selectedPlacementIndexes
      .map((index) => ({
        index,
        placement: RIVER_ATLAS_PLACEMENTS[index],
      }))
      .filter(
        (item): item is { index: number; placement: RiverAtlasSpritePlacement } =>
          item.placement?.affinity === "treeGroup" &&
          item.placement.side === side,
      )
      .sort((left, right) => left.placement.y - right.placement.y);
    let previousKeptPlacement: RiverAtlasSpritePlacement | undefined;

    treePlacements.forEach((item, itemIndex) => {
      if (
        previousKeptPlacement &&
        item.placement.y - previousKeptPlacement.y <=
          RIVER_TREE_GROUP_CROWDING_GAP_PX
      ) {
        indexesToRemove.add(item.index);
        return;
      }

      previousKeptPlacement = item.placement;

      const previous = treePlacements[itemIndex - 1];
      const next = treePlacements[itemIndex + 1];

      if (!previous || !next) {
        return;
      }

      const previousGap = item.placement.y - previous.placement.y;
      const nextGap = next.placement.y - item.placement.y;

      if (
        previousGap <= RIVER_TREE_GROUP_CROWDING_GAP_PX &&
        nextGap <= RIVER_TREE_GROUP_CROWDING_GAP_PX
      ) {
        indexesToRemove.add(item.index);
      }
    });
  });

  return selectedPlacementIndexes.filter((index) => !indexesToRemove.has(index));
}

function pushRiverTreesAwayFromNearbySprites(
  placements: RiverAtlasResolvedPlacement[],
) {
  const shiftedPlacements: RiverAtlasResolvedPlacement[] = [];

  placements.forEach((item) => {
    const previousPlacement =
      shiftedPlacements[shiftedPlacements.length - 1]?.placement;
    const shouldPushTreeDown =
      item.placement.affinity === "treeGroup" &&
      previousPlacement &&
      item.placement.y - previousPlacement.y < RIVER_TREE_NEAR_SPRITE_GAP_PX;
    const nextPlacement = shouldPushTreeDown
      ? {
          ...item.placement,
          y: Math.min(
            previousPlacement.y + RIVER_TREE_NEAR_SPRITE_GAP_PX,
            TIMELINE_VIEWBOX_HEIGHT - RIVER_TREE_BOTTOM_SHIFT_PADDING_PX,
          ),
        }
      : item.placement;

    shiftedPlacements.push({
      ...item,
      placement: nextPlacement,
    });
  });

  return shiftedPlacements;
}

function removeCardCoveredNearbyRiverTrees(
  placements: RiverAtlasResolvedPlacement[],
  cardOverlapZones: RiverCardOverlapZone[],
) {
  if (cardOverlapZones.length === 0) {
    return placements;
  }

  return placements.filter((item) => {
    if (item.placement.affinity !== "treeGroup") {
      return true;
    }

    return !cardOverlapZones.some(
      (zone) =>
        Math.abs(item.placement.y - zone.y) <= RIVER_CARD_OVERLAP_HALF_HEIGHT_PX,
    );
  });
}

function getRiverAtlasPlacements(
  seed: string,
  cardOverlapZones: RiverCardOverlapZone[],
) {
  const shuffledSpriteIdsByAffinity: Record<
    RiverSpriteAffinity,
    RiverAtlasSpriteId[]
  > = {
    waterPlant: getShuffledRiverSpriteIds(seed, "waterPlant"),
    treeGroup: getShuffledRiverSpriteIds(seed, "treeGroup"),
  };
  const usageCountByAffinity: Record<RiverSpriteAffinity, number> = {
    waterPlant: 0,
    treeGroup: 0,
  };
  const selectedPlacementIndexes = removeCrowdedRiverTreePlacements(
    RIVER_ATLAS_PLACEMENT_GROUPS.map((placementGroup, groupIndex) => {
      const selectedGroupIndex = Math.floor(
        getRiverPlacementScore(seed, groupIndex) * placementGroup.length,
      );

      return placementGroup[selectedGroupIndex] ?? placementGroup[0];
    }).slice(0, RIVER_ATLAS_MAX_PLACEMENTS_PER_SECTION),
  );

  const resolvedPlacements = selectedPlacementIndexes
    .map((placementIndex): RiverAtlasResolvedPlacement | undefined => {
      const placement = RIVER_ATLAS_PLACEMENTS[placementIndex];

      if (!placement) {
        return undefined;
      }

      const shuffledSpriteIds = shuffledSpriteIdsByAffinity[placement.affinity];
      const usageIndex = usageCountByAffinity[placement.affinity];
      usageCountByAffinity[placement.affinity] += 1;

      return {
        index: placementIndex,
        placement: {
          ...placement,
          spriteId:
            shuffledSpriteIds[usageIndex % shuffledSpriteIds.length] ??
            placement.spriteId,
        },
      };
    })
    .filter((item): item is RiverAtlasResolvedPlacement => Boolean(item));

  return removeCardCoveredNearbyRiverTrees(
    pushRiverTreesAwayFromNearbySprites(resolvedPlacements),
    cardOverlapZones,
  );
}

function getRiverSpriteClusterItems(placement: RiverAtlasSpritePlacement) {
  if (placement.spriteId === "palmTree") {
    return RIVER_SINGLE_SPRITE_CLUSTER;
  }

  if (placement.spriteId === "doublePalms") {
    return RIVER_WATER_PLANT_CLUSTER_PATTERNS.sideBySide;
  }

  if (placement.spriteId === "leafPlant") {
    return RIVER_WATER_PLANT_CLUSTER_PATTERNS.oppositeDiagonal;
  }

  if (placement.affinity === "waterPlant") {
    switch (placement.clusterPattern) {
      case "single":
      case "oppositeDiagonal":
      case "sideBySide":
        return RIVER_WATER_PLANT_CLUSTER_PATTERNS[placement.clusterPattern];
      default:
        return RIVER_WATER_PLANT_CLUSTER_PATTERNS.sideBySide;
    }
  }

  if (placement.affinity === "treeGroup") {
    switch (placement.clusterPattern) {
      case "four":
      case "five":
      case "three":
        return RIVER_TREE_GROUP_CLUSTER_PATTERNS[placement.clusterPattern];
      default:
        return RIVER_TREE_GROUP_CLUSTER_PATTERNS.three;
    }
  }

  return RIVER_SINGLE_SPRITE_CLUSTER;
}

function RiverAtlasSprites({
  cardOverlapZones,
  seed,
}: {
  cardOverlapZones: RiverCardOverlapZone[];
  seed: string;
}) {
  const riverPlacements = getRiverAtlasPlacements(seed, cardOverlapZones);

  return (
    <div className="absolute inset-0 z-10 overflow-visible">
      {riverPlacements.flatMap(({ placement, index: placementIndex }) => {
        const sprite = RIVER_ATLAS_SPRITES[placement.spriteId];
        const spriteScale = sprite.scale || placement.scale;
        const riverCenterX = getRiverCenterXAtY(placement.y);
        const distanceFromRiver =
          RIVER_SPRITE_DISTANCE_BY_AFFINITY[placement.affinity];
        const sideOffset =
          RIVER_SPRITE_SIDE_MULTIPLIER[placement.side] * distanceFromRiver;

        return getRiverSpriteClusterItems(placement).map(
          (clusterItem, clusterIndex) => {
            const width =
              sprite.width *
              spriteScale *
              clusterItem.scale *
              RIVER_SPRITE_SCALE_MULTIPLIER;
            const height =
              sprite.height *
              spriteScale *
              clusterItem.scale *
              RIVER_SPRITE_SCALE_MULTIPLIER;
            const clusterSideOffset =
              sideOffset *
              (clusterItem.sideMultiplier ??
                RIVER_SPRITE_CLUSTER_SAME_SIDE_MULTIPLIER);

            return (
              <img
                alt=""
                className="absolute max-w-none select-none"
                key={`${placement.spriteId}-${placementIndex}-${clusterIndex}`}
                src={sprite.url}
                style={{
                  height,
                  left: `${(riverCenterX / TIMELINE_VIEWBOX_WIDTH) * RIVER_POSITION_PERCENT}%`,
                  opacity: placement.opacity ?? 1,
                  top: `${(placement.y / TIMELINE_VIEWBOX_HEIGHT) * RIVER_POSITION_PERCENT}%`,
                  transform: `translate(${
                    clusterSideOffset + clusterItem.offsetX - width / 2
                  }px, ${clusterItem.offsetY - height / 2}px)`,
                  width,
                }}
              />
            );
          },
        );
      })}
    </div>
  );
}

function RiverSurfaceTexture() {
  return (
    <g fill="none">
      {RIVER_SURFACE_RIPPLES.map((ripple, index) => {
        const halfWidth = ripple.width / RIVER_SURFACE_HALF_DIVISOR;
        const controlWidth = ripple.width / RIVER_SURFACE_CONTROL_DIVISOR;
        const ripplePath = `M-${halfWidth} 0 C-${controlWidth} ${-ripple.curve} ${controlWidth} ${ripple.curve} ${halfWidth} 0`;

        return (
          <g
            key={`ripple-${index}`}
            opacity={ripple.opacity}
            transform={`translate(${ripple.x} ${ripple.y}) rotate(${ripple.rotation})`}
          >
            <path
              d={ripplePath}
              stroke="rgba(255, 255, 255, 0.9)"
              strokeLinecap="round"
              strokeWidth={RIVER_SURFACE_SOFT_STROKE_WIDTH}
            />
            <path
              d={ripplePath}
              stroke="rgba(15, 118, 110, 0.6)"
              strokeLinecap="round"
              strokeWidth={RIVER_SURFACE_STROKE_WIDTH}
            />
          </g>
        );
      })}
    </g>
  );
}

function TimelinePath({
  cardOverlapZones,
  spriteSeed,
}: {
  cardOverlapZones: RiverCardOverlapZone[];
  spriteSeed: string;
}) {
  const rawId = useId().replace(/:/g, "");
  const riverGradientId = `river-gradient-${rawId}`;
  const bankGradientId = `river-bank-${rawId}`;
  const glowFilterId = `river-glow-${rawId}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 w-32 -translate-x-1/2 overflow-visible"
    >
      <svg
        className="h-full w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox={`0 0 ${TIMELINE_VIEWBOX_WIDTH} ${TIMELINE_VIEWBOX_HEIGHT}`}
      >
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={riverGradientId}
            x1="0"
            x2={TIMELINE_VIEWBOX_WIDTH}
            y1="0"
            y2={TIMELINE_VIEWBOX_HEIGHT}
          >
            <stop offset="0%" stopColor="rgba(14, 165, 233, 0.2)" />
            <stop offset="38%" stopColor="rgba(45, 212, 191, 0.5)" />
            <stop offset="70%" stopColor="rgba(59, 130, 246, 0.4)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.28)" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={bankGradientId}
            x1={TIMELINE_VIEWBOX_WIDTH}
            x2="0"
            y1="0"
            y2={TIMELINE_VIEWBOX_HEIGHT}
          >
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.65)" />
            <stop offset="45%" stopColor="rgba(240, 253, 250, 0.55)" />
            <stop offset="100%" stopColor="rgba(226, 232, 240, 0.35)" />
          </linearGradient>
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height={TIMELINE_VIEWBOX_HEIGHT}
            id={glowFilterId}
            width={TIMELINE_VIEWBOX_WIDTH}
            x="0"
            y="0"
          >
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <path
          d={TIMELINE_PATH}
          fill="none"
          filter={`url(#${glowFilterId})`}
          stroke={`url(#${bankGradientId})`}
          strokeLinecap={TIMELINE_RIVER_SECTION_CAP}
          strokeWidth={TIMELINE_RIVER_BANK_WIDTH}
        />
        <path
          d={TIMELINE_PATH}
          fill="none"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeLinecap={TIMELINE_RIVER_SECTION_CAP}
          strokeWidth={TIMELINE_RIVER_SHORE_WIDTH}
        />
        <path
          d={TIMELINE_PATH}
          fill="none"
          stroke={`url(#${riverGradientId})`}
          strokeLinecap={TIMELINE_RIVER_SECTION_CAP}
          strokeWidth={TIMELINE_RIVER_BODY_WIDTH}
        />
        <RiverSurfaceTexture />
      </svg>
      <RiverAtlasSprites
        cardOverlapZones={cardOverlapZones}
        seed={spriteSeed}
      />
    </div>
  );
}

type EntryCardProps = {
  entry: LearningEntry;
  isLeft: boolean;
  presets: LearningPreset[];
  isSubmitting: boolean;
  isCoverUpdating: boolean;
  onDelete: (entryId: string) => void;
  onCreatePreset: (entryId: string) => void;
  onUpdateCoverImage: (entryId: string, file: File) => Promise<void>;
};

function EntryArticle({
  entry,
  isLeft,
  presets,
  isSubmitting,
  isCoverUpdating,
  onDelete,
  onCreatePreset,
  onUpdateCoverImage,
}: EntryCardProps) {
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const hasCoverFrame = Boolean(entry.url || entry.coverImage);

  async function handleCoverInputChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      await onUpdateCoverImage(entry.id, file);
    } finally {
      input.value = "";
    }
  }

  return (
    <article
      className="grid min-h-44 grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_minmax(0,1fr)] sm:gap-6"
      data-entry-id={entry.id}
    >
      <div
        className={classNames(
          "relative z-10 col-span-3 px-6 sm:col-span-1 sm:px-0",
          isLeft ? "sm:col-start-1 sm:pr-4" : "sm:col-start-3 sm:pl-4",
        )}
      >
        <Card className="relative p-3 shadow-xl sm:p-4" tone="solid">
          <input
            accept="image/*"
            className="sr-only"
            onChange={handleCoverInputChange}
            ref={coverInputRef}
            type="file"
          />
          <Button
            aria-label="Modifier l'image de cette carte"
            className="absolute right-3 top-3 z-20 min-h-0 bg-transparent px-0 py-0 text-2xl leading-none shadow-none hover:bg-transparent hover:text-slate-950 focus:ring-2"
            disabled={isCoverUpdating}
            motion="none"
            onClick={() => coverInputRef.current?.click()}
            variant="ghost"
          >
            <span aria-hidden="true">🖌️</span>
          </Button>
          <div className="mb-2 flex flex-wrap items-center gap-2 pr-12">
            <StatusPill tone={entry.source === "empty" ? "slate" : "blue"}>
              {getEntrySourceLabel(entry.source)}
            </StatusPill>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 sm:text-sm">
              <Clock3 aria-hidden="true" className="size-4" />
              {formatTimeLabel(entry.createdAt)}
            </span>
          </div>
          <p className="break-words text-sm font-black leading-6 text-slate-800 sm:text-base sm:leading-7">
            {entry.content}
          </p>
          {entry.description ? (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-600">
              {entry.description}
            </p>
          ) : null}
          {hasCoverFrame ? (
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
              <EntryCoverImage entry={entry} />
              {entry.url ? (
                <a
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-violet-700 hover:text-violet-900"
                  href={entry.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink
                    aria-hidden="true"
                    className="size-4 shrink-0"
                  />
                  <span className="truncate">{entry.url}</span>
                </a>
              ) : null}
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {entry.source === "custom" ? (
              hasVisiblePresetForEntry(entry.content, presets) ? (
                <StatusPill tone="mint">Déjà en choix rapide</StatusPill>
              ) : (
                <Button
                  className="max-w-full whitespace-normal px-3 text-xs leading-tight"
                  disabled={isSubmitting}
                  icon={
                    <BookmarkPlus
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                  }
                  onClick={() => onCreatePreset(entry.id)}
                  variant="secondary"
                >
                  Ajouter aux choix rapides
                </Button>
              )
            ) : null}
            <Button
              aria-label="Supprimer cette entrée"
              className="min-h-10 px-3"
              icon={<Trash2 aria-hidden="true" className="size-4" />}
              onClick={() => onDelete(entry.id)}
              variant="ghost"
            />
          </div>
        </Card>
      </div>
    </article>
  );
}

type DaySectionProps = {
  day: TimelineDay;
  todayKey: string;
  presets: LearningPreset[];
  isSubmitting: boolean;
  coverUpdatingEntryId: string | null;
  todayRef: React.RefObject<HTMLElement | null>;
  isLastDay: boolean;
  startIndex: number;
  background: string;
  onDelete: (entryId: string) => void;
  onCreatePreset: (entryId: string) => void;
  onUpdateCoverImage: (entryId: string, file: File) => Promise<void>;
};

function DaySection({
  day,
  todayKey,
  presets,
  isSubmitting,
  coverUpdatingEntryId,
  todayRef,
  isLastDay,
  startIndex,
  background,
  onDelete,
  onCreatePreset,
  onUpdateCoverImage,
}: DaySectionProps) {
  const { dateKey, entries } = day;
  const isToday = dateKey === todayKey;
  const cardOverlapZones = entries.map((_, index) => ({
    y:
      (isToday
        ? RIVER_TODAY_FIRST_CARD_CENTER_Y
        : RIVER_STANDARD_FIRST_CARD_CENTER_Y) +
      index * RIVER_ENTRY_CARD_CENTER_STEP_Y,
  }));

  return (
    <section
      className={classNames(
        "relative pt-10",
        isLastDay ? "min-h-[calc(100vh+12rem)] pb-32" : "min-h-[80vh] pb-10",
      )}
      data-day-section={dateKey}
      ref={isToday ? todayRef : undefined}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: background,
          maskImage: DAY_BACKGROUND_FADE_MASK,
          WebkitMaskImage: DAY_BACKGROUND_FADE_MASK,
        }}
      />
      <TimelinePath cardOverlapZones={cardOverlapZones} spriteSeed={dateKey} />

      {isToday ? (
        <header className="relative z-10 mx-auto mb-16 max-w-2xl pt-8 text-center">
          <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
            Qu'as-tu appris aujourd'hui&nbsp;?
          </h1>
        </header>
      ) : null}

      {entries.length > 0 ? (
        <div className="relative z-10 mx-auto max-w-5xl space-y-10">
          {entries.map((entry, index) => (
            <EntryArticle
              entry={entry}
              isLeft={(startIndex + index) % 2 === 0}
              isCoverUpdating={coverUpdatingEntryId === entry.id}
              isSubmitting={isSubmitting}
              key={entry.id}
              onCreatePreset={onCreatePreset}
              onDelete={onDelete}
              onUpdateCoverImage={onUpdateCoverImage}
              presets={presets}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function TodayPage() {
  const timelineMaxDaysCount = useMemo(() => getTimelineMaxDaysCount(), []);
  const [timelineDaysCount, setTimelineDaysCount] = useState(
    INITIAL_TIMELINE_DAYS_VISIBLE,
  );
  const olderTimelineLoadPendingRef = useRef(false);
  const scrollRestoreRef = useRef<{
    scrollHeight: number;
    scrollTop: number;
  } | null>(null);
  const { days, presets, todayKey } = useTimelineData(timelineDaysCount);
  const renderedDays = useMemo(
    () =>
      days.filter((day) => day.dateKey === todayKey || day.entries.length > 0),
    [days, todayKey],
  );
  const dayStartIndices = useMemo(
    () =>
      renderedDays.reduce<number[]>((accumulator, day, index) => {
        const previous = accumulator[index - 1] ?? 0;
        const previousLength = renderedDays[index - 1]?.entries.length ?? 0;
        accumulator.push(previous + previousLength);
        return accumulator;
      }, []),
    [renderedDays],
  );
  const dayThemesByDateKey = useMemo(() => {
    const result: Record<string, DayTheme> = {};
    renderedDays.forEach((day, index) => {
      const distanceFromToday = renderedDays.length - 1 - index;
      const themeIndex =
        ((distanceFromToday % DAY_THEMES.length) + DAY_THEMES.length) %
        DAY_THEMES.length;
      result[day.dateKey] = DAY_THEMES[themeIndex];
    });
    return result;
  }, [renderedDays]);
  const dayKeys = useMemo(
    () => renderedDays.map((day) => day.dateKey),
    [renderedDays],
  );
  const activeDay = useActiveDay(dayKeys);
  const todaySectionRef = useRef<HTMLElement | null>(null);
  const userInteractedRef = useRef(false);
  const pendingScrollEntryIdRef = useRef<string | null>(null);
  const [mountTime] = useState(() => performance.now());
  const [customContent, setCustomContent] = useState("");
  const [description, setDescription] = useState("");
  const [entryUrl, setEntryUrl] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<
    string | undefined
  >();
  const { statusToast, isStatusToastVisible, showStatusToast } =
    useStatusToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isTodayActionVisible, setIsTodayActionVisible] = useState(true);
  const [coverUpdatingEntryId, setCoverUpdatingEntryId] = useState<
    string | null
  >(null);
  const hasOlderTimelineDays = timelineDaysCount < timelineMaxDaysCount;

  const loadOlderTimelineDays = useCallback(() => {
    if (olderTimelineLoadPendingRef.current) {
      return;
    }

    setTimelineDaysCount((currentDaysCount) => {
      if (currentDaysCount >= timelineMaxDaysCount) {
        return currentDaysCount;
      }

      const scrollContainer = document.querySelector("main");
      scrollRestoreRef.current = scrollContainer
        ? {
            scrollHeight: scrollContainer.scrollHeight,
            scrollTop: scrollContainer.scrollTop,
          }
        : null;
      olderTimelineLoadPendingRef.current = true;

      return Math.min(
        currentDaysCount + TIMELINE_DAYS_LOAD_STEP,
        timelineMaxDaysCount,
      );
    });
  }, [timelineMaxDaysCount]);

  const visiblePresets = useMemo(
    () => presets.filter((preset) => !isEmptyPreset(preset)),
    [presets],
  );

  const activeDayEntry = useMemo(
    () =>
      renderedDays.find((day) => day.dateKey === activeDay) ??
      renderedDays[renderedDays.length - 1],
    [renderedDays, activeDay],
  );

  const activeDayLabel = activeDayEntry
    ? formatDayLabel(activeDayEntry.dateKey, todayKey)
    : "Aujourd'hui";
  const activeLearningCount = activeDayEntry
    ? activeDayEntry.entries.filter((entry) => entry.source !== "empty").length
    : 0;
  const isOnToday = activeDayEntry?.dateKey === todayKey;
  const activeDayPillStyle = useMemo(() => {
    const pill =
      activeDayEntry && dayThemesByDateKey[activeDayEntry.dateKey]
        ? dayThemesByDateKey[activeDayEntry.dateKey].pill
        : NEUTRAL_PILL;
    return {
      backgroundColor: pill.background,
      color: pill.color,
      boxShadow: `0 0 0 1px ${pill.ring}`,
    };
  }, [activeDayEntry, dayThemesByDateKey]);

  useLayoutEffect(() => {
    if (!olderTimelineLoadPendingRef.current) {
      return;
    }

    const snapshot = scrollRestoreRef.current;
    const scrollContainer = document.querySelector("main");

    if (snapshot && scrollContainer) {
      const scrollHeightDelta =
        scrollContainer.scrollHeight - snapshot.scrollHeight;
      scrollContainer.scrollTop = snapshot.scrollTop + scrollHeightDelta;
    }

    scrollRestoreRef.current = null;
    olderTimelineLoadPendingRef.current = false;
  }, [renderedDays]);

  useEffect(() => {
    if (!hasOlderTimelineDays) {
      return;
    }

    const scrollContainer = document.querySelector("main");
    if (!scrollContainer) {
      return;
    }
    const timelineScrollContainer = scrollContainer;

    let previousScrollTop = timelineScrollContainer.scrollTop;
    let touchStartY: number | null = null;

    function loadWhenNearTop() {
      if (
        timelineScrollContainer.scrollTop <=
        TIMELINE_SCROLL_TOP_LOAD_THRESHOLD_PX
      ) {
        loadOlderTimelineDays();
      }
    }

    function handleScroll() {
      const nextScrollTop = timelineScrollContainer.scrollTop;
      const isScrollingUp = nextScrollTop < previousScrollTop;
      previousScrollTop = nextScrollTop;

      if (isScrollingUp) {
        loadWhenNearTop();
      }
    }

    function handleWheel(event: WheelEvent) {
      if (event.deltaY < 0) {
        loadWhenNearTop();
      }
    }

    function handleTouchStart(event: TouchEvent) {
      touchStartY = event.touches[0]?.clientY ?? null;
    }

    function handleTouchMove(event: TouchEvent) {
      const currentY = event.touches[0]?.clientY ?? null;
      if (touchStartY === null || currentY === null) {
        return;
      }

      const isPullingTowardOlderDays = currentY > touchStartY;
      touchStartY = currentY;

      if (isPullingTowardOlderDays) {
        loadWhenNearTop();
      }
    }

    timelineScrollContainer.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    timelineScrollContainer.addEventListener("wheel", handleWheel, {
      passive: true,
    });
    timelineScrollContainer.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    timelineScrollContainer.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });

    return () => {
      timelineScrollContainer.removeEventListener("scroll", handleScroll);
      timelineScrollContainer.removeEventListener("wheel", handleWheel);
      timelineScrollContainer.removeEventListener(
        "touchstart",
        handleTouchStart,
      );
      timelineScrollContainer.removeEventListener("touchmove", handleTouchMove);
    };
  }, [hasOlderTimelineDays, loadOlderTimelineDays]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    if (userInteractedRef.current) {
      return;
    }
    if (renderedDays.length === 0) {
      return;
    }
    if (performance.now() - mountTime > AUTO_SCROLL_GRACE_PERIOD_MS) {
      return;
    }

    const targetSection = document.querySelector<HTMLElement>(
      `[data-day-section="${todayKey}"]`,
    );
    if (!targetSection) {
      return;
    }

    scrollSectionToMainStart(targetSection);

    const frameId = window.requestAnimationFrame(() => {
      if (!userInteractedRef.current) {
        scrollSectionToMainStart(targetSection);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [renderedDays, todayKey, mountTime]);

  useLayoutEffect(() => {
    const targetId = pendingScrollEntryIdRef.current;
    if (!targetId) {
      return;
    }
    const target = document.querySelector<HTMLElement>(
      `[data-entry-id="${targetId}"]`,
    );
    if (target) {
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
      pendingScrollEntryIdRef.current = null;
    }
  }, [renderedDays]);

  useEffect(() => {
    function markUserInteraction() {
      userInteractedRef.current = true;
    }

    const scrollContainer = document.querySelector("main");
    const interactionTarget: HTMLElement | Window = scrollContainer ?? window;

    interactionTarget.addEventListener("wheel", markUserInteraction, {
      once: true,
      passive: true,
    });
    interactionTarget.addEventListener("touchstart", markUserInteraction, {
      once: true,
      passive: true,
    });
    document.addEventListener("keydown", markUserInteraction, { once: true });

    return () => {
      interactionTarget.removeEventListener("wheel", markUserInteraction);
      interactionTarget.removeEventListener("touchstart", markUserInteraction);
      document.removeEventListener("keydown", markUserInteraction);
    };
  }, []);

  useLayoutEffect(() => {
    let frameId: number | null = null;

    function computeTodayActionVisibility() {
      frameId = null;
      const todaySection = todaySectionRef.current;

      if (!todaySection) {
        setIsTodayActionVisible(true);
        return;
      }

      const rect = todaySection.getBoundingClientRect();
      setIsTodayActionVisible(
        rect.top < window.innerHeight && rect.bottom > VIEWPORT_TOP_PX,
      );
    }

    function scheduleCompute() {
      if (frameId !== null) {
        return;
      }
      frameId = window.requestAnimationFrame(computeTodayActionVisibility);
    }

    const scrollContainer = document.querySelector("main");
    const scrollTarget: HTMLElement | Window = scrollContainer ?? window;

    scrollTarget.addEventListener("scroll", scheduleCompute, {
      passive: true,
    });
    window.addEventListener("resize", scheduleCompute, { passive: true });
    computeTodayActionVisibility();

    return () => {
      scrollTarget.removeEventListener("scroll", scheduleCompute);
      window.removeEventListener("resize", scheduleCompute);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [renderedDays, todayKey]);

  function scrollToToday() {
    if (!todaySectionRef.current) {
      return;
    }

    scrollSectionToMainStart(todaySectionRef.current, "smooth");
  }

  function resetComposer() {
    setCustomContent("");
    setDescription("");
    setEntryUrl("");
    setSelectedPresetId(undefined);
  }

  function handleCustomContentChange(value: string) {
    setCustomContent(value);
    setSelectedPresetId((currentPresetId) => {
      const selectedPreset = presets.find(
        (preset) => preset.id === currentPresetId,
      );

      if (
        selectedPreset &&
        normalizePresetLabel(selectedPreset.label) ===
          normalizePresetLabel(value)
      ) {
        return currentPresetId;
      }

      return undefined;
    });
  }

  function handlePresetClick(presetId: string) {
    const preset = presets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setCustomContent(preset.label);
    setSelectedPresetId(preset.id);
  }

  async function handleCustomSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = customContent.trim();
    const trimmedDescription = description.trim();

    if (!trimmedContent) {
      showStatusToast("Écris une réponse avant d'ajouter.", "error");
      return;
    }

    if (!trimmedDescription) {
      showStatusToast("Ajoute une description avant d'ajouter.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedUrl = normalizeEntryUrl(entryUrl);
      const selectedPreset = presets.find(
        (preset) => preset.id === selectedPresetId,
      );
      const entryDetails = {
        description: trimmedDescription,
        ...(normalizedUrl ? { url: normalizedUrl } : {}),
      };

      const newEntryId =
        selectedPreset &&
        normalizePresetLabel(selectedPreset.label) ===
          normalizePresetLabel(trimmedContent)
          ? await createEntryFromPreset(selectedPreset, entryDetails)
          : await createCustomEntry(trimmedContent, entryDetails);

      if (newEntryId) {
        pendingScrollEntryIdRef.current = newEntryId;
      }

      resetComposer();
      setIsComposerOpen(false);
      showStatusToast("Réponse ajoutée.", "success");
    } catch (error) {
      showStatusToast(
        error instanceof Error ? error.message : "Ajout impossible.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(entryId: string) {
    try {
      await deleteEntry(entryId);
      showStatusToast("Entrée supprimée.", "success");
    } catch (error) {
      showStatusToast(
        error instanceof Error ? error.message : "Suppression impossible.",
        "error",
      );
    }
  }

  async function handleUpdateCoverImage(entryId: string, file: File) {
    if (!file.type.startsWith("image/")) {
      showStatusToast("Choisis un fichier image.", "error");
      return;
    }

    setCoverUpdatingEntryId(entryId);
    try {
      await updateEntryCoverImage(entryId, file);
      showStatusToast("Image mise à jour.", "success");
    } catch (error) {
      showStatusToast(
        error instanceof Error
          ? error.message
          : "Modification de l'image impossible.",
        "error",
      );
    } finally {
      setCoverUpdatingEntryId(null);
    }
  }

  async function handleCreatePreset(entryId: string) {
    const targetEntry = renderedDays
      .flatMap((day) => day.entries)
      .find((entry) => entry.id === entryId);

    if (!targetEntry) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPresetFromCustomEntry(targetEntry);

      if (result.status === "created") {
        showStatusToast("Ajouté aux choix rapides.", "success");
        return;
      }

      if (result.status === "restored") {
        showStatusToast("Choix rapide réactivé.", "success");
        return;
      }

      showStatusToast("Ce choix rapide existe déjà.", "error");
    } catch (error) {
      showStatusToast(
        error instanceof Error
          ? error.message
          : "Création du choix rapide impossible.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <StatusToastBanner isVisible={isStatusToastVisible} toast={statusToast} />

      <div className="fixed left-1/2 top-4 z-30 w-[min(92vw,34rem)] -translate-x-1/2 text-center">
        <div className="flex items-center justify-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold transition-colors duration-300 ease-out"
            style={activeDayPillStyle}
          >
            {activeDayLabel}
          </span>
          <StatusPill tone="violet">
            {activeLearningCount} apprentissage
            {activeLearningCount > 1 ? "s" : ""}
          </StatusPill>
        </div>
        {!isOnToday ? (
          <div className="mt-2 flex justify-center">
            <Button
              className="min-h-9 px-3 py-1.5 text-xs"
              icon={<ArrowDownToLine aria-hidden="true" className="size-4" />}
              onClick={scrollToToday}
              variant="secondary"
            >
              Revenir à aujourd'hui
            </Button>
          </div>
        ) : null}
      </div>

      {isTodayActionVisible ? (
        <Button
          aria-expanded={isComposerOpen}
          aria-label="Ajouter une entrée pour aujourd'hui"
          className="fixed -bottom-8 -right-8 z-30 size-48 min-h-0 rounded-full bg-violet-600 p-0 text-white shadow-2xl shadow-violet-500/30 hover:bg-violet-700 sm:-bottom-10 sm:-right-10 sm:size-56"
          icon={<Plus aria-hidden="true" className="size-20 sm:size-24" />}
          motion="none"
          onClick={() => setIsComposerOpen((value) => !value)}
        />
      ) : null}

      {isComposerOpen ? (
        <div
          aria-modal="false"
          className="fixed left-1/2 top-1/2 z-40 max-h-[min(82vh,_38rem)] w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
          role="dialog"
        >
          <Card className="p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-black uppercase tracking-wide text-violet-700">
                Nouvelle idée pour aujourd'hui
              </p>
              <Button
                aria-label="Fermer"
                className="min-h-10 px-3"
                icon={<X aria-hidden="true" className="size-4" />}
                onClick={() => setIsComposerOpen(false)}
                variant="ghost"
              />
            </div>

            <div className="mb-4 flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
              {visiblePresets.map((preset) => (
                <Button
                  disabled={isSubmitting}
                  key={preset.id}
                  onClick={() => handlePresetClick(preset.id)}
                  variant="pill"
                >
                  {preset.emoji ? `${preset.emoji} ` : ""}
                  {preset.label}
                </Button>
              ))}
            </div>

            <form onSubmit={handleCustomSubmit}>
              <Textarea
                label="Idée"
                onChange={(event) =>
                  handleCustomContentChange(event.target.value)
                }
                placeholder="Résume ton apprentissage..."
                value={customContent}
              />
              <div className="mt-4">
                <Textarea
                  className="min-h-44 resize-y"
                  label="Description"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Décris ce que tu as appris, pourquoi c'est utile, le contexte, les détails..."
                  value={description}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="URL facultative"
                  onChange={(event) => setEntryUrl(event.target.value)}
                  placeholder="https://..."
                  type="url"
                  value={entryUrl}
                />
              </div>

              <div className="mt-4">
                <Button
                  className="w-full"
                  disabled={isSubmitting}
                  icon={<Plus aria-hidden="true" className="size-5" />}
                  size="lg"
                  type="submit"
                >
                  Ajouter à ma journée
                </Button>
              </div>
            </form>

            {visiblePresets.length === 0 ? (
              <EmptyState
                className="mt-4"
                description="Termine l'onboarding ou ajoute des presets plus tard depuis les réglages."
                title="Aucun choix rapide disponible"
              />
            ) : null}
          </Card>
        </div>
      ) : null}

      <div className="relative z-10">
        {renderedDays.map((day, index) => {
          const direction: GradientDirection =
            index % 2 === 0 ? "leftToRight" : "rightToLeft";
          const theme = dayThemesByDateKey[day.dateKey] ?? DAY_THEMES[0];
          const background = buildDayBackground(theme, direction);
          return (
            <DaySection
              background={background}
              coverUpdatingEntryId={coverUpdatingEntryId}
              day={day}
              isLastDay={index === renderedDays.length - 1}
              isSubmitting={isSubmitting}
              key={day.dateKey}
              onCreatePreset={handleCreatePreset}
              onDelete={handleDelete}
              onUpdateCoverImage={handleUpdateCoverImage}
              presets={presets}
              startIndex={dayStartIndices[index] ?? 0}
              todayKey={todayKey}
              todayRef={todaySectionRef}
            />
          );
        })}
      </div>
    </section>
  );
}
