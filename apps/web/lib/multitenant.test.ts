import { describe, expect, it } from "vitest";
import { prisma } from "@autochannel/db";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
} from "./auth";
import { loadDashboardData } from "./dashboard";

describe("Ko'p foydalanuvchili arxitektura va Dashboard izolyatsiyasi", () => {
  it(
    "har bir foydalanuvchi ro'yxatdan o'tganda alohida kanal va dashboard oladi",
    async () => {
    // 1. Foydalanuvchi A (Sardor)
    const emailA = `sardor_${Date.now()}@test.uz`;
    const passA = "SardorPass123!";
    const hashA = await hashPassword(passA);

    expect(await verifyPassword(passA, hashA)).toBe(true);

    const userA = await prisma.user.create({
      data: {
        name: "Sardor Alimov",
        email: emailA,
        passwordHash: hashA,
        role: "user",
        channels: {
          create: {
            name: "Sardor Avto Reels",
            platform: "instagram",
            status: "active",
          },
        },
      },
      include: { channels: true },
    });

    expect(userA.id).toBeDefined();
    expect(userA.channels.length).toBe(1);
    const channelA = userA.channels[0];

    // 2. Foydalanuvchi B (Madina)
    const emailB = `madina_${Date.now()}@test.uz`;
    const passB = "MadinaPass456!";
    const hashB = await hashPassword(passB);

    const userB = await prisma.user.create({
      data: {
        name: "Madina Karimova",
        email: emailB,
        passwordHash: hashB,
        role: "user",
        channels: {
          create: {
            name: "Madina Blog Reels",
            platform: "instagram",
            status: "setup",
          },
        },
      },
      include: { channels: true },
    });

    expect(userB.id).toBeDefined();
    expect(userB.channels.length).toBe(1);
    const channelB = userB.channels[0];

    // 3. User A kanaliga 2 ta video yaratamiz
    await prisma.video.create({
      data: {
        channelId: channelA.id,
        status: "published",
        caption: "Sardor A Reels #1",
      },
    });
    await prisma.video.create({
      data: {
        channelId: channelA.id,
        status: "ready",
        caption: "Sardor A Reels #2",
      },
    });

    // 4. User B kanaliga 1 ta video yaratamiz (ishlov berilmoqda)
    await prisma.video.create({
      data: {
        channelId: channelB.id,
        status: "script",
        caption: "Madina B Reels #1",
      },
    });

    // 5. Dashboard izolyatsiyasini tekshiramiz
    const dashA = await loadDashboardData(channelA.id);
    const dashB = await loadDashboardData(channelB.id);

    expect(dashA.ok).toBe(true);
    expect(dashB.ok).toBe(true);

    if (dashA.ok && dashB.ok) {
      // User A faqat o'zining 2 ta videosini ko'radi (1 ta published, 1 ta ready, 0 ta pending)
      expect(dashA.data.publishedVideos).toBe(1);
      expect(dashA.data.readyVideos).toBe(1);
      expect(dashA.data.pendingVideos).toBe(0);

      // User B faqat o'zining 1 ta pending videosini ko'radi (0 ta published, 0 ta ready, 1 ta pending)
      expect(dashB.data.publishedVideos).toBe(0);
      expect(dashB.data.readyVideos).toBe(0);
      expect(dashB.data.pendingVideos).toBe(1);
    }

    // 6. Sessiya tokenlarini tekshiramiz
    const tokenA = await createSessionToken({
      userId: userA.id,
      email: userA.email,
      name: userA.name,
      role: userA.role,
    });

    const sessionA = await verifySessionToken(tokenA);
    expect(sessionA).not.toBeNull();
    expect(sessionA?.userId).toBe(userA.id);
    expect(sessionA?.email).toBe(emailA);

    // Tozalash
    await prisma.video.deleteMany({
      where: { channelId: { in: [channelA.id, channelB.id] } },
    });
    await prisma.channel.deleteMany({
      where: { id: { in: [channelA.id, channelB.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } },
    });
  }, 30_000);

  it("Instagram ulanmagan kanallarni to'g'ri 'ulanmagan' deb aniqlaydi", async () => {
    const email = `test_ig_${Date.now()}@test.uz`;
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email,
        passwordHash: "hash",
        channels: {
          create: {
            name: "Test kanali",
            status: "setup",
            igUserId: null,
          },
        },
      },
      include: { channels: true },
    });

    const channel = user.channels[0];
    const isConnectedInitially = Boolean(
      channel?.igUserId && channel?.status === "active",
    );
    expect(isConnectedInitially).toBe(false);

    // Instagram ulanadi
    const updatedChannel = await prisma.channel.update({
      where: { id: channel.id },
      data: {
        handle: "test_reels",
        igUserId: "178414123456",
        status: "active",
      },
    });

    const isConnectedAfter = Boolean(
      updatedChannel.igUserId && updatedChannel.status === "active",
    );
    expect(isConnectedAfter).toBe(true);

    await prisma.channel.delete({ where: { id: channel.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }, 30_000);
});

