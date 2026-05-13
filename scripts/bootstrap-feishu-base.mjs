import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE_NAME = process.env.FEISHU_BASE_NAME || "Toastmasters 三周年电子许愿墙";
const TABLE_NAME = process.env.FEISHU_TABLE_NAME || "wishes";

const fieldDefinitions = [
  { name: "昵称", type: "text", style: { type: "plain" } },
  { name: "展示名", type: "text", style: { type: "plain" } },
  { name: "愿景", type: "text", style: { type: "plain" } },
  { name: "匿名", type: "checkbox" },
  {
    name: "状态",
    type: "select",
    multiple: false,
    options: [
      { name: "pending", hue: "Blue", lightness: "Lighter" },
      { name: "approved", hue: "Green", lightness: "Light" },
      { name: "rejected", hue: "Orange", lightness: "Light" },
      { name: "hidden", hue: "Gray", lightness: "Light" },
    ],
  },
  { name: "置顶", type: "checkbox" },
  { name: "敏感词命中", type: "checkbox" },
  { name: "设备ID", type: "text", style: { type: "plain" } },
  { name: "审核人", type: "text", style: { type: "plain" } },
  {
    name: "审核时间",
    type: "datetime",
    style: { format: "yyyy-MM-dd HH:mm" },
  },
  {
    name: "提交时间",
    type: "created_at",
    style: { format: "yyyy-MM-dd HH:mm" },
  },
];

async function main() {
  const credentials = resolveCredentials();
  const tenantAccessToken = await getTenantAccessToken(credentials);
  const base = await createBase(tenantAccessToken, BASE_NAME);
  const baseToken = pick(base, ["app_token", "base_token", "token"]);
  const ownerOpenId = process.env.FEISHU_OWNER_OPEN_ID || "";

  if (!baseToken) {
    throw new Error("创建 Base 成功，但未拿到 base token。");
  }

  const table = await createTable(tenantAccessToken, baseToken, TABLE_NAME);
  const tableId = pick(table, ["table_id", "id"]);

  if (!tableId) {
    throw new Error("创建数据表成功，但未拿到 table id。");
  }

  const fields = await listFields(tenantAccessToken, baseToken, tableId);
  const primaryField = fields[0];

  if (primaryField) {
    await updateField(tenantAccessToken, baseToken, tableId, pick(primaryField, ["field_id", "id"]), {
      name: "标题",
      type: "text",
      style: { type: "plain" },
    });
  }

  for (const field of fieldDefinitions) {
    await createField(tenantAccessToken, baseToken, tableId, field);
  }

  let grantStatus = "skipped";

  if (ownerOpenId) {
    try {
      await grantBaseAccess(tenantAccessToken, baseToken, ownerOpenId);
      grantStatus = "granted";
    } catch (error) {
      grantStatus = `failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  const output = {
    baseName: pick(base, ["name"]) || BASE_NAME,
    baseToken,
    baseUrl: pick(base, ["url"]),
    tableId,
    tableName: pick(table, ["name"]) || TABLE_NAME,
    ownerOpenId,
    grantStatus,
  };

  console.log(JSON.stringify(output, null, 2));
  console.log("");
  console.log("写入 .env.local：");
  console.log(`FEISHU_BASE_TOKEN=${baseToken}`);
  console.log(`FEISHU_TABLE_ID=${tableId}`);
}

async function createBase(token, name) {
  const data = await feishuRequest(token, "/open-apis/base/v3/bases", {
    method: "POST",
    body: {
      name,
      time_zone: "Asia/Shanghai",
    },
  });

  return data.base || data;
}

async function createTable(token, baseToken, name) {
  const data = await feishuRequest(
    token,
    `/open-apis/base/v3/bases/${baseToken}/tables`,
    {
      method: "POST",
      body: {
        name,
      },
    }
  );

  return data.table || data;
}

async function listFields(token, baseToken, tableId) {
  const data = await feishuRequest(
    token,
    `/open-apis/base/v3/bases/${baseToken}/tables/${tableId}/fields`,
    {
      method: "GET",
      params: {
        offset: 0,
        limit: 200,
      },
    }
  );

  return data.items || data.fields || [];
}

async function updateField(token, baseToken, tableId, fieldId, body) {
  await feishuRequest(
    token,
    `/open-apis/base/v3/bases/${baseToken}/tables/${tableId}/fields/${fieldId}`,
    {
      method: "PUT",
      body,
    }
  );
}

async function createField(token, baseToken, tableId, body) {
  await feishuRequest(
    token,
    `/open-apis/base/v3/bases/${baseToken}/tables/${tableId}/fields`,
    {
      method: "POST",
      body,
    }
  );
}

async function grantBaseAccess(token, baseToken, openId) {
  await feishuRequest(
    token,
    `/open-apis/drive/v1/permissions/${baseToken}/members`,
    {
      method: "POST",
      params: {
        type: "bitable",
        need_notification: false,
      },
      body: {
        member_id: openId,
        member_type: "openid",
        perm: "full_access",
        type: "user",
      },
    }
  );
}

async function getTenantAccessToken({ appId, appSecret }) {
  const response = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
      }),
    }
  );
  const payload = await response.json();

  if (!response.ok || payload.code !== 0 || !payload.tenant_access_token) {
    throw new Error(payload.msg || "获取 tenant_access_token 失败");
  }

  return payload.tenant_access_token;
}

async function feishuRequest(token, pathName, { method, params, body }) {
  const url = new URL(pathName, "https://open.feishu.cn");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();

  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.msg || "Feishu OpenAPI 调用失败");
  }

  return payload.data || {};
}

function resolveCredentials() {
  const localConfig = readLocalConfig();
  const appId = process.env.FEISHU_APP_ID || localConfig.appId;
  const appSecret = process.env.FEISHU_APP_SECRET || localConfig.appSecret;

  if (!appId || !appSecret) {
    throw new Error(
      "缺少 FEISHU_APP_ID / FEISHU_APP_SECRET。若本机已装 lark-cli，可自动读取 appId，但 appSecret 仍需显式环境变量。"
    );
  }

  return { appId, appSecret };
}

function readLocalConfig() {
  const configPath = path.join(os.homedir(), ".lark-cli", "config.json");

  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const firstApp = Array.isArray(parsed.apps) ? parsed.apps[0] : {};

    return {
      appId:
        typeof parsed.appId === "string"
          ? parsed.appId
          : typeof firstApp.appId === "string"
            ? firstApp.appId
            : "",
      appSecret:
        typeof parsed.appSecret === "string"
          ? parsed.appSecret
          : typeof firstApp.appSecret === "string"
            ? firstApp.appSecret
            : "",
    };
  } catch {
    return {};
  }
}

function pick(source, keys) {
  if (!source || typeof source !== "object") {
    return "";
  }

  for (const key of keys) {
    if (source[key]) {
      return source[key];
    }
  }

  return "";
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
