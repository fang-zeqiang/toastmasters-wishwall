import type { CSSProperties } from "react";

type ThemeColor = {
  l: number;
  c: number;
  h: number;
};

export type ScreenThemePresetId =
  | "polar-night"
  | "aurora-classic"
  | "soft-glow"
  | "crystal-blue"
  | "stage-radiance"
  | "emerald-current"
  | "violet-haze"
  | "rose-mist"
  | "festival-prism"
  | "electric-lime"
  | "crimson-flare";

export type ScreenThemeSettings = {
  presetId: ScreenThemePresetId;
  brightness: number;
  saturation: number;
  glow: number;
};

export type ScreenMotionMode = "soft" | "celebration";

export type ScreenMotionSettings = {
  enabled: boolean;
  mode: ScreenMotionMode;
  frozen: boolean;
  speed: number;
};

type ScreenThemePreset = {
  id: ScreenThemePresetId;
  label: string;
  note: string;
  backgroundStart: ThemeColor;
  backgroundMid: ThemeColor;
  backgroundEnd: ThemeColor;
  surface: ThemeColor;
  auroraMint: ThemeColor;
  auroraBlue: ThemeColor;
  auroraWarm: ThemeColor;
  auroraOpacity: [number, number, number];
};

type ScreenThemeTokens = {
  accentStrip: string;
  backgroundStart: string;
  backgroundMid: string;
  backgroundEnd: string;
  auroraMint: string;
  auroraBlue: string;
  auroraWarm: string;
  auroraBlur: string;
  overlayTop: string;
  overlayBottom: string;
  sideSheen: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  pillBg: string;
  bottleBg: string;
  bottleBorder: string;
  bottleShadow: string;
  gridLine: string;
  footerFadeMid: string;
  footerFadeEnd: string;
};

type ScreenMotionTokens = {
  playState: "running" | "paused";
  baseDuration: string;
  layerDurationA: string;
  layerDurationB: string;
  layerDurationC: string;
  bloomDuration: string;
  opacityA: string;
  opacityB: string;
  opacityC: string;
  opacityD: string;
  centerOpacity: string;
  bloomOpacity: string;
  blurA: string;
  blurB: string;
  blurC: string;
  saturate: string;
  contrast: string;
  hueA: string;
  hueANeg: string;
  hueB: string;
  hueBNeg: string;
  hueC: string;
  hueCNeg: string;
};

