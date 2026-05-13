import { NextRequest, NextResponse } from "next/server";

import { createWishRecord, getSubmitMeta } from "@/lib/feishu-base";
import {
  countText,
  MAX_DEVICE_SUBMITS,
  MAX_NICKNAME_LENGTH,
  MAX_WISH_LENGTH,
  MIN_WISH_LENGTH,
} from "@/lib/wish-wall";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      nickname?: string;
      wishText?: string;
      anonymous?: boolean;
      deviceId?: string;
    };
    const nickname = body.nickname?.trim() ?? "";
    const wishText = body.wishText?.trim() ?? "";
    const anonymous = Boolean(body.anonymous);
    const deviceId = body.deviceId?.trim() ?? "";
    const nicknameCount = countText(nickname);
    const wishCount = countText(wishText);

    if (!deviceId) {
      return NextResponse.json(
        {
          message: "缺少设备标识，请刷新页面后重试。",
        },
        {
          status: 400,
        }
      );
    }

    if (!nicknameCount || nicknameCount > MAX_NICKNAME_LENGTH) {
      return NextResponse.json(
        {
          message: "昵称必填，且不能超过 12 字。",
        },
        {
          status: 400,
        }
      );
    }

    if (wishCount < MIN_WISH_LENGTH || wishCount > MAX_WISH_LENGTH) {
      return NextResponse.json(
        {
          message: "愿景需控制在 30~50 字。",
        },
        {
          status: 400,
        }
      );
    }

    const meta = await getSubmitMeta(deviceId);

    if (meta.usedCount >= MAX_DEVICE_SUBMITS) {
      return NextResponse.json(
        {
          message: "本设备提交次数已满。",
          usedCount: meta.usedCount,
        },
        {
          status: 409,
        }
      );
    }

    const record = await createWishRecord({
      nickname,
      wishText,
      anonymous,
      deviceId,
    });

    return NextResponse.json({
      message: "已进入审核池，审核通过后将在大屏出现。",
      record,
      usedCount: meta.usedCount + 1,
      maxDeviceSubmits: MAX_DEVICE_SUBMITS,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "提交失败，请稍后再试。",
      },
      {
        status: 503,
      }
    );
  }
}
