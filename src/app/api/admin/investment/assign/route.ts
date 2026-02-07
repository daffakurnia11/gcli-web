import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AssignBody = {
  bankAccountId?: string;
  gangCode?: string;
};

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.optin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as AssignBody;
    const bankAccountId = body.bankAccountId?.trim();
    const gangCode = body.gangCode?.trim();
    const isUnassign = gangCode === "none";

    if (!bankAccountId || !gangCode) {
      return NextResponse.json(
        { error: "bankAccountId and gangCode are required" },
        { status: 400 },
      );
    }

    if (!isUnassign) {
      const gang = await prisma.tl_gangs.findUnique({
        where: { name: gangCode },
        select: { name: true },
      });

      if (!gang) {
        return NextResponse.json({ error: "Invalid gang code" }, { status: 400 });
      }
    }

    const account = await prisma.bank_accounts_new.findUnique({
      where: { id: bankAccountId },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (isUnassign) {
        await tx.bank_accounts_new.update({
          where: { id: bankAccountId },
          data: {
            creator: null,
          },
        });
      } else {
        await tx.bank_accounts_new.update({
          where: { id: bankAccountId },
          data: {
            creator: gangCode,
            amount: 0,
            transactions: "[]",
          },
        });
      }

      const affectedRows = await tx.$executeRaw(
        Prisma.sql`
          UPDATE tl_businesses
          SET owner = ${isUnassign ? null : gangCode},
              is_owned = ${isUnassign ? 0 : 1},
              updated_at = CURRENT_TIMESTAMP
          WHERE bank_account_id = ${bankAccountId}
        `,
      );

      if (Number(affectedRows) < 1) {
        throw new Error("Business metadata not found for bank account");
      }
    });

    return NextResponse.json(
      {
        message: isUnassign
          ? "Business unassigned successfully"
          : "Business assigned successfully",
        bankAccountId,
        gangCode: isUnassign ? null : gangCode,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin investment assign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
