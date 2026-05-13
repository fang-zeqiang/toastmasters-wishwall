import { NextRequest, NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-session";
import { deleteWishRecord, updateWishRecord } from "@/lib/feishu-base";
import { normalizeStatus } from "@/lib/wish-wall";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ recordId: string }> }
) {
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
    const { recordId } = await context.params;
    const body = (await request.json()) as {
      status?: string;
      pinned?: boolean;
      approvedBy?: string;
    };
    const record = await updateWishRecord(recordId, {
      status: body.status ? normalizeStatus(body.status) : undefined,
      pinned:
        typeof body.pinned === "boolean" ? body.pinned : undefined,
      approvedBy: body.approvedBy,
    });

    return NextResponse.json({
      record,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "更新记录失败",
      },
      {
        status: 503,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ recordId: string }> }
) {
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
    const { recordId } = await context.params;

    await deleteWishRecord(recordId);

    return NextResponse.json({
      deleted: true,
      recordId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "删除记录失败",
      },
      {
        status: 503,
      }
    );
  }
}
