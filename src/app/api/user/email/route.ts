import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const accountId = await getAccountIdFromRequest(request);
    if (!accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail, password } = body as {
      newEmail?: string;
      password?: string;
    };

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: "New email and password are required" },
        { status: 400 },
      );
    }

    // Get current account with password
    const account = await prisma.web_accounts.findUnique({
      where: { id: accountId },
      select: { password: true },
    });

    if (!account?.password) {
      return NextResponse.json(
        { error: "Password not set for account" },
        { status: 400 },
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, account.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 },
      );
    }

    // Check if new email is already taken
    const existingAccount = await prisma.web_accounts.findUnique({
      where: { email: newEmail },
    });

    if (existingAccount && existingAccount.id !== accountId) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // Update email
    await prisma.web_accounts.update({
      where: { id: accountId },
      data: { email: newEmail, email_verified: false },
    });

    return NextResponse.json(
      { message: "Email updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
