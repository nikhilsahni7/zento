import { prisma } from "@/lib/prisma";

export async function getTasteProfile(userId: string) {
  return prisma.tasteProfile.findUnique({ where: { userId } });
}

export async function saveTasteProfile(
  userId: string,
  affinityTags: string[],
  homeCity?: string
) {
  return prisma.tasteProfile.upsert({
    where: { userId },
    create: {
      userId,
      affinityTags,
      homeCity,
    },
    update: {
      affinityTags,
      homeCity,
    },
  });
}
