"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Gauge,
  Lock,
  MonitorPlay,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  SunMedium,
  Waves,
  X,
} from "lucide-react";

import { buildScreenThemeStyle } from "@/lib/screen-theme";

import { useScreenTheme } from "./screen-theme-provider";

export function ScreenThemeControls() {
  const {
    applyPreset,
    currentPreset,
    motionSettings,
    presets,
    performanceMode,
    resetAdjustments,
    setMotionEnabled,
    setMotionMode,
    setPerformanceMode,
    screenThemeStyle,
    settings,
    toggleMotionFrozen,
    togglePerformanceMode,
    updateMotionSpeed,
    updateAxis,
  } = useScreenTheme();
  const [open, setOpen] = useState(true);
  const motionModeLabel =
    motionSettings.mode === "celebration" ? "庆典" : "柔动";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "p") {
        setOpen((current) => !current);
      }

      if (event.key.toLowerCase() === "e") {
        if (performanceMode) {
          setOpen(true);
        } else {
          setOpen(false);
        }
        togglePerformanceMode();
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [performanceMode, togglePerformanceMode]);

  return (
    <div className="pointer-events-none absolute right-6 top-6 z-30 flex flex-col items-end gap-3 lg:right-10">
      <div
        className={`pointer-events-auto flex items-center gap-2 transition ${
          performanceMode ? "opacity-[0.38] hover:opacity-100" : ""
        }`}
      >
        {!performanceMode ? (
          <>
            <span className="screen-pill rounded-[999px] px-3 py-2 text-xs text-white/74">
              {currentPreset.label}
              {motionSettings.enabled ? ` · ${motionModeLabel}` : " · 静态"}
            </span>
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="screen-theme-trigger inline-flex h-11 items-center gap-2 rounded-[999px] px-4 text-sm text-white transition hover:brightness-110"
            >
              <Palette className="size-4 text-[#f5d28a]" />
              调色
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (performanceMode) {
              setOpen(true);
              setPerformanceMode(false);
            } else {
              setOpen(false);
              setPerformanceMode(true);
            }
          }}
          className={`inline-flex h-11 items-center gap-2 rounded-[999px] px-4 text-sm text-white transition ${
            performanceMode
              ? "screen-pill hover:bg-white/12"
              : "border border-white/12 bg-white/6 hover:bg-white/10"
          }`}
        >
          <MonitorPlay className="size-4 text-[#95f0c8]" />
          {performanceMode ? "退出演出" : "演出模式"}
        </button>
      </div>

      {open && !performanceMode ? (
        <section className="screen-theme-dock pointer-events-auto max-h-[calc(100vh-96px)] w-[420px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-[12px]">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">
                Stage Theme
              </p>
              <h2 className="mt-2 text-lg font-medium text-white">大屏调色</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-[999px] border border-white/10 bg-white/6 text-white/72 transition hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="px-4 py-4">
            <div
              className="screen-theme-preview relative h-[132px] overflow-hidden rounded-[10px] border border-white/10"
              style={screenThemeStyle}
            >
              <div className="screen-grid pointer-events-none absolute inset-0 opacity-70" />
              <div className="relative z-10 flex h-full flex-col justify-between p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">
                      当前风格
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {currentPreset.label}
                    </p>
                  </div>
                  <span className="screen-pill inline-flex items-center gap-2 rounded-[999px] px-2.5 py-1 text-[11px] text-white/78">
                    <Sparkles className="size-3.5 text-[#f5d28a]" />
                    {currentPreset.note}
                  </span>
                </div>

                <div className="screen-bottle relative max-w-[168px] rounded-[8px] p-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/48">
                    预览
                  </p>
                  <div
                    className="mt-2 h-1.5 rounded-full"
                    style={{
                      backgroundImage: String(screenThemeStyle["--screen-accent-strip"]),
                    }}
                  />
                  <p className="mt-2 text-xs leading-5 text-white/72">
                    所见即所得
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[12px] border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white/84">动态极光</p>
                  <p className="mt-1 text-xs leading-5 text-white/46">
                    让背景慢速流动。建议演出模式下开启。
                  </p>
                </div>
                <span className="screen-pill inline-flex h-8 items-center rounded-[999px] px-3 text-xs text-white/78">
                  {motionSettings.enabled ? motionModeLabel : "静态"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMotionMode("soft")}
                  disabled={!motionSettings.enabled}
                  className={`rounded-[999px] border px-3 py-2 text-xs transition ${
                    motionSettings.mode === "soft" && motionSettings.enabled
                      ? "border-[#95f0c8]/[0.32] bg-[#95f0c8]/[0.12] text-[#ecfff7]"
                      : "border-white/10 bg-white/5 text-white/68 hover:bg-white/8 disabled:hover:bg-white/5"
                  } disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  柔动
                </button>
                <button
                  type="button"
                  onClick={() => setMotionMode("celebration")}
                  disabled={!motionSettings.enabled}
                  className={`rounded-[999px] border px-3 py-2 text-xs transition ${
                    motionSettings.mode === "celebration" && motionSettings.enabled
                      ? "border-[#f5d28a]/[0.32] bg-[#f5d28a]/[0.14] text-[#fff7df]"
                      : "border-white/10 bg-white/5 text-white/68 hover:bg-white/8 disabled:hover:bg-white/5"
                  } disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  庆典
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMotionEnabled(!motionSettings.enabled)}
                  className="inline-flex h-9 items-center gap-2 rounded-[999px] border border-white/12 bg-white/6 px-3 text-xs text-white/78 transition hover:bg-white/10"
                >
                  {motionSettings.enabled ? (
                    <Pause className="size-3.5 text-[#f5d28a]" />
                  ) : (
                    <Play className="size-3.5 text-[#95f0c8]" />
                  )}
                  {motionSettings.enabled ? "关闭动态" : "开启动态"}
                </button>
                <button
                  type="button"
                  onClick={toggleMotionFrozen}
                  disabled={!motionSettings.enabled}
                  className="inline-flex h-9 items-center gap-2 rounded-[999px] border border-white/12 bg-white/6 px-3 text-xs text-white/78 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Lock className="size-3.5 text-[#8ecfff]" />
                  {motionSettings.frozen ? "解锁流动" : "锁定当前帧"}
                </button>
              </div>

              <div className="mt-4">
                <ThemeAxis
                  label="速度"
                  hint="极光动态变化节奏"
                  icon={<Gauge className="size-4 text-[#f6b1c4]" />}
                  value={motionSettings.speed}
                  onChange={(value) => updateMotionSpeed(value)}
                  disabled={!motionSettings.enabled}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/84">极光色系</p>
                <p className="mt-1 text-xs text-white/46">选风格，再细调</p>
              </div>
              <button
                type="button"
                onClick={resetAdjustments}
                className="inline-flex h-9 items-center gap-2 rounded-[999px] border border-white/12 bg-white/6 px-3 text-xs text-white/78 transition hover:bg-white/10"
              >
                <RotateCcw className="size-3.5" />
                重置
              </button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {presets.map((preset) => {
                const active = preset.id === settings.presetId;
                const previewStyle = buildScreenThemeStyle({
                  presetId: preset.id,
                  brightness: 50,
                  saturation: 50,
                  glow: 50,
                });

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`rounded-[10px] border p-2 text-left transition ${
                      active
                        ? "border-[#95f0c8]/[0.3] bg-[#95f0c8]/[0.12]"
                        : "border-white/10 bg-white/5 hover:bg-white/8"
                    }`}
                  >
                    <div
                      className="screen-theme-preview relative h-[58px] overflow-hidden rounded-[8px]"
                      style={previewStyle}
                    >
                      <div className="screen-grid pointer-events-none absolute inset-0 opacity-60" />
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium text-white">{preset.label}</div>
                      <div className="mt-1 text-xs leading-5 text-white/50">{preset.note}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 space-y-4">
              <ThemeAxis
                label="亮度"
                hint="背景明暗"
                icon={<SunMedium className="size-4 text-[#f5d28a]" />}
                value={settings.brightness}
                onChange={(value) => updateAxis("brightness", value)}
              />
              <ThemeAxis
                label="饱和度"
                hint="极光色彩浓淡"
                icon={<Waves className="size-4 text-[#8ecfff]" />}
                value={settings.saturation}
                onChange={(value) => updateAxis("saturation", value)}
              />
              <ThemeAxis
                label="辉光"
                hint="空气感与光晕"
                icon={<Sparkles className="size-4 text-[#95f0c8]" />}
                value={settings.glow}
                onChange={(value) => updateAxis("glow", value)}
              />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ThemeAxis({
  label,
  hint,
  icon,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  hint: string;
  icon: ReactNode;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`block ${disabled ? "opacity-45" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <div className="text-sm text-white/82">{label}</div>
            <div className="text-[11px] leading-4 text-white/46">{hint}</div>
          </div>
        </div>
        <div className="text-xs text-white/54">{value}</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer accent-[#95f0c8] disabled:cursor-not-allowed"
      />
    </label>
  );
}
