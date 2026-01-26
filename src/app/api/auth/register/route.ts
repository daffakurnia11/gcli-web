import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

// Request body schema
const registerSchema = z.object({
  accountInfo: z.object({
    name: z.string().min(1),
    username: z.string().min(1),
    gender: z.enum(["male", "female"]),
    birthDate: z.string().min(1),
    province: z.object({
      id: z.number(),
      name: z.string(),
    }),
    city: z.object({
      id: z.number(),
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

    // Hash password
    const passwordHash = await bcrypt.hash(
      validatedData.credentials.password,
      10,
    );

    const birthDate = new Date(validatedData.accountInfo.birthDate);

    // Create web account with profile and link to FiveM users table if exists
    const profileData = {
      real_name: validatedData.accountInfo.name,
      fivem_name: validatedData.accountInfo.username,
      gender: validatedData.accountInfo.gender,
      birth_date: birthDate,
      province_id: String(validatedData.accountInfo.province.id),
      province_name: validatedData.accountInfo.province.name,
      city_id: String(validatedData.accountInfo.city.id),
      city_name: validatedData.accountInfo.city.name,
    };

    const account = existingDiscordAccount
      ? await prisma.web_accounts.update({
          where: { id: existingDiscordAccount.id },
          data: {
            email: validatedData.credentials.email,
            password: passwordHash,
            email_verified: false,
            discord: validatedData.socialConnections.discord.connected
              ? {
                  upsert: {
                    create: {
                      discord_id: validatedData.socialConnections.discord.id,
                      username:
                        validatedData.socialConnections.discord.username,
                      global_name:
                        validatedData.socialConnections.discord.name ?? null,
                      email:
                        validatedData.socialConnections.discord.email ?? null,
                      image:
                        validatedData.socialConnections.discord.image ?? null,
                    },
                    update: {
                      username:
                        validatedData.socialConnections.discord.username,
                      global_name:
                        validatedData.socialConnections.discord.name ?? null,
                      email:
                        validatedData.socialConnections.discord.email ?? null,
                      image:
                        validatedData.socialConnections.discord.image ?? null,
                    },
                  },
                }
              : undefined,
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
            discord: validatedData.socialConnections.discord.connected
              ? {
                  create: {
                    discord_id: validatedData.socialConnections.discord.id,
                    username: validatedData.socialConnections.discord.username,
                    global_name:
                      validatedData.socialConnections.discord.name ?? null,
                    email:
                      validatedData.socialConnections.discord.email ?? null,
                    image:
                      validatedData.socialConnections.discord.image ?? null,
                  },
                }
              : undefined,
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
      } else {
        // Create new FiveM user entry
        const newUser = await prisma.users.create({
          data: {
            username: validatedData.accountInfo.username,
            discord: validatedData.socialConnections.discord.id,
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