export const screenThemePresets: ScreenThemePreset[] = [
  {
    id: "polar-night",
    label: "极夜",
    note: "更沉稳，适合暗场投影",
    backgroundStart: { l: 0.11, c: 0.018, h: 242 },
    backgroundMid: { l: 0.14, c: 0.024, h: 236 },
    backgroundEnd: { l: 0.18, c: 0.028, h: 230 },
    surface: { l: 0.17, c: 0.017, h: 236 },
    auroraMint: { l: 0.82, c: 0.105, h: 168 },
    auroraBlue: { l: 0.8, c: 0.084, h: 238 },
    auroraWarm: { l: 0.86, c: 0.055, h: 88 },
    auroraOpacity: [0.17, 0.12, 0.08],
  },
  {
    id: "aurora-classic",
    label: "标准极光",
    note: "默认推荐，更通透",
    backgroundStart: { l: 0.15, c: 0.026, h: 240 },
    backgroundMid: { l: 0.19, c: 0.032, h: 234 },
    backgroundEnd: { l: 0.23, c: 0.038, h: 228 },
    surface: { l: 0.18, c: 0.019, h: 236 },
    auroraMint: { l: 0.87, c: 0.12, h: 166 },
    auroraBlue: { l: 0.85, c: 0.105, h: 236 },
    auroraWarm: { l: 0.89, c: 0.07, h: 92 },
    auroraOpacity: [0.22, 0.18, 0.12],
  },
  {
    id: "soft-glow",
    label: "柔光",
    note: "更轻，更柔和",
    backgroundStart: { l: 0.18, c: 0.022, h: 236 },
    backgroundMid: { l: 0.22, c: 0.026, h: 228 },
    backgroundEnd: { l: 0.27, c: 0.029, h: 220 },
    surface: { l: 0.21, c: 0.017, h: 232 },
    auroraMint: { l: 0.9, c: 0.095, h: 168 },
    auroraBlue: { l: 0.91, c: 0.073, h: 238 },
    auroraWarm: { l: 0.94, c: 0.05, h: 96 },
    auroraOpacity: [0.18, 0.14, 0.1],
  },
  {
    id: "crystal-blue",
    label: "晶蓝",
    note: "更冷，更清透",
    backgroundStart: { l: 0.16, c: 0.03, h: 248 },
    backgroundMid: { l: 0.2, c: 0.038, h: 240 },
    backgroundEnd: { l: 0.25, c: 0.042, h: 230 },
    surface: { l: 0.19, c: 0.021, h: 240 },
    auroraMint: { l: 0.86, c: 0.088, h: 182 },
    auroraBlue: { l: 0.88, c: 0.125, h: 248 },
    auroraWarm: { l: 0.88, c: 0.045, h: 112 },
    auroraOpacity: [0.2, 0.23, 0.08],
  },
  {
    id: "stage-radiance",
    label: "舞台高亮",
    note: "更亮，舞台感更强",
    backgroundStart: { l: 0.19, c: 0.028, h: 238 },
    backgroundMid: { l: 0.23, c: 0.031, h: 228 },
    backgroundEnd: { l: 0.28, c: 0.033, h: 210 },
    surface: { l: 0.22, c: 0.019, h: 230 },
    auroraMint: { l: 0.9, c: 0.11, h: 168 },
    auroraBlue: { l: 0.88, c: 0.082, h: 236 },
    auroraWarm: { l: 0.93, c: 0.09, h: 84 },
    auroraOpacity: [0.23, 0.17, 0.16],
  },
  {
    id: "emerald-current",
    label: "翡翠流光",
    note: "更偏青绿，通透冷艳",
    backgroundStart: { l: 0.17, c: 0.026, h: 224 },
    backgroundMid: { l: 0.2, c: 0.03, h: 212 },
    backgroundEnd: { l: 0.25, c: 0.034, h: 196 },
    surface: { l: 0.2, c: 0.018, h: 214 },
    auroraMint: { l: 0.89, c: 0.135, h: 168 },
    auroraBlue: { l: 0.86, c: 0.075, h: 206 },
    auroraWarm: { l: 0.88, c: 0.04, h: 102 },
    auroraOpacity: [0.24, 0.14, 0.08],
  },
  {
    id: "violet-haze",
    label: "紫雾极光",
    note: "冷紫偏蓝，更梦幻",
    backgroundStart: { l: 0.15, c: 0.03, h: 276 },
    backgroundMid: { l: 0.19, c: 0.034, h: 258 },
    backgroundEnd: { l: 0.24, c: 0.038, h: 236 },
    surface: { l: 0.19, c: 0.018, h: 252 },
    auroraMint: { l: 0.84, c: 0.065, h: 184 },
    auroraBlue: { l: 0.84, c: 0.11, h: 274 },
    auroraWarm: { l: 0.9, c: 0.055, h: 320 },
    auroraOpacity: [0.14, 0.24, 0.16],
  },
  {
    id: "rose-mist",
    label: "玫瑰晨雾",
    note: "粉金更柔，偏庆典感",
    backgroundStart: { l: 0.18, c: 0.023, h: 260 },
    backgroundMid: { l: 0.22, c: 0.025, h: 246 },
    backgroundEnd: { l: 0.27, c: 0.029, h: 224 },
    surface: { l: 0.21, c: 0.017, h: 246 },
    auroraMint: { l: 0.86, c: 0.06, h: 182 },
    auroraBlue: { l: 0.88, c: 0.082, h: 258 },
    auroraWarm: { l: 0.93, c: 0.082, h: 18 },
    auroraOpacity: [0.12, 0.16, 0.2],
  },
  {
    id: "festival-prism",
    label: "节庆幻彩",
    note: "蓝紫玫红，更出挑",
    backgroundStart: { l: 0.19, c: 0.034, h: 276 },
    backgroundMid: { l: 0.24, c: 0.04, h: 244 },
    backgroundEnd: { l: 0.29, c: 0.046, h: 214 },
    surface: { l: 0.22, c: 0.022, h: 248 },
    auroraMint: { l: 0.87, c: 0.08, h: 188 },
    auroraBlue: { l: 0.86, c: 0.14, h: 282 },
    auroraWarm: { l: 0.92, c: 0.115, h: 12 },
    auroraOpacity: [0.16, 0.26, 0.2],
  },
  {
    id: "electric-lime",
    label: "电光青柠",
    note: "青绿电感，更节日",
    backgroundStart: { l: 0.18, c: 0.03, h: 230 },
    backgroundMid: { l: 0.22, c: 0.034, h: 204 },
    backgroundEnd: { l: 0.28, c: 0.04, h: 178 },
    surface: { l: 0.21, c: 0.02, h: 208 },
    auroraMint: { l: 0.92, c: 0.16, h: 156 },
    auroraBlue: { l: 0.88, c: 0.092, h: 202 },
    auroraWarm: { l: 0.9, c: 0.078, h: 102 },
    auroraOpacity: [0.28, 0.17, 0.14],
  },
  {
    id: "crimson-flare",
    label: "绯光庆典",
    note: "洋红暖金，更热烈",
    backgroundStart: { l: 0.18, c: 0.032, h: 294 },
    backgroundMid: { l: 0.23, c: 0.038, h: 272 },
    backgroundEnd: { l: 0.28, c: 0.044, h: 238 },
    surface: { l: 0.21, c: 0.021, h: 268 },
    auroraMint: { l: 0.84, c: 0.07, h: 184 },
    auroraBlue: { l: 0.88, c: 0.145, h: 328 },
    auroraWarm: { l: 0.94, c: 0.102, h: 52 },
    auroraOpacity: [0.13, 0.27, 0.21],
  },
];

