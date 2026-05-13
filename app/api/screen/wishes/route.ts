import { NextRequest, NextResponse } from "next/server";

import { listScreenRecords } from "@/lib/feishu-base";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "8");
    const data = await listScreenRecords(Number.isFinite(limit) ? limit : 8);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "读取大屏数据失败",
      },
      {
        status: 503,
      }
    );
  }
}
