import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

// Request body schema
const registerSchema = z.object({
  accountInfo: z.object({
    realName: z.string().min(1),
    fivemName: z.string().min(1),
    age: z.string().min(1),
    birthDate: z.string().min(1),
    province: z.object({
      id: z.string(),
      name: z.string(),
    }),
    city: z.object({
      id: z.string(),
      name: z.string(),
    }),
  }),
  credentials: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  socialConnections: z.object({
    discord: z.object({
      id: z.string(),
      username: z.string(),
      name: z.string().nullable().optional(),
      email: z.string().email().nullable().optional(),
      image: z.string().nullable().optional(),
      connected: z.boolean(),
    }),
    steam: z.object({
      id: z.string().nullable().optional(),
      steamHex: z.string(),
      username: z.string().nullable().optional(),
      image: z.string().nullable().optional(),
      connected: z.boolean(),
    }),
  }),
});

export type RegisterRequest = z.infer<typeof registerSchema>;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = registerSchema.parse(body);

    // Check if email already exists
    const existingAccount = await prisma.web_accounts.findUnique({
      where: { email: validatedData.credentials.email },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    // Check if Discord ID already exists (allow placeholder accounts to be completed)
    let existingDiscordAccount: {
      id: number;
      password: string | null;
      profile: { id: number } | null;
    } | null = null;
    if (validatedData.socialConnections.discord.connected) {
      existingDiscordAccount = await prisma.web_accounts.findUnique({
        where: { discord_id: validatedData.socialConnections.discord.id },
        select: { id: true, password: true, profile: { select: { id: true } } },
      });

      if (
        existingDiscordAccount &&
        (existingDiscordAccount.password || existingDiscordAccount.profile)
      ) {
        return NextResponse.json(
          { error: "Discord account already linked to another user" },
          { status: 400 },
        );
      }
    }

    // Check if Steam hex already exists
    if (validatedData.socialConnections.steam.connected) {
      const existingSteam = await prisma.web_accounts.findUnique({
        where: { steam_hex: validatedData.socialConnections.steam.steamHex },
      });

      if (existingSteam) {
        return NextResponse.json(
          { error: "Steam account already linked to another user" },
          { status: 400 },
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(
      validatedData.credentials.password,
      10,
    );

    // Calculate age from birth date
    const birthDate = new Date(validatedData.accountInfo.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Create web account with profile and link to FiveM users table if exists
    const profileData = {
      real_name: validatedData.accountInfo.realName,
      fivem_name: validatedData.accountInfo.fivemName,
      age,
      birth_date: birthDate,
      province_id: validatedData.accountInfo.province.id,
      province_name: validatedData.accountInfo.province.name,
      city_id: validatedData.accountInfo.city.id,
      city_name: validatedData.accountInfo.city.name,
    };

    const account = existingDiscordAccount
      ? await prisma.web_accounts.update({
          where: { id: existingDiscordAccount.id },
          data: {
            email: validatedData.credentials.email,
            password: passwordHash,
            email_verified: false,
            steam_hex: validatedData.socialConnections.steam.connected
              ? validatedData.socialConnections.steam.steamHex
              : null,
            profile: {
              upsert: {
                create: profileData,
                update: profileData,
              },
            },
          },
          include: {
            profile: true,
            user: true,
          },
        })
      : await prisma.web_accounts.create({
          data: {
            email: validatedData.credentials.email,
            password: passwordHash,
            email_verified: false,
            discord_id: validatedData.socialConnections.discord.connected
              ? validatedData.socialConnections.discord.id
              : null,
            steam_hex: validatedData.socialConnections.steam.connected
              ? validatedData.socialConnections.steam.steamHex
              : null,
            profile: {
              create: profileData,
            },
          },
          include: {
            profile: true,
            user: true,
          },
        });

    // Check if FiveM user exists with Discord ID and link it
    if (validatedData.socialConnections.discord.connected) {
      const existingUser = await prisma.users.findFirst({
        where: { discord: validatedData.socialConnections.discord.id },
      });

      if (existingUser) {
        // Link the web account to the existing FiveM user
        await prisma.web_accounts.update({
          where: { id: account.id },
          data: {
            user_id: existingUser.userId,
            fivem_id: existingUser.fivem ?? undefined,
          },
        });

        // Update FiveM user with steam hex if provided and not already set
        if (
          validatedData.socialConnections.steam.connected &&
          validatedData.socialConnections.steam.steamHex &&
          !existingUser.steam
        ) {
          await prisma.users.update({
            where: { userId: existingUser.userId },
            data: { steam: validatedData.socialConnections.steam.steamHex },
          });
        }
      } else {
        // Create new FiveM user entry
        const newUser = await prisma.users.create({
          data: {
            username: validatedData.accountInfo.fivemName,
            discord: validatedData.socialConnections.discord.id,
            steam: validatedData.socialConnections.steam.connected
              ? validatedData.socialConnections.steam.steamHex
              : null,
          },
        });

        // Link the web account to the new FiveM user
        await prisma.web_accounts.update({
          where: { id: account.id },
          data: { user_id: newUser.userId },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account registered successfully",
        accountId: account.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
