import {
  buildPrimaryTitle,
  computeWishSummary,
  decorateWishRecord,
  deriveDisplayName,
  MAX_DEVICE_SUBMITS,
  normalizeStatus,
  sortAdminRecords,
  sortScreenRecords,
  type WishRecord,
  type WishStatus,
} from "@/lib/wish-wall";
import { assertFeishuBaseConfigured, getFeishuRuntimeConfig, getSensitiveWords } from "@/lib/feishu-config";

type FeishuRecordEnvelope = {
  record_id?: string;
  recordId?: string;
  fields?: Record<string, unknown>;
  created_time?: string;
  updated_time?: string;
};

type FeishuMatrixPayload = {
  data?: unknown[][];
  fields?: string[];
  field_id_list?: string[];
  record_id_list?: string[];
};

type CreateWishInput = {
  nickname: string;
  wishText: string;
  anonymous: boolean;
  deviceId: string;
};

type UpdateWishInput = {
  status?: WishStatus;
  pinned?: boolean;
  approvedBy?: string;
};

let tenantTokenCache:
  | {
      token: string;
      expiresAt: number;
    }
  | undefined;

export async function listWishRecords() {
  const { baseToken, tableId } = assertFeishuBaseConfigured();
  const data = await feishuRequest<
    {
      records?: FeishuRecordEnvelope[];
      items?: FeishuRecordEnvelope[];
    } & FeishuMatrixPayload
  >({
    method: "GET",
    path: `/open-apis/base/v3/bases/${baseToken}/tables/${tableId}/records`,
    params: {
      offset: 0,
      limit: 200,
    },
  });

  return sortAdminRecords(mapFeishuRecords(data));
}

export async function createWishRecord(input: CreateWishInput) {
  const { baseToken, tableId } = assertFeishuBaseConfigured();
  const displayName = deriveDisplayName(input.nickname, input.anonymous);
  const sensitiveHit = containsSensitiveWord(input.wishText);
  const payload = {
    标题: buildPrimaryTitle(displayName, input.wishText),
    昵称: input.nickname.trim(),
    展示名: displayName,
    愿景: input.wishText.trim(),
    匿名: input.anonymous,
    状态: "pending",
    置顶: false,
    敏感词命中: sensitiveHit,
    设备ID: input.deviceId,
  };
  const data = await feishuRequest<
    {
      record?: FeishuRecordEnvelope;
    } & FeishuMatrixPayload
  >({
    method: "POST",
    path: `/open-apis/base/v3/bases/${baseToken}/tables/${tableId}/records`,
    body: payload,
  });
  const [createdRecord] = mapFeishuRecords(data);

  return (
    createdRecord ??
    mapFeishuRecord({
      fields: payload,
    })
  );
}

export async function updateWishRecord(recordId: string, input: UpdateWishInput) {
  const { baseToken, tableId } = assertFeishuBaseConfigured();
  const body: Record<string, unknown> = {};

  if (input.status) {
    body["状态"] = input.status;
    body["审核时间"] = formatFeishuDatetime(new Date());
    body["审核人"] = input.approvedBy ?? "现场管理员";
  }

  if (typeof input.pinned === "boolean") {
    body["置顶"] = input.pinned;
  }

  await feishuRequest<{
    record?: FeishuRecordEnvelope;
  }>({
    method: "PATCH",
    path: `/open-apis/base/v3/bases/${baseToken}/tables/${tableId}/records/${recordId}`,
    body,
  });

  const records = await listWishRecords();

  return (
    records.find((record) => record.id === recordId) ??
    mapFeishuRecord({ record_id: recordId, fields: body })
  );
}

export async function deleteWishRecord(recordId: string) {
  const { baseToken, tableId } = assertFeishuBaseConfigured();

  await feishuRequest({
    method: "DELETE",
    path: `/open-apis/base/v3/bases/${baseToken}/tables/${tableId}/records/${recordId}`,
  });
}

export async function getSubmitMeta(deviceId?: string) {
  const records = await listWishRecords();
  const summary = computeWishSummary(records);
  const usedCount = deviceId
    ? records.filter((record) => record.deviceId === deviceId).length
    : 0;

  return {
    configured: true,
    usedCount,
    maxDeviceSubmits: MAX_DEVICE_SUBMITS,
    summary,
  };
}

export async function listScreenRecords(limit = 8) {
  const records = await listWishRecords();
  const screenRecords = sortScreenRecords(records).slice(0, limit);

  return {
    records: screenRecords,
    summary: computeWishSummary(records),
  };
}

export function filterAdminRecords(
  records: WishRecord[],
  status: WishStatus | "all" = "all",
  query = ""
) {
  const lowered = query.trim().toLowerCase();

  return records.filter((record) => {
    const statusOk = status === "all" ? true : record.status === status;

    if (!statusOk) {
      return false;
    }

    if (!lowered) {
      return true;
    }

    return [record.nickname, record.displayName, record.wishText, record.track]
      .join(" ")
      .toLowerCase()
      .includes(lowered);
  });
}

