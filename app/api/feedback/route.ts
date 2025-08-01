import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface FeedbackBody {
  tagUrn: string;
  action: "love" | "like" | "skip";
}

// Weight deltas for each action
const ACTION_DELTAS: Record<FeedbackBody["action"], number> = {
  love: 5,
  like: 2,
  skip: -5,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as FeedbackBody;
    if (!body.tagUrn || !body.action || !(body.action in ACTION_DELTAS)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Ensure user has a profile
    const profile = await prisma.tasteProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Taste profile not found" },
        { status: 404 }
      );
    }

    const delta = ACTION_DELTAS[body.action];

    const updated = await prisma.tagPreference.upsert({
      where: {
        profileId_tagUrn: {
          profileId: profile.id,
          tagUrn: body.tagUrn,
        },
      },
      create: {
        profileId: profile.id,
        tagUrn: body.tagUrn,
        weight: Math.max(1, 10 + delta),
      },
      update: {
        weight: {
          increment: delta,
        },
      },
    });

    // Clamp weight between 1 and 20
    if (updated.weight < 1 || updated.weight > 20) {
      await prisma.tagPreference.update({
        where: { id: updated.id },
        data: {
          weight: Math.min(20, Math.max(1, updated.weight)),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Feedback API error", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
