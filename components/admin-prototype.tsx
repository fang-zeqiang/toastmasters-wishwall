"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Pin,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import { previewSummary, wishSeed } from "@/components/prototype-data";
import {
  buildWishCsv,
  computeWishSummary,
  sortAdminRecords,
  type WishRecord,
  type WishStatus,
} from "@/lib/wish-wall";

type AdminPrototypeProps = {
  compact?: boolean;
};

type FilterKey = "all" | WishStatus;
type NoticeTone = "success" | "warning" | "info";

const filterOptions: { key: FilterKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待审核" },
  { key: "approved", label: "已通过" },
  { key: "hidden", label: "已隐藏" },
  { key: "rejected", label: "已驳回" },
];

const toneMap = {
  aurora: "border-[#95f0c8]/[0.22] bg-[#95f0c8]/[0.10] text-[#e4fff4]",
  sky: "border-[#8bb7ff]/[0.22] bg-[#8bb7ff]/[0.10] text-[#e6efff]",
  gold: "border-[#f5d28a]/[0.22] bg-[#f5d28a]/[0.10] text-[#fff6dc]",
  rose: "border-[#f5b1c3]/[0.22] bg-[#f5b1c3]/[0.10] text-[#ffe8ef]",
};

const statusCopy: Record<WishStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已驳回",
  hidden: "已隐藏",
};

const actionButtonClass =
  "inline-flex h-9 items-center gap-2 rounded-[8px] border border-white/12 bg-white/6 px-3 text-xs text-white/78 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60";

