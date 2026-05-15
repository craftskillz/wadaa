import { useEffect, useState } from "react";

const ACTIVE_DAY_OFFSET_PX = 160;

function findScrollTarget(): HTMLElement | Window {
  const main = document.querySelector("main");
  return main ?? window;
}

export function useActiveDay(dayKeys: string[]): string {
  const fallbackKey = dayKeys[dayKeys.length - 1] ?? "";
  const [activeDay, setActiveDay] = useState<string>(fallbackKey);
  const [trackedKeys, setTrackedKeys] = useState<string>(dayKeys.join("|"));

  const currentKeys = dayKeys.join("|");
  if (trackedKeys !== currentKeys) {
    setTrackedKeys(currentKeys);
    setActiveDay(fallbackKey);
  }

  useEffect(() => {
    if (dayKeys.length === 0) {
      return;
    }

    let frameId: number | null = null;

    function computeActiveDay() {
      frameId = null;
      const sections = document.querySelectorAll<HTMLElement>(
        "[data-day-section]",
      );

      let candidate: string | null = null;
      let bestTop = Number.NEGATIVE_INFINITY;

      sections.forEach((section) => {
        const top = section.getBoundingClientRect().top;
        if (top <= ACTIVE_DAY_OFFSET_PX && top > bestTop) {
          bestTop = top;
          candidate = section.dataset.daySection ?? null;
        }
      });

      if (candidate) {
        setActiveDay(candidate);
      }
    }

    function handleScroll() {
      if (frameId !== null) {
        return;
      }
      frameId = window.requestAnimationFrame(computeActiveDay);
    }

    const scrollTarget = findScrollTarget();
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    computeActiveDay();

    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [dayKeys]);

  return activeDay;
}
