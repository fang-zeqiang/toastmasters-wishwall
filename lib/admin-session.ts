import { createHmac, timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

import { getAdminPassword, getAdminSessionSecret } from "@/lib/feishu-config";

export const ADMIN_COOKIE_NAME = "wishwall_admin";

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

export function isAdminAuthenticated(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!cookie) {
    return false;
  }

  return safeEqual(cookie, buildAdminSessionValue());
}

export function verifyAdminPassword(password: string) {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    return false;
  }

  return safeEqual(password, configuredPassword);
}

export function buildAdminSessionValue() {
  return createHmac("sha256", getAdminSessionSecret())
    .update("wishwall-admin-session")
    .digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