export function AdminPrototype({ compact = false }: AdminPrototypeProps) {
  const liveMode = !compact;
  const [records, setRecords] = useState<WishRecord[]>(compact ? wishSeed : []);
  const [filter, setFilter] = useState<FilterKey>("pending");
  const [query, setQuery] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(!liveMode);
  const [configured, setConfigured] = useState(!liveMode);
  const [loading, setLoading] = useState(liveMode);
  const [busyRecordId, setBusyRecordId] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<NoticeTone>("info");

  const summary = useMemo(
    () => (liveMode ? computeWishSummary(records) : previewSummary),
    [liveMode, records]
  );

  const visibleRecords = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    const filtered = sortAdminRecords(records)
      .filter((record) => (filter === "all" ? true : record.status === filter))
      .filter((record) => {
        if (!lowered) {
          return true;
        }

        return [record.nickname, record.displayName, record.wishText, record.track]
          .join(" ")
          .toLowerCase()
          .includes(lowered);
      });

    return compact ? filtered.slice(0, 7) : filtered;
  }, [compact, filter, query, records]);

  const frameHeight = compact ? "min-h-[800px]" : "min-h-screen";
  const devicesCount = summary.devices || countDevices(records);
  const noticeClass =
    noticeTone === "success"
      ? "border-[#95f0c8]/[0.25] bg-[#95f0c8]/[0.10] text-[#e9fff4]"
      : "border-[#f5d28a]/[0.25] bg-[#f5d28a]/[0.10] text-[#fff4d6]";

  const refreshRecords = useCallback(async () => {
    if (!liveMode) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/wishes", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        records?: WishRecord[];
        allRecords?: WishRecord[];
        message?: string;
      };

      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.message || "读取审核数据失败。");
      }

      setRecords(payload.allRecords ?? payload.records ?? []);
    } catch (error) {
      setNoticeTone("warning");
      setNotice(error instanceof Error ? error.message : "读取审核数据失败。");
    } finally {
      setLoading(false);
    }
  }, [liveMode]);

  useEffect(() => {
    if (!liveMode) {
      return;
    }

    void (async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/admin/session", {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          configured?: boolean;
          authenticated?: boolean;
        };

        setConfigured(payload.configured ?? false);
        setAuthenticated(payload.authenticated ?? false);

        if (payload.configured && payload.authenticated) {
          await refreshRecords();
        }
      } catch (error) {
        setNoticeTone("warning");
        setNotice(
          error instanceof Error ? error.message : "读取后台会话失败。"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [liveMode, refreshRecords]);

  if (liveMode && !loading && (!authenticated || !configured)) {
    return (
      <div className={`control-shell relative isolate overflow-hidden text-white ${frameHeight}`}>
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] items-center justify-center px-6 py-8">
          <section className="surface-panel w-full max-w-lg rounded-[8px] p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80">
              <ShieldCheck className="size-3.5 text-[#9ef3d0]" />
              Admin Moderation
            </div>
            <h1 className="mt-4 text-[30px] font-semibold tracking-tight text-white">
              审核台登录
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/68">
              共享密码登录。登录后可审核、隐藏、置顶、删除，并导出全部愿景。
            </p>

            {!configured ? (
              <div className="mt-6 rounded-[8px] border border-[#f5d28a]/[0.25] bg-[#f5d28a]/[0.10] px-4 py-4 text-sm leading-6 text-[#fff4d6]">
                未配置 `ADMIN_PASSWORD`。先把管理员密码写入环境变量，再刷新页面。
              </div>
            ) : (
              <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleLogin();
                }}
              >
                <label className="block">
                  <div className="mb-2 text-sm text-white/78">后台密码</div>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 w-full rounded-[8px] border border-white/12 bg-white/6 pl-11 pr-4 text-sm text-white placeholder:text-white/35"
                      placeholder="输入共享管理员密码"
                    />
                  </div>
                </label>

                {notice ? (
                  <div className={`rounded-[8px] border px-4 py-3 text-sm ${noticeClass}`}>
                    {notice}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(90deg,rgba(120,241,212,0.95),rgba(247,210,138,0.92))] px-5 text-sm font-semibold text-[#08121f] shadow-[0_12px_30px_rgba(121,219,205,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  {loading ? "登录中..." : "进入审核台"}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={`control-shell relative isolate overflow-hidden text-white ${frameHeight}`}>
      <div
        className={`relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col ${compact ? "px-5 py-5" : "px-6 py-8"}`}
      >
        <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80">
              <ShieldCheck className="size-3.5 text-[#9ef3d0]" />
              Admin Moderation
            </div>
            <h1 className="mt-4 text-[32px] font-semibold tracking-tight text-white">
              审核台
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/68">
              共享密码登录，2~3 位管理员同时 backup。点击即可通过、驳回、隐藏、置顶。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <SummaryCard label="提交总数" value={summary.submitted} />
            <SummaryCard label="待审核" value={summary.pending} />
            <SummaryCard label="已上墙" value={summary.approved} />
            <SummaryCard label="置顶中" value={summary.pinned} />
          </div>
        </header>

        <div className="grid flex-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="surface-panel rounded-[8px] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/48">
                  登录方式
                </p>
                <p className="mt-1 text-sm text-white/72">共享密码，优先快交付</p>
              </div>
              <div className="rounded-[8px] border border-[#95f0c8]/[0.20] bg-[#95f0c8]/[0.10] px-3 py-2 text-xs text-[#e8fff5]">
                已登录
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/48">筛选</p>
              <div className="grid gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFilter(option.key)}
                    className={`flex h-10 items-center justify-between rounded-[8px] border px-3 text-sm transition ${
                      filter === option.key
                        ? "border-[#95f0c8]/[0.25] bg-[#95f0c8]/[0.12] text-[#ecfff6]"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/8"
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="text-xs text-white/48">
                      {option.key === "all" ? summary.submitted : summary[option.key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4 text-sm text-white/66">
              <div className="flex items-center justify-between py-2">
                <span>敏感词标记</span>
                <span>{records.filter((record) => record.sensitiveHit).length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>设备数</span>
                <span>{devicesCount}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>导出格式</span>
                <span>CSV</span>
              </div>
              {liveMode ? (
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-[8px] border border-white/12 bg-white/6 px-3 text-xs text-white/78 transition hover:bg-white/10"
                >
                  <LogOut className="size-4" />
                  退出后台
                </button>
              ) : null}
            </div>
          </aside>

          <section className="surface-panel rounded-[8px]">
            <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/38" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-11 w-full rounded-[8px] border border-white/12 bg-white/6 pl-11 pr-4 text-sm text-white placeholder:text-white/35"
                  placeholder="搜索昵称、愿景、标签"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExport()}
                  className={actionButtonClass}
                  disabled={!records.length}
                >
                  <Download className="size-4" />
                  导出全部
                </button>
                <button
                  type="button"
                  onClick={() => void refreshRecords()}
                  className={actionButtonClass}
                  disabled={!liveMode || loading}
                >
                  {loading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  刷新数据
                </button>
              </div>
            </div>

            {notice ? (
              <div className={`mx-5 mt-5 rounded-[8px] border px-4 py-3 text-sm ${noticeClass}`}>
                {notice}
              </div>
            ) : null}

            <div className={compact ? "max-h-[690px] overflow-hidden" : ""}>
              {visibleRecords.map((record) => (
                <article
                  key={record.id}
                  className="grid gap-4 border-b border-white/8 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-medium text-white">
                        {record.displayName}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] ${toneMap[record.hue]}`}
                      >
                        {record.track}
                      </span>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/62">
                        {statusCopy[record.status]}
                      </span>
                      {record.pinned ? (
                        <span className="rounded-full border border-[#f5d28a]/[0.20] bg-[#f5d28a]/[0.10] px-2 py-1 text-[11px] text-[#fff4d6]">
                          置顶
                        </span>
                      ) : null}
                      {record.sensitiveHit ? (
                        <span className="rounded-full border border-[#f5b1c3]/[0.20] bg-[#f5b1c3]/[0.10] px-2 py-1 text-[11px] text-[#ffe9f0]">
                          敏感词命中
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">
                      {record.wishText}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-start justify-end gap-2">
                    <AdminActionButton
                      label="通过"
                      icon={<ShieldCheck className="size-4" />}
                      busy={busyRecordId === record.id}
                      onClick={() => handleAction(record.id, { status: "approved" })}
                    />
                    <AdminActionButton
                      label="驳回"
                      icon={<X className="size-4" />}
                      busy={busyRecordId === record.id}
                      onClick={() => handleAction(record.id, { status: "rejected" })}
                    />
                    <AdminActionButton
                      label={record.status === "hidden" ? "恢复" : "隐藏"}
                      icon={<EyeOff className="size-4" />}
                      busy={busyRecordId === record.id}
                      onClick={() =>
                        handleAction(record.id, {
                          status: record.status === "hidden" ? "approved" : "hidden",
                        })
                      }
                    />
                    <AdminActionButton
                      label={record.pinned ? "取消置顶" : "置顶"}
                      icon={<Pin className="size-4" />}
                      busy={busyRecordId === record.id}
                      onClick={() => handleAction(record.id, { pinned: !record.pinned })}
                    />
                    <AdminActionButton
                      label="删除"
                      icon={<Trash2 className="size-4" />}
                      busy={busyRecordId === record.id}
                      onClick={() => handleDelete(record.id)}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  async function handleLogin() {
    setLoading(true);
    setNotice("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "登录失败。");
      }

      setAuthenticated(true);
      setNoticeTone("success");
      setNotice(payload.message || "登录成功。");
      setPassword("");
      await refreshRecords();
    } catch (error) {
      setNoticeTone("warning");
      setNotice(error instanceof Error ? error.message : "登录失败。");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/session", {
      method: "DELETE",
    });
    setAuthenticated(false);
    setNoticeTone("info");
    setNotice("");
  }

  async function handleAction(
    recordId: string,
    payload: {
      status?: WishStatus;
      pinned?: boolean;
    }
  ) {
    if (!liveMode) {
      setRecords((current) =>
        current.map((record) =>
          record.id === recordId ? { ...record, ...payload } : record
        )
      );
      return;
    }

    setBusyRecordId(recordId);

    try {
      const response = await fetch(`/api/admin/wishes/${recordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          approvedBy: "现场管理员",
        }),
      });
      const body = (await response.json()) as {
        message?: string;
      };

      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!response.ok) {
        throw new Error(body.message || "操作失败。");
      }

      setNoticeTone("success");
      setNotice("操作已同步到飞书 Base。");
      await refreshRecords();
    } catch (error) {
      setNoticeTone("warning");
      setNotice(error instanceof Error ? error.message : "操作失败。");
    } finally {
      setBusyRecordId("");
    }
  }

  async function handleDelete(recordId: string) {
    if (!liveMode) {
      setRecords((current) => current.filter((record) => record.id !== recordId));
      return;
    }

    setBusyRecordId(recordId);

    try {
      const response = await fetch(`/api/admin/wishes/${recordId}`, {
        method: "DELETE",
      });
      const body = (await response.json()) as {
        message?: string;
      };

      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!response.ok) {
        throw new Error(body.message || "删除失败。");
      }

      setNoticeTone("success");
      setNotice("记录已删除。");
      await refreshRecords();
    } catch (error) {
      setNoticeTone("warning");
      setNotice(error instanceof Error ? error.message : "删除失败。");
    } finally {
      setBusyRecordId("");
    }
  }

  function handleExport() {
    const csv = buildWishCsv(records);
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "toastmasters-wishes.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/6 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.24em] text-white/50">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function AdminActionButton({
  label,
  icon,
  busy,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} disabled={busy} className={actionButtonClass}>
      {busy ? <LoaderCircle className="size-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}

function countDevices(records: WishRecord[]) {
  return new Set(
    records.map((record) => record.deviceId).filter(Boolean)
  ).size;
}
