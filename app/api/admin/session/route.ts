import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  buildAdminSessionValue,
  isAdminAuthenticated,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/admin-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    configured: isAdminConfigured(),
    authenticated: isAdminAuthenticated(request),
  });
}

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        message: "未配置 ADMIN_PASSWORD，后台登录暂不可用。",
      },
      {
        status: 503,
      }
    );
  }

  const body = (await request.json()) as {
    password?: string;
  };

  if (!verifyAdminPassword(body.password ?? "")) {
    return NextResponse.json(
      {
        message: "密码不正确。",
      },
      {
        status: 401,
      }
    );
  }

  const response = NextResponse.json({
    message: "登录成功。",
    authenticated: true,
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: buildAdminSessionValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({
    authenticated: false,
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}
