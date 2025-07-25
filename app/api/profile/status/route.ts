import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has a taste profile (completed onboarding)
    const tasteProfile = await prisma.tasteProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      hasProfile: !!tasteProfile,
      affinityTags: tasteProfile?.affinityTags || [],
      homeCity: tasteProfile?.homeCity || null,
    });
  } catch (error) {
    console.error("Profile status check error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
