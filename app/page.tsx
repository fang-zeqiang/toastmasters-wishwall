import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, MonitorPlay, ShieldCheck, Smartphone } from "lucide-react";

import { AdminPrototype } from "@/components/admin-prototype";
import { ScreenPrototype } from "@/components/screen-prototype";
import { SubmitPrototype } from "@/components/submit-prototype";

export default function Home() {
  return (
    <div className="page-shell min-h-screen text-white">
      <main className="mx-auto w-full max-w-[1440px] px-6 py-8 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-white/78">
              <MonitorPlay className="size-3.5 text-[#95f0c8]" />
              Toastmasters Anniversary Prototype
            </div>
            <h1 className="mt-4 text-[40px] font-semibold tracking-tight text-white">
              三周年电子许愿墙前端原型
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
              这里直接看三块核心界面：手机提交页、管理员审核页、会场大屏页。视觉先走极光 + 星海 + 漂流感。
            </p>
          </div>

          <nav className="flex flex-wrap gap-3">
            <PreviewLink href="/submit" icon={<Smartphone className="size-4" />}>
              打开提交页
            </PreviewLink>
            <PreviewLink href="/admin" icon={<ShieldCheck className="size-4" />}>
              打开管理页
            </PreviewLink>
            <PreviewLink href="/screen" icon={<MonitorPlay className="size-4" />}>
              打开大屏页
            </PreviewLink>
          </nav>
        </header>

        <section className="mt-8 grid gap-6 2xl:grid-cols-[400px_minmax(0,1fr)]">
          <PreviewFrame
            title="提交页"
            subtitle="手机扫码体验"
            href="/submit"
            mode="phone"
          >
            <SubmitPrototype compact />
          </PreviewFrame>

          <PreviewFrame
            title="管理页"
            subtitle="审核与控场"
            href="/admin"
            mode="desktop"
          >
            <AdminPrototype compact />
          </PreviewFrame>
        </section>

        <section className="mt-6">
          <PreviewFrame
            title="大屏展示页"
            subtitle="会场投屏视觉"
            href="/screen"
            mode="desktop"
          >
            <ScreenPrototype compact />
          </PreviewFrame>
        </section>
      </main>
    </div>
  );
}

function PreviewLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-white/12 bg-white/6 px-4 text-sm text-white/84 transition hover:bg-white/10"
    >
      {icon}
      {children}
      <ArrowUpRight className="size-4 text-white/54" />
    </Link>
  );
}

function PreviewFrame({
  title,
  subtitle,
  href,
  mode,
  children,
}: {
  title: string;
  subtitle: string;
  href: string;
  mode: "phone" | "desktop";
  children: ReactNode;
}) {
  return (
    <section className="surface-panel rounded-[8px] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/48">{subtitle}</p>
          <h2 className="mt-2 text-xl font-medium text-white">{title}</h2>
        </div>
        <Link
          href={href}
          className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-white/12 bg-white/6 px-3 text-sm text-white/82 transition hover:bg-white/10"
        >
          进入页面
          <ArrowUpRight className="size-4 text-white/54" />
        </Link>
      </div>

      {mode === "phone" ? (
        <div className="mx-auto max-w-[390px] rounded-[32px] border border-white/12 bg-[#091120] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div className="overflow-hidden rounded-[28px]">
            {children}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[8px] border border-white/10">
          {children}
        </div>
      )}
    </section>
  );
}
