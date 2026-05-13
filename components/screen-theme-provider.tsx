"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  buildScreenMotionStyle,
  buildScreenThemeStyle,
  DEFAULT_SCREEN_MOTION_SETTINGS,
  DEFAULT_SCREEN_THEME_SETTINGS,
  getScreenThemePreset,
  sanitizeScreenMotionSettings,
  sanitizeScreenThemeSettings,
  type ScreenMotionMode,
  type ScreenMotionSettings,
  screenThemePresets,
  type ScreenThemePresetId,
  type ScreenThemeSettings,
} from "@/lib/screen-theme";

type ScreenThemeContextValue = {
  currentPreset: ReturnType<typeof getScreenThemePreset>;
  motionSettings: ScreenMotionSettings;
  presets: typeof screenThemePresets;
  performanceMode: boolean;
  motionStyle: ReturnType<typeof buildScreenMotionStyle>;
  screenThemeStyle: ReturnType<typeof buildScreenThemeStyle>;
  settings: ScreenThemeSettings;
  applyPreset: (presetId: ScreenThemePresetId) => void;
  setMotionEnabled: (enabled: boolean) => void;
  setMotionMode: (mode: ScreenMotionMode) => void;
  updateMotionSpeed: (value: number) => void;
  setPerformanceMode: (nextValue: boolean) => void;
  resetAdjustments: () => void;
  toggleMotionFrozen: () => void;
  togglePerformanceMode: () => void;
  updateAxis: (axis: "brightness" | "saturation" | "glow", value: number) => void;
};

const STORAGE_KEY = "wishwall-screen-theme-v1";
const MOTION_STORAGE_KEY = "wishwall-screen-motion-v1";
const CHANNEL_NAME = "wishwall-screen-theme";
const MOTION_CHANNEL_NAME = "wishwall-screen-motion";

const ScreenThemeContext = createContext<ScreenThemeContextValue | null>(null);

export function ScreenThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SCREEN_THEME_SETTINGS);
  const [motionSettings, setMotionSettings] = useState(DEFAULT_SCREEN_MOTION_SETTINGS);
  const [performanceMode, setPerformanceModeState] = useState(false);
  const themeChannelRef = useRef<BroadcastChannel | null>(null);
  const motionChannelRef = useRef<BroadcastChannel | null>(null);
  const mountedRef = useRef(false);
  const hydratedFromStorageRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    mountedRef.current = true;
    const rafId = window.requestAnimationFrame(() => {
      setSettings(readStoredSettings());
      setMotionSettings(readStoredMotionSettings());
      hydratedFromStorageRef.current = true;
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          setSettings(sanitizeScreenThemeSettings(JSON.parse(event.newValue)));
        } catch {
          setSettings(DEFAULT_SCREEN_THEME_SETTINGS);
        }
      }

      if (event.key === MOTION_STORAGE_KEY && event.newValue) {
        try {
          setMotionSettings(sanitizeScreenMotionSettings(JSON.parse(event.newValue)));
        } catch {
          setMotionSettings(DEFAULT_SCREEN_MOTION_SETTINGS);
        }
      }

      if (event.key !== STORAGE_KEY && event.key !== MOTION_STORAGE_KEY) {
        return;
      }
    };

    window.addEventListener("storage", handleStorage);

    if (typeof BroadcastChannel !== "undefined") {
      const themeChannel = new BroadcastChannel(CHANNEL_NAME);
      themeChannel.onmessage = (event: MessageEvent<Partial<ScreenThemeSettings>>) => {
        setSettings(sanitizeScreenThemeSettings(event.data));
      };
      themeChannelRef.current = themeChannel;

      const motionChannel = new BroadcastChannel(MOTION_CHANNEL_NAME);
      motionChannel.onmessage = (event: MessageEvent<Partial<ScreenMotionSettings>>) => {
        setMotionSettings(sanitizeScreenMotionSettings(event.data));
      };
      motionChannelRef.current = motionChannel;
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("storage", handleStorage);
      themeChannelRef.current?.close();
      motionChannelRef.current?.close();
      themeChannelRef.current = null;
      motionChannelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      !mountedRef.current ||
      !hydratedFromStorageRef.current ||
      typeof window === "undefined"
    ) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    themeChannelRef.current?.postMessage(settings);
  }, [settings]);

  useEffect(() => {
    if (
      !mountedRef.current ||
      !hydratedFromStorageRef.current ||
      typeof window === "undefined"
    ) {
      return;
    }

    window.localStorage.setItem(MOTION_STORAGE_KEY, JSON.stringify(motionSettings));
    motionChannelRef.current?.postMessage(motionSettings);
  }, [motionSettings]);

  const value = useMemo<ScreenThemeContextValue>(() => {
    const currentPreset = getScreenThemePreset(settings.presetId);

    return {
      currentPreset,
      motionSettings,
      presets: screenThemePresets,
      performanceMode,
      motionStyle: buildScreenMotionStyle(motionSettings),
      screenThemeStyle: buildScreenThemeStyle(settings),
      settings,
      applyPreset(presetId) {
        setSettings({
          presetId,
          brightness: 50,
          saturation: 50,
          glow: 50,
        });
      },
      setMotionEnabled(enabled) {
        setMotionSettings((current) => ({
          ...current,
          enabled,
          frozen: enabled ? current.frozen : false,
        }));
      },
      setMotionMode(mode) {
        setMotionSettings((current) => ({
          ...current,
          mode,
        }));
      },
      updateMotionSpeed(value) {
        setMotionSettings((current) => ({
          ...current,
          speed: Math.min(100, Math.max(0, Math.round(value))),
        }));
      },
      setPerformanceMode(nextValue) {
        setPerformanceModeState(nextValue);
      },
      resetAdjustments() {
        setSettings((current) => ({
          ...current,
          brightness: 50,
          saturation: 50,
          glow: 50,
        }));
      },
      toggleMotionFrozen() {
        setMotionSettings((current) => ({
          ...current,
          frozen: current.enabled ? !current.frozen : false,
        }));
      },
      togglePerformanceMode() {
        setPerformanceModeState((current) => !current);
      },
      updateAxis(axis, value) {
        setSettings((current) => ({
          ...current,
          [axis]: Math.min(100, Math.max(0, Math.round(value))),
        }));
      },
    };
  }, [motionSettings, performanceMode, settings]);

  return (
    <ScreenThemeContext.Provider value={value}>
      {children}
    </ScreenThemeContext.Provider>
  );
}

export function useScreenTheme() {
  const context = useContext(ScreenThemeContext);

  if (!context) {
    throw new Error("useScreenTheme must be used within ScreenThemeProvider");
  }

  return context;
}

function readStoredSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_SCREEN_THEME_SETTINGS;
    }

    return sanitizeScreenThemeSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SCREEN_THEME_SETTINGS;
  }
}

function readStoredMotionSettings() {
  try {
    const raw = window.localStorage.getItem(MOTION_STORAGE_KEY);

    if (!raw) {
      return DEFAULT_SCREEN_MOTION_SETTINGS;
    }

    return sanitizeScreenMotionSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SCREEN_MOTION_SETTINGS;
  }
}
