"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Pin, Sparkles, Star } from "lucide-react";

import { previewSummary, screenPlacements, wishSeed } from "@/components/prototype-data";
import { type WishRecord } from "@/lib/wish-wall";

import { ScreenThemeControls } from "./screen-theme-controls";
import { useScreenTheme } from "./screen-theme-provider";

type ScreenPrototypeProps = {
  compact?: boolean;
};

const hueAccent = {
  aurora: "from-[#98efcb]/28 via-[#7ecfff]/20 to-transparent",
  sky: "from-[#8fb8ff]/26 via-[#f1fbff]/10 to-transparent",
  gold: "from-[#f5d28a]/26 via-[#fff4d6]/10 to-transparent",
  rose: "from-[#f6b1c4]/24 via-[#ffe9f0]/10 to-transparent",
};

export function ScreenPrototype({ compact = false }: ScreenPrototypeProps) {
  const liveMode = !compact;
  const { motionSettings, motionStyle, performanceMode, screenThemeStyle } =
    useScreenTheme();
  const initialRecords = compact
    ? wishSeed.filter((record) => record.status === "approved").slice(0, 8)
    : [];
  const [records, setRecords] = useState<WishRecord[]>(initialRecords);
  const [approvedTotal, setApprovedTotal] = useState(
    compact ? previewSummary.approved : 0
  );
  const [loading, setLoading] = useState(liveMode);
  const [error, setError] = useState("");
  const [arrivalPulseVersion, setArrivalPulseVersion] = useState(0);
  const knownRecordIdsRef = useRef(new Set(initialRecords.map((record) => record.id)));
  const hydratedRef = useRef(compact);
  const shellHeight = compact ? "h-[760px]" : "min-h-screen";
  const contentHeight = compact ? "h-full" : "min-h-screen";
  const shellStyle = useMemo(
    () =>
      ({
        ...screenThemeStyle,
        ...motionStyle,
      }) as CSSProperties & Record<string, string>,
    [motionStyle, screenThemeStyle]
  );
  const shellClassName = `screen-shell relative isolate overflow-hidden text-white ${shellHeight} ${
    liveMode && motionSettings.enabled ? "screen-shell-motion" : "screen-shell-static"
  } ${performanceMode ? "screen-shell-performance" : ""}`;

  const refreshScreen = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/screen/wishes?limit=8", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        records?: WishRecord[];
        summary?: {
          approved?: number;
        };
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "读取大屏数据失败。");
      }

      const nextRecords = payload.records ?? [];
      const nextRecordIds = new Set(nextRecords.map((record) => record.id));

      if (hydratedRef.current && motionSettings.enabled && !motionSettings.frozen) {
        const hasNewArrival = nextRecords.some(
          (record) => !knownRecordIdsRef.current.has(record.id)
        );

        if (hasNewArrival) {
          setArrivalPulseVersion((current) => current + 1);
        }
      }

      knownRecordIdsRef.current = nextRecordIds;
      hydratedRef.current = true;
      setRecords(nextRecords);
      setApprovedTotal(payload.summary?.approved ?? nextRecords.length);
      setError("");
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "读取大屏数据失败。"
      );
    } finally {
      setLoading(false);
    }
  }, [motionSettings.enabled, motionSettings.frozen]);

  useEffect(() => {
    if (!liveMode) {
      return;
    }

    const kickoffTimer = window.setTimeout(() => {
      void refreshScreen();
    }, 0);

    const timer = window.setInterval(() => {
      void refreshScreen();
    }, 5000);

    return () => {
      window.clearTimeout(kickoffTimer);
      window.clearInterval(timer);
    };
  }, [liveMode, refreshScreen]);

  return (
    <div className={shellClassName} style={shellStyle}>
      {liveMode && motionSettings.enabled ? (
        <ScreenAuroraBackdrop arrivalPulseVersion={arrivalPulseVersion} />
      ) : null}
      <div className="screen-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className={`relative z-10 flex flex-col ${contentHeight}`}>
        {liveMode ? <ScreenThemeControls /> : null}
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-6 lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-white/80">
              <Star className="size-3.5 text-[#f5d28a]" />
              Toastmasters 3rd Anniversary
            </div>
            <h1 className="mt-4 text-[34px] font-semibold tracking-tight text-white lg:text-[44px]">
              三周年电子许愿墙
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-white/68">
            <span className="screen-pill rounded-[8px] px-3 py-2">
              已上墙 {approvedTotal}
            </span>
            <span className="screen-pill rounded-[8px] px-3 py-2">
              实时出现 ≤ 5s
            </span>
            {loading ? (
              <span className="screen-pill rounded-[8px] px-3 py-2">
                <LoaderCircle className="inline-flex size-4 animate-spin" />
              </span>
            ) : null}
          </div>
        </header>

        <main className="relative flex-1 overflow-hidden px-4 pb-8 lg:px-6">
          {records.map((record, index) => {
            const placement = screenPlacements[index];
            const style = {
              top: placement.top,
              left: placement.left,
              width: placement.width,
              "--wish-rotation": `${placement.rotation}deg`,
              "--wish-delay": placement.delay,
              "--wish-duration": placement.duration,
            } as CSSProperties;

            return (
              <article
                key={record.id}
                style={style}
                className="wish-bottle-shell absolute cursor-pointer"
              >
                <div className="screen-bottle wish-bottle relative rounded-[8px] p-4">
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-[8px] bg-gradient-to-br ${hueAccent[record.hue]}`}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[#f5d28a]">
                          <Sparkles className="size-4" />
                        </span>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-white/52">
                            {record.track}
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">
                            {record.displayName}
                          </p>
                        </div>
                      </div>

                      {record.pinned ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#f5d28a]/[0.16] bg-[#f5d28a]/[0.08] px-2 py-1 text-[11px] text-[#fff4d6]">
                          <Pin className="size-3.5" />
                          置顶
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-4 text-sm leading-7 text-white/78 lg:text-[15px]">
                      {record.wishText}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}

          {!records.length && !loading ? (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="screen-surface max-w-lg rounded-[8px] px-6 py-5 text-center">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/48">
                  Waiting For Wishes
                </p>
                <p className="mt-3 text-lg font-medium text-white">
                  审核通过的愿景会从这里慢慢浮现。
                </p>
                {error ? (
                  <p className="mt-3 text-sm leading-6 text-[#fff4d6]">{error}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="screen-footer-fade pointer-events-none absolute inset-x-0 bottom-0 h-40" />
        </main>
      </div>
    </div>
  );
}

function ScreenAuroraBackdrop({
  arrivalPulseVersion,
}: {
  arrivalPulseVersion: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="screen-aurora-stage pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="screen-aurora-band screen-aurora-band--north" />
      <div className="screen-aurora-band screen-aurora-band--west" />
      <div className="screen-aurora-band screen-aurora-band--east" />
      <div className="screen-aurora-band screen-aurora-band--veil" />
      <div className="screen-aurora-band screen-aurora-band--floor" />
      <div className="screen-aurora-bloom absolute inset-0" />
      {arrivalPulseVersion > 0 ? (
        <div
          key={arrivalPulseVersion}
          className="screen-arrival-pulse absolute inset-0"
        />
      ) : null}
    </div>
  );
}
