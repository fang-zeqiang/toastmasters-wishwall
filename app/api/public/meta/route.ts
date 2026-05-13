import { NextRequest, NextResponse } from "next/server";

import { getSubmitMeta } from "@/lib/feishu-base";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId") ?? undefined;
    const data = await getSubmitMeta(deviceId);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        configured: false,
        message: error instanceof Error ? error.message : "读取提交信息失败",
      },
      {
        status: 503,
      }
    );
  }
}