export const DEFAULT_SCREEN_THEME_SETTINGS: ScreenThemeSettings = {
  presetId: "stage-radiance",
  brightness: 50,
  saturation: 50,
  glow: 50,
};

export const DEFAULT_SCREEN_MOTION_SETTINGS: ScreenMotionSettings = {
  enabled: true,
  mode: "soft",
  frozen: false,
  speed: 50,
};

export function sanitizeScreenThemeSettings(
  input?: Partial<ScreenThemeSettings> | null
): ScreenThemeSettings {
  const presetId = screenThemePresets.some((preset) => preset.id === input?.presetId)
    ? (input?.presetId as ScreenThemePresetId)
    : DEFAULT_SCREEN_THEME_SETTINGS.presetId;

  return {
    presetId,
    brightness: clampSlider(input?.brightness),
    saturation: clampSlider(input?.saturation),
    glow: clampSlider(input?.glow),
  };
}

export function sanitizeScreenMotionSettings(
  input?: Partial<ScreenMotionSettings> | null
): ScreenMotionSettings {
  return {
    enabled:
      typeof input?.enabled === "boolean"
        ? input.enabled
        : DEFAULT_SCREEN_MOTION_SETTINGS.enabled,
    mode:
      input?.mode === "celebration" || input?.mode === "soft"
        ? input.mode
        : DEFAULT_SCREEN_MOTION_SETTINGS.mode,
    frozen:
      typeof input?.frozen === "boolean"
        ? input.frozen
        : DEFAULT_SCREEN_MOTION_SETTINGS.frozen,
    speed: clampSlider(input?.speed),
  };
}

