import { auth } from "@/lib/auth";
import { extractKeywords } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { searchTags } from "@/lib/qloo";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { answers } = body as {
      answers: { movie: string; artist: string; city: string };
    };

    if (!answers || !answers.movie || !answers.artist || !answers.city) {
      return NextResponse.json(
        { error: "Invalid payload - missing answers" },
        { status: 400 }
      );
    }

    // Step A: Use Gemini to infer keywords from each answer
    const movieKeywords = await extractKeywords(answers.movie);
    const artistKeywords = await extractKeywords(answers.artist);
    const cityKeywords = await extractKeywords(answers.city);

    // Combine all keywords (now limited to max 15 total)
    const allKeywords = [
      ...movieKeywords,
      ...artistKeywords,
      ...cityKeywords,
      // Include original answers as fallback
      answers.movie,
      answers.artist,
      answers.city,
    ];

    console.log(`Extracted keywords:`, {
      movieKeywords,
      artistKeywords,
      cityKeywords,
    });

    // Step B: Resolve each keyword to Qloo tag IDs
    const tagPromises = allKeywords.map((keyword) => searchTags(keyword));
    const tagResults = await Promise.all(tagPromises);
    const allTagIds = Array.from(new Set(tagResults.flat()));

    // Limit to most relevant tags (top 20-30 instead of 270!)
    const limitedTagIds = allTagIds.slice(0, 25);

    console.log(
      `Found ${allTagIds.length} total tags, storing ${limitedTagIds.length}`
    );

    // Step C & D: Store in database
    await prisma.tasteProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        affinityTags: limitedTagIds,
        homeCity: answers.city, // Store the user's city preference
      },
      update: {
        affinityTags: limitedTagIds,
        homeCity: answers.city,
      },
    });

    return NextResponse.json({
      success: true,
      affinityTags: limitedTagIds,
      extractedKeywords: {
        movie: movieKeywords,
        artist: artistKeywords,
        city: cityKeywords,
      },
    });
  } catch (error) {
    console.error("Onboarding completion error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
