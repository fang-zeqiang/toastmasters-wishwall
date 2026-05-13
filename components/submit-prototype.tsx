"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  LoaderCircle,
  LockKeyhole,
  MessageSquareQuote,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

import {
  buildClientDeviceId,
  countText,
  deriveDisplayName,
  MAX_DEVICE_SUBMITS,
  MAX_WISH_LENGTH,
  MIN_WISH_LENGTH,
} from "@/lib/wish-wall";

type SubmitPrototypeProps = {
  compact?: boolean;
};

type BannerTone = "success" | "warning" | "info";

const DEVICE_STORAGE_KEY = "wishwall_device_id";
const MOCK_WISH =
  "希望明年能把英文主持练稳，也把更多掌声和勇气送给台上的每个人。";

export function SubmitPrototype({ compact = false }: SubmitPrototypeProps) {
  const liveMode = !compact;
  const [nickname, setNickname] = useState(compact ? "Sunny" : "");
  const [wishText, setWishText] = useState(compact ? MOCK_WISH : "");
  const [anonymous, setAnonymous] = useState(false);
  const [usedCount, setUsedCount] = useState(compact ? 2 : 0);
  const deviceIdRef = useRef("");
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(liveMode);
  const [configured, setConfigured] = useState(!liveMode);
  const [message, setMessage] = useState("");
  const [bannerTone, setBannerTone] = useState<BannerTone>("info");

  const nicknameCount = countText(nickname);
  const wishCount = countText(wishText);
  const remaining = MAX_WISH_LENGTH - wishCount;
  const displayName = deriveDisplayName(nickname, anonymous) || "你的昵称";
  const submissionsLeft = Math.max(0, MAX_DEVICE_SUBMITS - usedCount);

  const canSubmit = useMemo(() => {
    return (
      nicknameCount > 0 &&
      nicknameCount <= 12 &&
      wishCount >= MIN_WISH_LENGTH &&
      wishCount <= MAX_WISH_LENGTH &&
      usedCount < MAX_DEVICE_SUBMITS
    );
  }, [nicknameCount, usedCount, wishCount]);

  useEffect(() => {
    if (!liveMode) {
      return;
    }

    const nextDeviceId = getOrCreateDeviceId();
    deviceIdRef.current = nextDeviceId;
    void syncMeta(nextDeviceId);
  }, [liveMode]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setBannerTone("warning");

      if (nicknameCount === 0) {
        setMessage("请先填写昵称。");
        return;
      }

      if (wishCount < MIN_WISH_LENGTH) {
        setMessage("愿景需要至少 30 字。");
        return;
      }

      if (usedCount >= MAX_DEVICE_SUBMITS) {
        setMessage("本设备提交次数已满。");
        return;
      }

      setMessage("请检查输入内容。");
      return;
    }

    if (!liveMode) {
      setUsedCount((current) => current + 1);
      setBannerTone("success");
      setMessage("已进入审核池，审核通过后将在大屏出现。");
      return;
    }

    if (!configured) {
      setBannerTone("warning");
      setMessage("飞书后端尚未配置完成。");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          wishText,
          anonymous,
          deviceId: deviceIdRef.current,
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        usedCount?: number;
      };

      if (!response.ok) {
        throw new Error(payload.message || "提交失败，请稍后再试。");
      }

      setUsedCount(payload.usedCount ?? usedCount + 1);
      setWishText("");
      setAnonymous(false);
      setBannerTone("success");
      setMessage(payload.message || "已进入审核池，审核通过后将在大屏出现。");
    } catch (error) {
      setBannerTone("warning");
      setMessage(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  };

  const surfacePadding = compact ? "px-5 py-5" : "px-6 py-8";
  const titleSize = compact ? "text-[28px]" : "text-[34px]";
  const bannerClass =
    bannerTone === "success"
      ? "border-[#95f0c8]/[0.25] bg-[#95f0c8]/[0.10] text-[#e7fff4]"
      : "border-[#f5d28a]/[0.25] bg-[#f5d28a]/[0.10] text-[#fff4d6]";

  return (
    <div
      className={`page-shell relative isolate overflow-hidden text-white ${compact ? "min-h-[780px]" : "min-h-screen"}`}
    >
      <div
        className={`relative z-10 mx-auto flex h-full w-full max-w-sm flex-col ${surfacePadding}`}
      >
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80">
            <Sparkles className="size-3.5 text-[#9ef3d0]" />
            Toastmasters 3rd Anniversary
          </div>
          <h1 className={`mt-5 font-semibold leading-tight text-white ${titleSize}`}>
            把新年愿望投进星海
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/72">
            今晚想把哪件事说给明年的自己听？
          </p>
        </header>

        <main className="surface-panel flex flex-1 flex-col rounded-[8px] p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                手机提交页
              </p>
              <p className="mt-1 text-sm text-white/72">昵称 + 愿景 + 匿名</p>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/72">
              {syncing ? (
                <LoaderCircle className="size-3.5 animate-spin text-[#f5d28a]" />
              ) : (
                <LockKeyhole className="size-3.5 text-[#f5d28a]" />
              )}
              <span>{syncing ? "同步中..." : `剩余 ${submissionsLeft} 次`}</span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <div className="mb-2 flex items-center justify-between text-sm text-white/78">
                <span>昵称</span>
                <span className="text-white/48">{nicknameCount}/12</span>
              </div>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                <input
                  value={nickname}
                  maxLength={12}
                  onChange={(event) => {
                    setNickname(event.target.value);
                    if (message) {
                      setMessage("");
                    }
                  }}
                  className="h-12 w-full rounded-[8px] border border-white/12 bg-white/6 pl-11 pr-4 text-sm text-white placeholder:text-white/35"
                  placeholder="输入你的昵称"
                />
              </div>
            </label>

            <label className="block">
              <div className="mb-2 flex items-center justify-between text-sm text-white/78">
                <span>新年愿景</span>
                <span className={remaining < 10 ? "text-[#f5d28a]" : "text-white/48"}>
                  {wishCount}/{MAX_WISH_LENGTH}
                </span>
              </div>
              <div className="relative">
                <MessageSquareQuote className="pointer-events-none absolute left-4 top-4 size-4 text-white/40" />
                <textarea
                  value={wishText}
                  maxLength={MAX_WISH_LENGTH}
                  onChange={(event) => {
                    setWishText(event.target.value);
                    if (message) {
                      setMessage("");
                    }
                  }}
                  className="min-h-36 w-full rounded-[8px] border border-white/12 bg-white/6 px-4 py-3 pl-11 text-sm leading-7 text-white placeholder:text-white/35"
                  placeholder="写下 30~50 字愿景"
                />
              </div>
            </label>

            <label className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/6 px-4 py-3">
              <div>
                <p className="text-sm text-white">匿名显示</p>
                <p className="mt-1 text-xs text-white/55">
                  开启后上墙名固定为“匿名朋友”
                </p>
              </div>
              <span className="relative inline-flex h-7 w-12 items-center">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(event) => setAnonymous(event.target.checked)}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full bg-white/16 transition peer-checked:bg-[#87ebc4]" />
                <span className="absolute left-1 size-5 rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.25)] transition peer-checked:translate-x-5" />
              </span>
            </label>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[#f5d28a]">
                <Star className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm text-white/62">
                  <span className="uppercase tracking-[0.18em]">上墙预览</span>
                  {anonymous ? (
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/60">
                      匿名模式
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-base font-medium text-white">{displayName}</p>
                <p className="mt-2 max-w-[24rem] text-sm leading-7 text-white/75">
                  {wishText || "你的愿景会从这里飞向大屏。"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting || syncing}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(90deg,rgba(120,241,212,0.95),rgba(247,210,138,0.92))] px-5 text-sm font-semibold text-[#08121f] shadow-[0_12px_30px_rgba(121,219,205,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {submitting ? "提交中..." : "投递愿望"}
            </button>

            <div className="flex items-center justify-between text-xs text-white/58">
              <span>要求：昵称 12 字内，愿景 30~50 字</span>
              <span>设备已提交 {usedCount}/10</span>
            </div>

            {message ? (
              <div className={`flex items-start gap-2 rounded-[8px] border px-3 py-3 text-sm ${bannerClass}`}>
                {bannerTone === "success" ? (
                  <Check className="mt-0.5 size-4" />
                ) : (
                  <Sparkles className="mt-0.5 size-4" />
                )}
                <span className="leading-6">{message}</span>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );

  async function syncMeta(nextDeviceId: string) {
    setSyncing(true);

    try {
      const response = await fetch(
        `/api/public/meta?deviceId=${encodeURIComponent(nextDeviceId)}`,
        {
          cache: "no-store",
        }
      );
      const payload = (await response.json()) as {
        configured?: boolean;
        usedCount?: number;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "读取设备提交次数失败。");
      }

      setConfigured(payload.configured ?? true);
      setUsedCount(payload.usedCount ?? 0);
    } catch (error) {
      setConfigured(false);
      setBannerTone("warning");
      setMessage(
        error instanceof Error ? error.message : "读取设备提交次数失败。"
      );
    } finally {
      setSyncing(false);
    }
  }
}

function getOrCreateDeviceId() {
  const existing = window.localStorage.getItem(DEVICE_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const next = buildClientDeviceId();
  window.localStorage.setItem(DEVICE_STORAGE_KEY, next);
  return next;
}
