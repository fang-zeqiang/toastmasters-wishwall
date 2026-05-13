export const MIN_WISH_LENGTH = 30;
export const MAX_WISH_LENGTH = 50;
export const MAX_NICKNAME_LENGTH = 12;
export const MAX_DEVICE_SUBMITS = 10;

export type WishStatus = "pending" | "approved" | "rejected" | "hidden";

export type WishHue = "aurora" | "sky" | "gold" | "rose";

export type WishRecord = {
  id: string;
  nickname: string;
  displayName: string;
  wishText: string;
  track: string;
  status: WishStatus;
  pinned: boolean;
  sensitiveHit: boolean;
  anonymous: boolean;
  hue: WishHue;
  deviceId?: string;
  createdAt?: string;
  approvedAt?: string;
  approvedBy?: string;
};

export type WishSummary = {
  submitted: number;
  approved: number;
  pending: number;
  rejected: number;
  hidden: number;
  pinned: number;
  devices: number;
};

const TRACKS = [
  "年度愿景",
  "演讲成长",
  "会议主持",
  "生活平衡",
  "社群连接",
  "内容沉淀",
  "身体与舞台",
  "反馈能力",
  "即兴表达",
  "双语主持",
  "关系与疗愈",
  "俱乐部记忆",
] as const;

const HUES: WishHue[] = ["aurora", "sky", "gold", "rose"];

export const countText = (value: string) => Array.from(value.trim()).length;

export function normalizeStatus(value: unknown): WishStatus {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (
    normalized === "pending" ||
    normalized === "approved" ||
    normalized === "rejected" ||
    normalized === "hidden"
  ) {
    return normalized;
  }

  return "pending";
}

export function deriveDisplayName(nickname: string, anonymous: boolean) {
  return anonymous ? "匿名朋友" : nickname.trim();
}

export function buildPrimaryTitle(displayName: string, wishText: string) {
  const excerpt = Array.from(wishText.trim()).slice(0, 14).join("");
  return `${displayName} · ${excerpt || "新年愿景"}`;
}

export function decorateWishRecord(
  partial: Omit<WishRecord, "track" | "hue"> & Partial<Pick<WishRecord, "track" | "hue">>
): WishRecord {
  const seed = `${partial.id}:${partial.displayName}:${partial.wishText}`;

  return {
    ...partial,
    track: partial.track ?? deriveTrack(seed),
    hue: partial.hue ?? deriveHue(seed),
  };
}

export function deriveHue(seed: string): WishHue {
  return HUES[hashSeed(seed) % HUES.length];
}

export function deriveTrack(seed: string) {
  return TRACKS[hashSeed(seed) % TRACKS.length];
}

export function computeWishSummary(records: WishRecord[]): WishSummary {
  const devices = new Set<string>();

  return records.reduce<WishSummary>(
    (accumulator, record) => {
      accumulator.submitted += 1;
      accumulator[record.status] += 1;

      if (record.pinned) {
        accumulator.pinned += 1;
      }

      if (record.deviceId) {
        devices.add(record.deviceId);
        accumulator.devices = devices.size;
      }

      return accumulator;
    },
    {
      submitted: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      hidden: 0,
      pinned: 0,
      devices: 0,
    }
  );
}

export function sortAdminRecords(records: WishRecord[]) {
  return [...records].sort((left, right) => {
    if (left.status === "pending" && right.status !== "pending") {
      return -1;
    }

    if (left.status !== "pending" && right.status === "pending") {
      return 1;
    }

    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }

    return compareDates(right.createdAt, left.createdAt) || right.id.localeCompare(left.id);
  });
}

export function sortScreenRecords(records: WishRecord[]) {
  return [...records]
    .filter((record) => record.status === "approved")
    .sort((left, right) => {
      if (left.pinned !== right.pinned) {
        return left.pinned ? -1 : 1;
      }

      return compareDates(right.approvedAt ?? right.createdAt, left.approvedAt ?? left.createdAt);
    });
}

export function buildWishCsv(records: WishRecord[]) {
  const escapeCell = (value: unknown) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;

  const rows = [
    [
      "记录ID",
      "昵称",
      "展示名",
      "愿景",
      "状态",
      "置顶",
      "匿名",
      "敏感词命中",
      "设备ID",
      "提交时间",
      "审核时间",
      "审核人",
    ],
    ...records.map((record) => [
      record.id,
      record.nickname,
      record.displayName,
      record.wishText,
      record.status,
      record.pinned ? "是" : "否",
      record.anonymous ? "是" : "否",
      record.sensitiveHit ? "是" : "否",
      record.deviceId ?? "",
      record.createdAt ?? "",
      record.approvedAt ?? "",
      record.approvedBy ?? "",
    ]),
  ];

  return `\ufeff${rows
    .map((row) => row.map((cell) => escapeCell(cell)).join(","))
    .join("\n")}`;
}

export function buildClientDeviceId() {
  return `wishwall-${crypto.randomUUID()}`;
}

function hashSeed(input: string) {
  let hash = 0;

  for (const character of input) {
    hash = (hash * 33 + character.charCodeAt(0)) % 2147483647;
  }

  return Math.abs(hash);
}

function compareDates(left?: string, right?: string) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return -1;
  }

  if (!right) {
    return 1;
  }

  const leftTime = Date.parse(left.replace(" ", "T"));
  const rightTime = Date.parse(right.replace(" ", "T"));

  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    return left.localeCompare(right);
  }

  return leftTime - rightTime;
}
