import { NextRequest, NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-session";
import { filterAdminRecords, listWishRecords } from "@/lib/feishu-base";
import { computeWishSummary, normalizeStatus, type WishStatus } from "@/lib/wish-wall";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json(
      {
        message: "未登录后台。",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const statusParam = request.nextUrl.searchParams.get("status") ?? "all";
    const query = request.nextUrl.searchParams.get("query") ?? "";
    const status =
      statusParam === "all"
        ? "all"
        : (normalizeStatus(statusParam) as WishStatus);
    const records = await listWishRecords();
    const filtered = filterAdminRecords(records, status, query);

    return NextResponse.json({
      records: filtered,
      allRecords: records,
      summary: computeWishSummary(records),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "读取审核数据失败",
      },
      {
        status: 503,
      }
    );
  }
}