async function feishuRequest<T = Record<string, unknown>>({
  method,
  path,
  params,
  body,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  params?: Record<string, string | number | boolean>;
  body?: Record<string, unknown>;
}) {
  const tenantToken = await getTenantAccessToken();
  const url = new URL(path, "https://open.feishu.cn");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${tenantToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await response.json()) as {
    code?: number;
    msg?: string;
    message?: string;
    data?: T;
    error?: {
      permission_violations?: Array<{
        subject?: string;
      }>;
    };
  };

  if (!response.ok || payload.code !== 0) {
    const permissionHint = payload.error?.permission_violations
      ?.map((item) => item.subject)
      .filter(Boolean)
      .join(", ");
    const message = payload.msg || payload.message || "Feishu API 调用失败";

    throw new Error(
      permissionHint ? `${message}（缺少权限：${permissionHint}）` : message
    );
  }

  return payload.data ?? ({} as T);
}

async function getTenantAccessToken() {
  if (tenantTokenCache && tenantTokenCache.expiresAt > Date.now() + 30_000) {
    return tenantTokenCache.token;
  }

  const { appId, appSecret } = getFeishuRuntimeConfig();

  if (!appId || !appSecret) {
    throw new Error(
      "缺少飞书应用凭据。请配置 FEISHU_APP_ID / FEISHU_APP_SECRET。若本机已装 lark-cli，可自动读取 appId，但 appSecret 仍建议显式写入环境变量。"
    );
  }

  const response = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
      }),
    }
  );
  const payload = (await response.json()) as {
    code?: number;
    msg?: string;
    tenant_access_token?: string;
    expire?: number;
  };

  if (!response.ok || payload.code !== 0 || !payload.tenant_access_token) {
    throw new Error(payload.msg || "获取飞书 tenant_access_token 失败");
  }

  tenantTokenCache = {
    token: payload.tenant_access_token,
    expiresAt: Date.now() + (payload.expire ?? 7200) * 1000,
  };

  return tenantTokenCache.token;
}

function mapFeishuRecord(record: FeishuRecordEnvelope): WishRecord {
  const fields = record.fields ?? {};
  const nickname = toStringValue(fields["昵称"]);
  const anonymous = toBooleanValue(fields["匿名"]);
  const displayName =
    toStringValue(fields["展示名"]) || deriveDisplayName(nickname, anonymous);
  const wishText = toStringValue(fields["愿景"]);
  const status = normalizeStatus(fields["状态"]);

  return decorateWishRecord({
    id: record.record_id ?? record.recordId ?? crypto.randomUUID(),
    nickname,
    displayName,
    wishText,
    status,
    pinned: toBooleanValue(fields["置顶"]),
    sensitiveHit: toBooleanValue(fields["敏感词命中"]),
    anonymous,
    deviceId: toStringValue(fields["设备ID"]),
    createdAt:
      toStringValue(fields["提交时间"]) || record.created_time || undefined,
    approvedAt: toStringValue(fields["审核时间"]) || undefined,
    approvedBy: toStringValue(fields["审核人"]) || undefined,
  });
}

function mapFeishuRecords(
  payload:
    | ({
        records?: FeishuRecordEnvelope[];
        items?: FeishuRecordEnvelope[];
      } & FeishuMatrixPayload)
    | FeishuMatrixPayload
) {
  const records =
    ("records" in payload ? payload.records : undefined) ??
    ("items" in payload ? payload.items : undefined);

  if (Array.isArray(records) && records.length > 0) {
    return records.map((record) => mapFeishuRecord(record));
  }

  const fieldNames = Array.isArray(payload.fields) ? payload.fields : [];
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const recordIds = Array.isArray(payload.record_id_list)
    ? payload.record_id_list
    : [];

  return rows.map((row, index) => {
    const fields = fieldNames.reduce<Record<string, unknown>>((accumulator, name, fieldIndex) => {
      accumulator[name] = row[fieldIndex];
      return accumulator;
    }, {});

    return mapFeishuRecord({
      record_id: recordIds[index],
      fields,
    });
  });
}

function containsSensitiveWord(text: string) {
  const lowered = text.toLowerCase();

  return getSensitiveWords().some((word) =>
    lowered.includes(word.toLowerCase())
  );
}

function formatFeishuDatetime(date: Date) {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart(
    "hour"
  )}:${getPart("minute")}:${getPart("second")}`;
}

function toStringValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => toStringValue(item)).filter(Boolean).join(", ");
  }

  return "";
}

function toBooleanValue(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true";
  }

  return false;
}
