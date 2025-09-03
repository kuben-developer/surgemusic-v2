"use client";

import { useEffect } from "react";
import {
  CONTENT_THEMES,
  THEME_DEFAULT_FOLDER,
  getImageSrcsForFolder,
} from "../constants/content-themes.constants";

/**
 * Preloads all Content Theme GIFs used on the Campaign Create page.
 *
 * Behavior:
 * - Runs once per session (window-scoped flag) to avoid redundant work.
 * - Skips on Data Saver connections and throttles on slower networks.
 * - Uses requestIdleCallback when available to avoid impacting TTI.
 * - Limits concurrent downloads to reduce network contention.
 */
export function PreloadContentThemeImages() {
  useEffect(() => {
    // Guard: only run in a browser and only once per session
    if (typeof window === "undefined") return;
    if ((window as any).__SL_THEMES_PRELOADED__) return;

    const connection = (navigator as any)?.connection as
      | ({ saveData?: boolean; effectiveType?: string } & Record<string, unknown>)
      | undefined;

    // Respect Data Saver
    if (connection?.saveData) return;

    const concurrencyByNetwork = (() => {
      const t = connection?.effectiveType ?? "4g";
      if (t === "slow-2g" || t === "2g") return 2;
      if (t === "3g") return 3;
      return 6; // default for wifi/4g
    })();

    // Build a unique list of folders we actually render in the UI
    const folders = new Set<string>();
    for (const theme of CONTENT_THEMES) {
      if (theme.subThemes?.length) {
        for (const s of theme.subThemes) {
          folders.add(s.imageFolder ?? THEME_DEFAULT_FOLDER);
        }
      } else {
        folders.add(theme.imageFolder ?? THEME_DEFAULT_FOLDER);
      }
    }

    // Expand folders into concrete image URLs
    const urls: string[] = [];
    for (const folder of folders) {
      for (const src of getImageSrcsForFolder(folder)) {
        urls.push(src);
      }
    }

    if (urls.length === 0) return;

    let cancelled = false;
    const controller = new AbortController();
    // Keep references so decoded frames stay warm longer
    const retained: Record<string, HTMLImageElement> = {};

    function preload(url: string): Promise<void> {
      return new Promise((resolve) => {
        const img = new Image();
        img.loading = "eager";
        img.decoding = "async";
        const done = () => resolve();
        img.onload = done;
        img.onerror = done;
        // Abort handling: if aborted, resolve and stop loading
        controller.signal.addEventListener(
          "abort",
          () => {
            try {
              img.src = "";
            } catch {}
            resolve();
          },
          { once: true }
        );
        retained[url] = img;
        img.src = url;
      });
    }

    async function runWithConcurrency(list: string[], limit: number) {
      let idx = 0;
      const workers: Promise<void>[] = [];
      for (let i = 0; i < limit; i++) {
        workers.push(
          (async function worker() {
            while (!cancelled && idx < list.length) {
              const current = list[idx++];
              // Small yield to let input/UI stay responsive
              await new Promise((r) => setTimeout(r, 0));
              if (!current) continue;
              await preload(current);
            }
          })()
        );
      }
      await Promise.allSettled(workers);
    }

    const start = () => {
      runWithConcurrency(urls, concurrencyByNetwork)
        .catch(() => void 0)
        .finally(() => {
          if (!cancelled) {
            (window as any).__SL_THEMES_PRELOADED__ = true;
            // Stash references to reduce GC pressure and keep decodes in memory cache
            (window as any).__SL_PRELOADED_IMAGES__ = retained;
          }
        });
    };

    // Defer to idle time when possible to avoid competing with initial render
    if (typeof (window as any).requestIdleCallback === "function") {
      (window as any).requestIdleCallback(start, { timeout: 3000 });
    } else {
      // Slight delay after hydration
      setTimeout(start, 500);
    }

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

    // No UI — side-effect only
  return null;
}
