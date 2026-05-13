import fs from "node:fs";
import os from "node:os";
import path from "node:path";

type LocalLarkConfig = {
  appId?: string;
  appSecret?: string;
  apps?: Array<{
    appId?: string;
    appSecret?: string;
  }>;
};

export type FeishuRuntimeConfig = {
  appId: string;
  appSecret: string;
  baseToken: string;
  tableId: string;
};

let cachedLocalConfig: LocalLarkConfig | null | undefined;

export function getFeishuRuntimeConfig(): FeishuRuntimeConfig {
  const localConfig = readLocalLarkConfig();
  const appId = process.env.FEISHU_APP_ID ?? localConfig?.appId ?? "";
  const appSecret = process.env.FEISHU_APP_SECRET ?? localConfig?.appSecret ?? "";
  const baseToken = process.env.FEISHU_BASE_TOKEN ?? "";
  const tableId = process.env.FEISHU_TABLE_ID ?? "";

  return {
    appId,
    appSecret,
    baseToken,
    tableId,
  };
}

export function assertFeishuBaseConfigured() {
  const config = getFeishuRuntimeConfig();

  if (!config.appId || !config.appSecret) {
    throw new Error(
      "缺少飞书应用凭据。请配置 FEISHU_APP_ID / FEISHU_APP_SECRET。若本机已装 lark-cli，可自动读取 appId，但 appSecret 仍建议显式写入环境变量。"
    );
  }

  if (!config.baseToken || !config.tableId) {
    throw new Error(
      "缺少 FEISHU_BASE_TOKEN 或 FEISHU_TABLE_ID。先完成多维表格创建，再把 token 写入环境变量。"
    );
  }

  return config;
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "wishwall-local-session-secret";
}

export function getSensitiveWords() {
  const raw =
    process.env.SENSITIVE_WORDS ??
    "赌博,色情,暴力,辱骂,敏感政治,广告引流";

  return raw
    .split(/[\n,，]/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function readLocalLarkConfig() {
  if (cachedLocalConfig !== undefined) {
    return cachedLocalConfig;
  }

  const configPath = path.join(os.homedir(), ".lark-cli", "config.json");

  try {
    const content = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(content) as LocalLarkConfig;
    const firstApp = Array.isArray(parsed.apps) ? parsed.apps[0] : undefined;

    cachedLocalConfig = {
      appId:
        typeof parsed.appId === "string"
          ? parsed.appId
          : typeof firstApp?.appId === "string"
            ? firstApp.appId
            : "",
      appSecret:
        typeof parsed.appSecret === "string"
          ? parsed.appSecret
          : typeof firstApp?.appSecret === "string"
            ? firstApp.appSecret
            : "",
    };
  } catch {
    cachedLocalConfig = null;
  }

  return cachedLocalConfig;
}