export function getScreenThemePreset(id: ScreenThemePresetId) {
  return (
    screenThemePresets.find((preset) => preset.id === id) ??
    screenThemePresets[0]
  );
}

export function buildScreenThemeStyle(
  settings: ScreenThemeSettings
): CSSProperties & Record<string, string> {
  const tokens = buildScreenThemeTokens(settings);

  return {
    "--screen-bg-start": tokens.backgroundStart,
    "--screen-bg-mid": tokens.backgroundMid,
    "--screen-bg-end": tokens.backgroundEnd,
    "--screen-aurora-a": tokens.auroraMint,
    "--screen-aurora-b": tokens.auroraBlue,
    "--screen-aurora-c": tokens.auroraWarm,
    "--screen-aurora-blur": tokens.auroraBlur,
    "--screen-overlay-top": tokens.overlayTop,
    "--screen-overlay-bottom": tokens.overlayBottom,
    "--screen-side-sheen": tokens.sideSheen,
    "--screen-panel-bg": tokens.panelBg,
    "--screen-panel-border": tokens.panelBorder,
    "--screen-panel-shadow": tokens.panelShadow,
    "--screen-pill-bg": tokens.pillBg,
    "--screen-bottle-bg": tokens.bottleBg,
    "--screen-bottle-border": tokens.bottleBorder,
    "--screen-bottle-shadow": tokens.bottleShadow,
    "--screen-grid-line": tokens.gridLine,
    "--screen-footer-fade-mid": tokens.footerFadeMid,
    "--screen-footer-fade-end": tokens.footerFadeEnd,
    "--screen-accent-strip": tokens.accentStrip,
  };
}

export function buildScreenMotionStyle(
  settings: ScreenMotionSettings
): CSSProperties & Record<string, string> {
  const tokens = buildScreenMotionTokens(settings);

  return {
    "--screen-motion-play-state": tokens.playState,
    "--screen-motion-base-duration": tokens.baseDuration,
    "--screen-motion-duration-a": tokens.layerDurationA,
    "--screen-motion-duration-b": tokens.layerDurationB,
    "--screen-motion-duration-c": tokens.layerDurationC,
    "--screen-motion-bloom-duration": tokens.bloomDuration,
    "--screen-motion-opacity-a": tokens.opacityA,
    "--screen-motion-opacity-b": tokens.opacityB,
    "--screen-motion-opacity-c": tokens.opacityC,
    "--screen-motion-opacity-d": tokens.opacityD,
    "--screen-motion-center-opacity": tokens.centerOpacity,
    "--screen-motion-bloom-opacity": tokens.bloomOpacity,
    "--screen-motion-blur-a": tokens.blurA,
    "--screen-motion-blur-b": tokens.blurB,
    "--screen-motion-blur-c": tokens.blurC,
    "--screen-motion-saturate": tokens.saturate,
    "--screen-motion-contrast": tokens.contrast,
    "--screen-motion-hue-a": tokens.hueA,
    "--screen-motion-hue-a-neg": tokens.hueANeg,
    "--screen-motion-hue-b": tokens.hueB,
    "--screen-motion-hue-b-neg": tokens.hueBNeg,
    "--screen-motion-hue-c": tokens.hueC,
    "--screen-motion-hue-c-neg": tokens.hueCNeg,
  };
}

