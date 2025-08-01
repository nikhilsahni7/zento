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

    console.log("Starting onboarding with answers:", {
      movie: answers.movie,
      artist: answers.artist,
      city: answers.city,
    });

    // Step A: Use enhanced Gemini to infer keywords from each answer
    const [movieKeywords, artistKeywords, cityKeywords] = await Promise.all([
      extractKeywords(answers.movie),
      extractKeywords(answers.artist),
      extractKeywords(answers.city),
    ]);

    // Combine all keywords with better prioritization
    const allKeywords = [
      // Prioritize the most specific keywords first
      ...movieKeywords.slice(0, 3),
      ...artistKeywords.slice(0, 3),
      ...cityKeywords.slice(0, 3),
      // Include original answers as fallback
      answers.movie,
      answers.artist,
      answers.city,
    ];

    console.log(`Extracted keywords:`, {
      movieKeywords,
      artistKeywords,
      cityKeywords,
      totalKeywords: allKeywords.length,
    });

    // Step B: Resolve each keyword to Qloo tag IDs with better error handling
    const tagPromises = allKeywords.map(async (keyword, index) => {
      try {
        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, index * 100));
        return searchTags(keyword);
      } catch (error) {
        console.error(`Failed to search tags for "${keyword}":`, error);
        return [];
      }
    });

    const tagResults = await Promise.all(tagPromises);
    const allTagIds = Array.from(new Set(tagResults.flat()));

    // Enhanced filtering to remove irrelevant tags
    const relevantTagIds = allTagIds.filter((tagId) => {
      const tagLower = tagId.toLowerCase();

      // Filter out medical, legal, educational, and other irrelevant categories
      const irrelevantPatterns = [
        "physician",
        "doctor",
        "medical",
        "hospital",
        "clinic",
        "health",
        "school",
        "education",
        "teacher",
        "academic",
        "university",
        "victim_service",
        "social_service",
        "government",
        "office",
        "admin",
        "lawyer",
        "attorney",
        "legal",
        "court",
        "law",
        "counselor",
        "insurance",
        "bank",
        "financial",
        "mortgage",
        "loan",
        "real_estate",
        "property",
        "construction",
        "maintenance",
      ];

      return !irrelevantPatterns.some((pattern) => tagLower.includes(pattern));
    });

    // Limit to most relevant tags (top 20 instead of 25)
    const limitedTagIds = relevantTagIds.slice(0, 20);

    console.log(
      `Found ${allTagIds.length} total tags, filtered to ${relevantTagIds.length} relevant, storing ${limitedTagIds.length}`
    );

    // Step C & D: Store in database with enhanced error handling
    try {
      const profile = await prisma.tasteProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          affinityTags: limitedTagIds,
          homeCity: answers.city,
        },
        update: {
          affinityTags: limitedTagIds,
          homeCity: answers.city,
        },
      });

      // Upsert weighted tag preferences (default weight = 10)
      const tagPrefPromises = limitedTagIds.map((tag) =>
        prisma.tagPreference.upsert({
          where: {
            profileId_tagUrn: {
              profileId: profile.id,
              tagUrn: tag,
            },
          },
          create: {
            profileId: profile.id,
            tagUrn: tag,
            weight: 10,
          },
          update: { weight: 10 },
        })
      );

      await Promise.all(tagPrefPromises);

      console.log(
        `Successfully created/updated taste profile for user ${session.user.id}`
      );

      return NextResponse.json({
        success: true,
        affinityTags: limitedTagIds,
        extractedKeywords: {
          movie: movieKeywords,
          artist: artistKeywords,
          city: cityKeywords,
        },
        stats: {
          totalKeywords: allKeywords.length,
          totalTagsFound: allTagIds.length,
          relevantTags: relevantTagIds.length,
          storedTags: limitedTagIds.length,
        },
      });
    } catch (dbError: any) {
      console.error("Database error during onboarding:", dbError);
      return NextResponse.json(
        { error: "Failed to save taste profile" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Onboarding completion error:", error);
    return NextResponse.json(
      {
        error: "Server error during onboarding",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
