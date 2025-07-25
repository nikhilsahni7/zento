import { auth } from "@/lib/auth";
import { formatRecommendations, ParsedIntent, parseIntent } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { convertUrnsToKeywords, getInsights, searchTags } from "@/lib/qloo";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }


    const tasteProfile = await prisma.tasteProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!tasteProfile) {
      return NextResponse.json(
        {
          content:
            "I need to know your preferences first! Please complete the onboarding to get personalized recommendations.",
          type: "error",
        },
        { status: 400 }
      );
    }


    const affinityKeywords = convertUrnsToKeywords(tasteProfile.affinityTags);
    console.log(
      `User taste keywords: ${affinityKeywords.slice(0, 10).join(", ")}`
    );

    // 3. Gemini Prompt #1 (Intent Parsing) - EXACT FROM PLAN
    let parsedIntent: ParsedIntent;
    try {
      parsedIntent = await parseIntent({
        message: message,
        affinityKeywords,
        history: history || [],
      });
      console.log("Parsed Intent:", parsedIntent);
    } catch (error: any) {
      console.error("Intent parsing failed:", error.message);
      return NextResponse.json(
        {
          content:
            "I'm having trouble understanding your request. Could you rephrase it? For example: 'Find Italian restaurants' or 'Recommend books like Dune'",
          type: "error",
          data: { error: "Intent parsing failed" },
        },
        { status: 500 }
      );
    }

    let newTagIds: string[] = [];


    if (parsedIntent.signals.tags_to_find.length > 0) {
      try {
        console.log(
          `Searching for new tags: ${parsedIntent.signals.tags_to_find
            .slice(0, 5)
            .join(", ")}`
        );


        for (const keyword of parsedIntent.signals.tags_to_find.slice(0, 5)) {
          try {
            const tags = await searchTags(keyword);
            newTagIds.push(...tags);
            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error: any) {
            console.error(
              `Failed to search tags for "${keyword}":`,
              error.message
            );
            continue;
          }
        }

        // Remove duplicates
        newTagIds = Array.from(new Set(newTagIds));
        console.log(`Found ${newTagIds.length} new tags from user message`);
      } catch (error: any) {
        console.error("Tag search failed:", error.message);
      }
    }

    
    let finalTagIds: string[];

    if (newTagIds.length > 0) {
      // If we have new tags that match the user's intent, prioritize them heavily
      console.log(`🎯 Using NEW intent-specific tags as primary signal`);

      // Use mostly new tags (80%) + a few context tags from taste profile (20%)
      const contextTags = tasteProfile.affinityTags
        .filter(
          (tag) =>
            !tag.includes("drama") &&
            !tag.includes("victim") &&
            !tag.includes("counselor")
        )
        .slice(0, 3); // Only 3 context tags

      finalTagIds = [...newTagIds, ...contextTags];
    } else {
      // If no new tags, use core taste profile but filtered
      console.log(`🔄 Falling back to filtered taste profile`);
      finalTagIds = tasteProfile.affinityTags
        .filter(
          (tag) =>
            !tag.includes("drama") &&
            !tag.includes("victim") &&
            !tag.includes("counselor") &&
            !tag.includes("school")
        )
        .slice(0, 10); // Limit to 10 most relevant
    }

    console.log(`Final tags for insights: ${finalTagIds.length} total`);

    let qlooResponse;
    try {
      // Get recommendations from Qloo using smart tag selection
      qlooResponse = await getInsights({
        type: parsedIntent.target_category,
        tagIds: finalTagIds,
        locationQuery:
          parsedIntent.signals.location_query ||
          tasteProfile.homeCity ||
          undefined,
        take: 5,
        userIntent: message,
      });

      console.log(`Qloo Response:`, {
        entityCount: qlooResponse.results?.entities?.length || 0,
        insightCount: qlooResponse.results?.insights?.length || 0,
        hasError: !!qlooResponse.results?.error,
      });

      const entities =
        qlooResponse.results?.entities || qlooResponse.results?.insights || [];

      // IMPROVED fallback strategy with different entity types
      if (entities.length === 0 && !qlooResponse.results?.error) {
        console.log(
          "🔄 No results with combined tags, trying different approaches..."
        );

        let fallbackWorked = false;

        // Strategy 1: Try with ONLY new intent tags (existing approach)
        if (newTagIds.length > 0 && !fallbackWorked) {
          try {
            const fallbackResponse = await getInsights({
              type: parsedIntent.target_category,
              tagIds: newTagIds.slice(0, 3), // Use only the best new tags
              locationQuery:
                parsedIntent.signals.location_query ||
                tasteProfile.homeCity ||
                undefined,
              take: 5,
              userIntent: message,
            });

            const fallbackEntities =
              fallbackResponse.results?.entities ||
              fallbackResponse.results?.insights ||
              [];
            if (fallbackEntities.length > 0) {
              console.log(
                `✅ Strategy 1 successful: ${fallbackEntities.length} results`
              );
              qlooResponse.results = fallbackResponse.results;
              fallbackWorked = true;
            }
          } catch (fallbackError: any) {
            console.error("Strategy 1 failed:", fallbackError.message);
          }
        }

        // Strategy 2: For music venues, try urn:entity:artist instead of place
        if (
          !fallbackWorked &&
          (message.toLowerCase().includes("music") ||
            message.toLowerCase().includes("concert"))
        ) {
          try {
            console.log("🎵 Trying music artists for venue recommendations...");

            const musicResponse = await getInsights({
              type: "urn:entity:artist", // Try artist entity for music venues
              tagIds: newTagIds.slice(0, 3),
              locationQuery:
                parsedIntent.signals.location_query ||
                tasteProfile.homeCity ||
                undefined,
              take: 5,
              userIntent: message,
            });

            const musicEntities =
              musicResponse.results?.entities ||
              musicResponse.results?.insights ||
              [];
            if (musicEntities.length > 0) {
              console.log(
                `✅ Strategy 2 successful: ${musicEntities.length} music recommendations`
              );
              qlooResponse.results = musicResponse.results;
              fallbackWorked = true;
            }
          } catch (musicError: any) {
            console.error("Strategy 2 failed:", musicError.message);
          }
        }

        if (
          !fallbackWorked &&
          (parsedIntent.signals.location_query || tasteProfile.homeCity)
        ) {
          try {
            console.log("🌍 Trying generic location-based search...");

            const locationResponse = await getInsights({
              type: parsedIntent.target_category,
              tagIds: [
                "urn:tag:category:place:entertainment",
                "urn:tag:category:place:venue",
              ].filter(Boolean),
              locationQuery:
                parsedIntent.signals.location_query ||
                tasteProfile.homeCity ||
                undefined,
              take: 5,
              userIntent: message,
            });

            const locationEntities =
              locationResponse.results?.entities ||
              locationResponse.results?.insights ||
              [];
            if (locationEntities.length > 0) {
              console.log(
                `✅ Strategy 3 successful: ${locationEntities.length} location-based results`
              );
              qlooResponse.results = locationResponse.results;
              fallbackWorked = true;
            }
          } catch (locationError: any) {
            console.error("Strategy 3 failed:", locationError.message);
          }
        }
      }
    } catch (error: any) {
      console.error("Qloo API completely failed:", error.message);

      qlooResponse = {
        results: {
          entities: [],
          insights: [],
          error: error.message,
        },
      };
    }

    // 5. Gemini Prompt #2 (Response Generation) - EXACT FROM PLAN
    const finalEntities =
      qlooResponse.results?.entities || qlooResponse.results?.insights || [];

    if (finalEntities.length === 0) {
      const entityType = parsedIntent.target_category.replace(
        "urn:entity:",
        ""
      );
      let suggestion = "";

      switch (entityType) {
        case "place":
          suggestion =
            "Try: 'Find Italian restaurants in downtown' or 'Coffee shops with great ambiance'";
          break;
        case "book":
          suggestion =
            "Try: 'Recommend sci-fi books like Dune' or 'Books similar to my taste'";
          break;
        case "movie":
          suggestion =
            "Try: 'Movies like Blade Runner' or 'Best thriller films'";
          break;
        case "artist":
          suggestion =
            "Try: 'Artists similar to Tame Impala' or 'New music recommendations'";
          break;
        default:
          suggestion = "Try being more specific about what you're looking for";
      }

      const errorMessage = qlooResponse.results?.error
        ? `I'm having trouble accessing recommendations right now. `
        : `I couldn't find specific ${entityType} recommendations matching your preferences. `;

      return NextResponse.json({
        content: `${errorMessage}This might be because:

• Your preferences are very specific (which is great!)
• Temporary service issues
• Limited data for your location

👉 ${suggestion}
👉 Want to try a different type of recommendation?`,
        type: parsedIntent.intent,
        data: {
          intent: parsedIntent,
          userTasteKeywords: affinityKeywords,
          debug: {
            totalUserTags: tasteProfile.affinityTags.length,
            newTagsFound: newTagIds.length,
            tagsUsed: finalTagIds.length,
            resultsFound: 0,
            error: qlooResponse.results?.error || "No results found",
          },
        },
      });
    }

    // Generate final response with user's taste context
    let formattedResponse: string;
    try {
      formattedResponse = await formatRecommendations(
        qlooResponse,
        affinityKeywords
      );
    } catch (error: any) {
      console.error("Response formatting failed:", error.message);

      // Manual fallback with personalization
      formattedResponse = `Based on your taste for ${affinityKeywords
        .slice(0, 3)
        .join(", ")}, here's what I found:\n\n`;

      finalEntities.slice(0, 3).forEach((entity: any, index: number) => {
        const name = entity.name || entity.title || `Option ${index + 1}`;
        const description =
          entity.description || "A great match for your interests";
        formattedResponse += `**${name}** - ${description}\n\n`;
      });

      formattedResponse +=
        "👉 Want more details about any of these?\n👉 Looking for something different?";
    }

    return NextResponse.json({
      content: formattedResponse,
      type: parsedIntent.intent,
      data: {
        recommendations: finalEntities,
        intent: parsedIntent,
        userTasteKeywords: affinityKeywords,
        debug: {
          totalUserTags: tasteProfile.affinityTags.length,
          newTagsFound: newTagIds.length,
          tagsUsed: finalTagIds.length,
          resultsFound: finalEntities.length,
          qlooError: qlooResponse.results?.error || null,
        },
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        content:
          "I'm experiencing technical difficulties. Please try again in a moment.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