function buildScreenThemeTokens(settings: ScreenThemeSettings): ScreenThemeTokens {
  const preset = getScreenThemePreset(settings.presetId);
  const brightnessFactor = (settings.brightness - 50) / 50;
  const saturationFactor = (settings.saturation - 50) / 50;
  const glowFactor = (settings.glow - 50) / 50;

  const backgroundShift = brightnessFactor * 0.052;
  const surfaceShift = brightnessFactor * 0.04;
  const chromaMultiplier = 1 + saturationFactor * 0.38;
  const glowMultiplier = 1 + glowFactor * 0.55;

  const backgroundStart = shiftColor(preset.backgroundStart, backgroundShift, 1);
  const backgroundMid = shiftColor(preset.backgroundMid, backgroundShift, 1.02);
  const backgroundEnd = shiftColor(preset.backgroundEnd, backgroundShift, 1.04);
  const surface = shiftColor(preset.surface, surfaceShift, 1);
  const auroraMint = shiftColor(preset.auroraMint, brightnessFactor * 0.022, chromaMultiplier);
  const auroraBlue = shiftColor(preset.auroraBlue, brightnessFactor * 0.018, chromaMultiplier);
  const auroraWarm = shiftColor(preset.auroraWarm, brightnessFactor * 0.028, chromaMultiplier * 0.92);
  const gridColor = shiftColor(preset.auroraBlue, -0.28, 0.18);
  const panelBorder = shiftColor(preset.auroraBlue, -0.04, 0.48 + (settings.saturation / 100) * 0.18);
  const bottleBorder = shiftColor(preset.auroraMint, -0.1, 0.42 + (settings.saturation / 100) * 0.16);
  const darkBase = shiftColor(backgroundStart, -0.08, 0.25);

  return {
    accentStrip: `linear-gradient(90deg, ${toOklch(auroraMint, 0.94)}, ${toOklch(
      auroraBlue,
      0.92
    )} 58%, ${toOklch(auroraWarm, 0.88)})`,
    backgroundStart: toOklch(backgroundStart),
    backgroundMid: toOklch(backgroundMid),
    backgroundEnd: toOklch(backgroundEnd),
    auroraMint: toOklch(
      auroraMint,
      clamp(preset.auroraOpacity[0] * glowMultiplier, 0.09, 0.32)
    ),
    auroraBlue: toOklch(
      auroraBlue,
      clamp(preset.auroraOpacity[1] * glowMultiplier, 0.08, 0.3)
    ),
    auroraWarm: toOklch(
      auroraWarm,
      clamp(preset.auroraOpacity[2] * glowMultiplier, 0.05, 0.26)
    ),
    auroraBlur: `${Math.round(clamp(36 + glowFactor * 18, 20, 58))}px`,
    overlayTop: toOklch(darkBase, clamp(0.08 - brightnessFactor * 0.025, 0.03, 0.1)),
    overlayBottom: toOklch(darkBase, clamp(0.28 - brightnessFactor * 0.08, 0.14, 0.3)),
    sideSheen: `rgba(255, 255, 255, ${clamp(0.02 + glowFactor * 0.01, 0.015, 0.04).toFixed(
      3
    )})`,
    panelBg: toOklch(surface, clamp(0.72 + brightnessFactor * 0.08, 0.64, 0.8)),
    panelBorder: toOklch(panelBorder, clamp(0.14 + glowFactor * 0.04, 0.12, 0.22)),
    panelShadow: `0 28px 70px ${toOklch(darkBase, 0.28)}`,
    pillBg: toOklch(surface, clamp(0.55 + brightnessFactor * 0.05, 0.5, 0.62)),
    bottleBg: toOklch(
      shiftColor(surface, 0.01, 1.08),
      clamp(0.54 + brightnessFactor * 0.05, 0.48, 0.62)
    ),
    bottleBorder: toOklch(
      bottleBorder,
      clamp(0.12 + glowFactor * 0.04, 0.1, 0.2)
    ),
    bottleShadow: `0 18px 44px ${toOklch(darkBase, 0.24)}`,
    gridLine: toOklch(gridColor, clamp(0.09 + glowFactor * 0.02, 0.07, 0.13)),
    footerFadeMid: toOklch(darkBase, clamp(0.42 - brightnessFactor * 0.08, 0.28, 0.46)),
    footerFadeEnd: toOklch(darkBase, clamp(0.82 - brightnessFactor * 0.1, 0.62, 0.84)),
  };
}

