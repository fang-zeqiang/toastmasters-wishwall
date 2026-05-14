"use client";

import {
  type CSSProperties,
  type PointerEvent,
  useState,
} from "react";
import Image from "next/image";
import { Check, Maximize2, RotateCw, Sparkles, X } from "lucide-react";

export type EarnedAnniversaryBadge = {
  id: string;
  nickname: string;
  displayName: string;
  wishExcerpt: string;
};

type AnniversaryBadgeModalProps = {
  badge: EarnedAnniversaryBadge;
  contained?: boolean;
  onClose: () => void;
};

export function AnniversaryBadgeModal({
  badge,
  contained = false,
  onClose,
}: AnniversaryBadgeModalProps) {
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 38 });

  const style =
    {
      "--badge-rx": `${tilt.x}deg`,
      "--badge-ry": `${tilt.y}deg`,
      "--badge-shine-x": `${tilt.shineX}%`,
      "--badge-shine-y": `${tilt.shineY}%`,
      "--badge-scale": expanded ? 1.1 : 1,
    } as CSSProperties;

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 20;
    const rotateX = (0.5 - y) * 18;

    setTilt({
      x: Number(rotateX.toFixed(2)),
      y: Number(rotateY.toFixed(2)),
      shineX: Math.round(x * 100),
      shineY: Math.round(y * 100),
    });
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0, shineX: 50, shineY: 38 });
  };

  return (
    <div
      className={`${contained ? "absolute" : "fixed"} inset-0 z-50 flex items-center justify-center px-4 py-6`}
    >
      <button
        type="button"
        aria-label="关闭徽章"
        className="absolute inset-0 bg-[#020816]/92"
        onClick={onClose}
      />

      <section
        className={`anniversary-badge-modal relative z-10 w-full overflow-hidden rounded-[18px] border border-white/14 px-5 pb-5 pt-4 text-white shadow-[0_32px_120px_rgba(0,0,0,0.46)] ${
          contained
            ? "anniversary-badge-modal--contained max-w-[342px]"
            : "max-w-[440px]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <span className="anniversary-badge-aurora anniversary-badge-aurora--cyan" />
          <span className="anniversary-badge-aurora anniversary-badge-aurora--violet" />
          <span className="anniversary-badge-aurora anniversary-badge-aurora--gold" />
        </div>

        <div className="anniversary-badge-header relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8fffe0]/25 bg-[#8fffe0]/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#ddfff7]">
              <Check className="size-3.5" />
              Wish Received
            </div>
            <h2 className="mt-3 text-[26px] font-semibold leading-tight">
              三周年纪念徽章已点亮
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/68">
              愿望已进入审核池，通过后会飞向会场大屏。
            </p>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/72 transition hover:bg-white/14 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="anniversary-badge-display relative z-10 mt-5 flex justify-center">
          <div
            className={`anniversary-badge-stage ${
              expanded ? "anniversary-badge-stage--expanded" : ""
            } ${flipped ? "anniversary-badge-stage--flipped" : ""}`}
            style={style}
          >
            <button
              type="button"
              aria-label="翻转三周年纪念徽章"
              className="anniversary-badge-token"
              onClick={() => setFlipped((current) => !current)}
              onPointerMove={handlePointerMove}
              onPointerLeave={resetTilt}
            >
              <span className="anniversary-badge-card">
                <span className="anniversary-badge-face anniversary-badge-face--front">
                  <Image
                    src="/badge/anniversary-3-disc.png"
                    alt="三周年纪念徽章正面"
                    width={1254}
                    height={1254}
                    sizes="(max-width: 640px) 74vw, 382px"
                    priority
                    className="anniversary-badge-image"
                    draggable={false}
                  />
                  <span className="anniversary-badge-glass" />
                  <span className="anniversary-badge-spark anniversary-badge-spark--one" />
                  <span className="anniversary-badge-spark anniversary-badge-spark--two" />
                </span>

                <span className="anniversary-badge-face anniversary-badge-face--back">
                  <span className="anniversary-badge-back-brush" aria-hidden="true" />
                  <span className="anniversary-badge-back-rim" aria-hidden="true" />
                  <span className="anniversary-badge-back-inner-rim" aria-hidden="true" />
                  <span className="anniversary-badge-back-content">
                    <span className="anniversary-badge-engraving">
                      携程头马三周年
                    </span>
                  </span>
                  <span className="anniversary-badge-metal-sheen" aria-hidden="true" />
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="anniversary-badge-meta relative z-10 mt-5 rounded-[12px] border border-white/10 bg-white/[0.07] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/48">
                Badge Owner
              </p>
              <p className="mt-1 truncate text-base font-medium text-white">
                {badge.nickname}
              </p>
            </div>
            <div className="rounded-full border border-[#91f3ff]/20 bg-[#91f3ff]/10 px-3 py-1 text-xs text-[#dffbff]">
              {badge.id}
            </div>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/62">
            {badge.wishExcerpt}
          </p>
        </div>

        <div className="anniversary-badge-actions relative z-10 mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFlipped((current) => !current)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-white/12 bg-white/8 text-sm text-white/82 transition hover:bg-white/14"
          >
            <RotateCw className="size-4" />
            翻面
          </button>
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(90deg,rgba(130,255,231,0.95),rgba(157,187,255,0.92),rgba(255,198,111,0.9))] text-sm font-semibold text-[#06111e] shadow-[0_16px_34px_rgba(103,230,215,0.2)] transition hover:brightness-110"
          >
            <Maximize2 className="size-4" />
            {expanded ? "收起" : "放大"}
          </button>
        </div>

        <div className="anniversary-badge-footer relative z-10 mt-4 flex items-center justify-center gap-2 text-xs text-white/48">
          <Sparkles className="size-3.5 text-[#f6d694]" />
          <span>3rd Anniversary Digital Badge</span>
        </div>
      </section>
    </div>
  );
}