function buildScreenMotionTokens(
  settings: ScreenMotionSettings
): ScreenMotionTokens {
  const speedFactor = (settings.speed - 50) / 50;
  const durationMultiplier = clamp(1 - speedFactor * 0.45, 0.55, 1.45);
  const bloomDurationMultiplier = clamp(1 - speedFactor * 0.4, 0.6, 1.4);
  const profile =
    settings.mode === "celebration"
      ? {
          baseDuration: 18,
          layerDurationA: 16,
          layerDurationB: 22,
          layerDurationC: 30,
          bloomDuration: 6.8,
          opacityA: 0.98,
          opacityB: 0.88,
          opacityC: 0.78,
          opacityD: 0.42,
          centerOpacity: 0.34,
          bloomOpacity: 0.42,
          blurA: 72,
          blurB: 84,
          blurC: 96,
          saturate: 1.5,
          contrast: 1.12,
          hueA: 44,
          hueB: 58,
          hueC: 36,
        }
      : {
          baseDuration: 28,
          layerDurationA: 30,
          layerDurationB: 42,
          layerDurationC: 56,
          bloomDuration: 11.5,
          opacityA: 0.72,
          opacityB: 0.62,
          opacityC: 0.52,
          opacityD: 0.22,
          centerOpacity: 0.16,
          bloomOpacity: 0.22,
          blurA: 92,
          blurB: 104,
          blurC: 118,
          saturate: 1.22,
          contrast: 1.04,
          hueA: 16,
          hueB: 24,
          hueC: 12,
        };

  return {
    playState: settings.enabled && !settings.frozen ? "running" : "paused",
    baseDuration: `${(profile.baseDuration * durationMultiplier).toFixed(2)}s`,
    layerDurationA: `${(profile.layerDurationA * durationMultiplier).toFixed(2)}s`,
    layerDurationB: `${(profile.layerDurationB * durationMultiplier).toFixed(2)}s`,
    layerDurationC: `${(profile.layerDurationC * durationMultiplier).toFixed(2)}s`,
    bloomDuration: `${(profile.bloomDuration * bloomDurationMultiplier).toFixed(2)}s`,
    opacityA: profile.opacityA.toFixed(3),
    opacityB: profile.opacityB.toFixed(3),
    opacityC: profile.opacityC.toFixed(3),
    opacityD: profile.opacityD.toFixed(3),
    centerOpacity: profile.centerOpacity.toFixed(3),
    bloomOpacity: profile.bloomOpacity.toFixed(3),
    blurA: `${profile.blurA}px`,
    blurB: `${profile.blurB}px`,
    blurC: `${profile.blurC}px`,
    saturate: profile.saturate.toFixed(2),
    contrast: profile.contrast.toFixed(2),
    hueA: `${profile.hueA}deg`,
    hueANeg: `${-profile.hueA}deg`,
    hueB: `${profile.hueB}deg`,
    hueBNeg: `${-profile.hueB}deg`,
    hueC: `${profile.hueC}deg`,
    hueCNeg: `${-profile.hueC}deg`,
  };
}

function shiftColor(color: ThemeColor, lightnessDelta: number, chromaMultiplier: number) {
  return {
    l: clamp(color.l + lightnessDelta, 0.08, 0.96),
    c: clamp(color.c * chromaMultiplier, 0, 0.22),
    h: normalizeHue(color.h),
  };
}

function toOklch(color: ThemeColor, alpha = 1) {
  const base = `oklch(${(color.l * 100).toFixed(1)}% ${color.c.toFixed(3)} ${normalizeHue(
    color.h
  ).toFixed(1)}`;

  return alpha >= 1 ? `${base})` : `${base} / ${alpha.toFixed(3)})`;
}

function clampSlider(value: number | undefined) {
  const nextValue = typeof value === "number" ? value : Number.NaN;

  if (!Number.isFinite(nextValue)) {
    return 50;
  }

  return clamp(Math.round(nextValue), 0, 100);
}

function normalizeHue(value: number) {
  const wrapped = value % 360;
  return wrapped >= 0 ? wrapped : wrapped + 360;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
