import { auth } from "@/lib/auth";
import {
  formatAnalysis,
  formatItinerary,
  formatRecommendations,
  formatTrending,
  ParsedIntent,
  parseIntent,
} from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import {
  convertUrnsToKeywords,
  getAnalysis,
  getInsights,
  getTrending,
  getWeightedInsights,
  searchEntities,
  searchTags,
} from "@/lib/qloo";
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

    // Get user's taste profile
    const tasteProfile = await prisma.tasteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        tagPreferences: true,
      },
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

    // Convert URNs to friendly keywords for Gemini
    const affinityKeywords = convertUrnsToKeywords(tasteProfile.affinityTags);
    console.log(
      `User taste keywords: ${affinityKeywords.slice(0, 10).join(", ")}`
    );

    // Build weightedTags array from stored preferences (limit to 15)
    const weightedTagsFromProfile = (tasteProfile.tagPreferences || [])
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 15)
      .map((tp) => ({ tag: tp.tagUrn, weight: tp.weight }));

    // Step 1: Parse user intent with Gemini
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

    // Step 2: Search for new tags based on user intent
    let newTagIds: string[] = [];
    let specificEntityIds: string[] = [];

    if (parsedIntent.signals.tags_to_find.length > 0) {
      try {
        console.log(
          `Searching for new tags: ${parsedIntent.signals.tags_to_find
            .slice(0, 5)
            .join(", ")}`
        );

        // Search for tags in parallel with rate limiting
        const tagPromises = parsedIntent.signals.tags_to_find
          .slice(0, 5)
          .map(async (keyword, index) => {
            // Add small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, index * 200));
            return searchTags(keyword);
          });

        const tagResults = await Promise.all(tagPromises);
        newTagIds = Array.from(new Set(tagResults.flat()));

        console.log(`Found ${newTagIds.length} new tags from user message`);
      } catch (error: any) {
        console.error("Tag search failed:", error.message);
      }
    }

    // Step 3: Search for specific entities if mentioned
    if (
      parsedIntent.signals.specific_entities &&
      parsedIntent.signals.specific_entities.length > 0
    ) {
      try {
        const entityTypes = [parsedIntent.target_category];
        const entityPromises = parsedIntent.signals.specific_entities
          .slice(0, 3)
          .map(async (entity, index) => {
            await new Promise((resolve) => setTimeout(resolve, index * 200));
            return searchEntities(entity, entityTypes);
          });

        const entityResults = await Promise.all(entityPromises);
        specificEntityIds = Array.from(new Set(entityResults.flat()));

        console.log(`Found ${specificEntityIds.length} specific entities`);
      } catch (error: any) {
        console.error("Entity search failed:", error.message);
      }
    }

    // Step 4: Combine signals intelligently
    let finalTagIds: string[];
    let weightedTags: { tag: string; weight: number }[] = [];

    if (newTagIds.length > 0) {
      // If we have new tags that match the user's intent, prioritize them heavily
      console.log(`🎯 Using NEW intent-specific tags as primary signal`);

      // Use mostly new tags (70%) + a few context tags from taste profile (30%)
      const contextTags = tasteProfile.affinityTags
        .filter(
          (tag) =>
            !tag.includes("drama") &&
            !tag.includes("victim") &&
            !tag.includes("counselor") &&
            !tag.includes("school") &&
            !tag.includes("medical")
        )
        .slice(0, 2); // Only 2 context tags

      finalTagIds = [...newTagIds, ...contextTags];

      // Boost weights for new tags if using weighted flow later
      weightedTags = [
        ...newTagIds.map((t) => ({ tag: t, weight: 15 })),
        ...contextTags.map((t) => ({ tag: t, weight: 8 })),
      ];
    } else {
      // If no new tags, use core taste profile but filtered
      console.log(`🔄 Falling back to filtered taste profile`);
      finalTagIds = tasteProfile.affinityTags
        .filter(
          (tag) =>
            !tag.includes("drama") &&
            !tag.includes("victim") &&
            !tag.includes("counselor") &&
            !tag.includes("school") &&
            !tag.includes("medical")
        )
        .slice(0, 8); // Limit to 8 most relevant

      weightedTags = weightedTagsFromProfile.length
        ? weightedTagsFromProfile
        : finalTagIds.map((t) => ({ tag: t, weight: 10 }));
    }

    console.log(`Final tags for insights: ${finalTagIds.length} total`);

    // Step 5: Call appropriate Qloo endpoint based on intent
    let qlooResponse;
    try {
      console.log(
        `🎯 Intent: ${parsedIntent.intent}, Category: ${parsedIntent.target_category}`
      );

      if (parsedIntent.intent === "trending") {
        console.log("📈 Calling /v2/trending endpoint");

        // Trending endpoint only supports specific entity types, not places
        // Map place requests to supported entity types
        let trendingType = parsedIntent.target_category;
        if (parsedIntent.target_category === "urn:entity:place") {
          // For place-related trending, use artists (music venues) or movies (entertainment)
          if (
            message.toLowerCase().includes("music") ||
            message.toLowerCase().includes("concert")
          ) {
            trendingType = "urn:entity:artist";
          } else if (
            message.toLowerCase().includes("movie") ||
            message.toLowerCase().includes("cinema")
          ) {
            trendingType = "urn:entity:movie";
          } else {
            // Default to artists for general place trending
            trendingType = "urn:entity:artist";
          }
        }

        try {
          qlooResponse = await getTrending({
            type: trendingType,
            locationQuery: parsedIntent.signals.location_query || undefined,
            take: 6,
            userHomeCity: tasteProfile.homeCity || undefined,
          });
        } catch (trendingError: any) {
          console.log(
            "⚠️ Trending endpoint failed, falling back to regular insights:",
            trendingError.message
          );
          // Fallback to regular insights for trending requests
          qlooResponse = await getInsights({
            type: trendingType,
            tagIds: finalTagIds,
            locationQuery: parsedIntent.signals.location_query || undefined,
            take: 6,
            userIntent: message,
            userHomeCity: tasteProfile.homeCity || undefined,
          });
        }
      } else if (parsedIntent.intent === "analysis") {
        console.log("🔍 Calling /v2/analysis endpoint");
        qlooResponse = await getAnalysis({
          entityIds:
            specificEntityIds.length > 0 ? specificEntityIds : undefined,
          tagIds: finalTagIds.length > 0 ? finalTagIds : undefined,
          locationQuery: parsedIntent.signals.location_query || undefined,
          take: 10,
          userHomeCity: tasteProfile.homeCity || undefined,
        });
      } else {
        console.log("💡 Calling weighted /v2/insights endpoint");
        // recommendation / itinerary / refine / explore
        // Prefer weighted insights if we have weight data
        if (weightedTags.length > 0) {
          try {
            qlooResponse = await getWeightedInsights({
              type: parsedIntent.target_category,
              weightedTags: weightedTags.slice(0, 15),
              locationQuery: parsedIntent.signals.location_query || undefined,
              take: 6,
              userHomeCity: tasteProfile.homeCity || undefined,
            });

            // Check if weighted insights failed
            if (
              qlooResponse.results?.error ||
              (qlooResponse.results?.entities?.length === 0 &&
                qlooResponse.results?.insights?.length === 0)
            ) {
              console.log(
                "⚠️ Weighted insights failed, falling back to regular search"
              );
              qlooResponse = await getInsights({
                type: parsedIntent.target_category,
                tagIds: finalTagIds,
                locationQuery: parsedIntent.signals.location_query || undefined,
                take: 6,
                userIntent: message,
                userHomeCity: tasteProfile.homeCity || undefined,
              });
            }
          } catch (weightedError: any) {
            console.log(
              "⚠️ Weighted insights error, falling back to regular search:",
              weightedError.message
            );
            qlooResponse = await getInsights({
              type: parsedIntent.target_category,
              tagIds: finalTagIds,
              locationQuery:
                parsedIntent.signals.location_query ||
                tasteProfile.homeCity ||
                undefined,
              take: 6,
              userIntent: message,
            });
          }
        } else {
          qlooResponse = await getInsights({
            type: parsedIntent.target_category,
            tagIds: finalTagIds,
            locationQuery: parsedIntent.signals.location_query || undefined,
            take: 6,
            userIntent: message,
            userHomeCity: tasteProfile.homeCity || undefined,
          });
        }
      }

      console.log(`Qloo Response:`, {
        entityCount: qlooResponse.results?.entities?.length || 0,
        insightCount: qlooResponse.results?.insights?.length || 0,
        hasError: !!qlooResponse.results?.error,
      });

      const entities =
        qlooResponse.results?.entities || qlooResponse.results?.insights || [];

      const isCoreRecFlow = [
        "recommendation",
        "itinerary",
        "refine",
        "explore",
      ].includes(parsedIntent.intent);

      // Enhanced fallback strategy (only for core recommendation flows)
      if (
        isCoreRecFlow &&
        entities.length === 0 &&
        !qlooResponse.results?.error
      ) {
        console.log(
          "🔄 No results with combined tags, trying different approaches..."
        );

        let fallbackWorked = false;

        // Strategy 1: Try with ONLY new intent tags
        if (newTagIds.length > 0 && !fallbackWorked) {
          try {
            const fallbackResponse = await getInsights({
              type: parsedIntent.target_category,
              tagIds: newTagIds.slice(0, 3),
              locationQuery: parsedIntent.signals.location_query || undefined,
              take: 5,
              userIntent: message,
              userHomeCity: tasteProfile.homeCity || undefined,
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

        // Strategy 2: Try different entity type for music venues
        if (
          !fallbackWorked &&
          (message.toLowerCase().includes("music") ||
            message.toLowerCase().includes("concert") ||
            message.toLowerCase().includes("live"))
        ) {
          try {
            console.log("🎵 Trying music artists for venue recommendations...");

            const musicResponse = await getInsights({
              type: "urn:entity:artist",
              tagIds: newTagIds.slice(0, 3),
              locationQuery: parsedIntent.signals.location_query || undefined,
              take: 5,
              userIntent: message,
              userHomeCity: tasteProfile.homeCity || undefined,
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

        // Strategy 3: Try generic location-based search
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
                "urn:tag:category:place:restaurant",
              ].filter(Boolean),
              locationQuery: parsedIntent.signals.location_query || undefined,
              take: 5,
              userIntent: message,
              userHomeCity: tasteProfile.homeCity || undefined,
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

        // Strategy 4: Try with user's core taste profile only
        if (!fallbackWorked) {
          try {
            console.log("🎭 Trying with core taste profile...");

            const coreResponse = await getInsights({
              type: parsedIntent.target_category,
              tagIds: tasteProfile.affinityTags
                .filter(
                  (tag) => !tag.includes("medical") && !tag.includes("school")
                )
                .slice(0, 5),
              locationQuery: parsedIntent.signals.location_query || undefined,
              take: 5,
              userIntent: message,
              userHomeCity: tasteProfile.homeCity || undefined,
            });

            const coreEntities =
              coreResponse.results?.entities ||
              coreResponse.results?.insights ||
              [];
            if (coreEntities.length > 0) {
              console.log(
                `✅ Strategy 4 successful: ${coreEntities.length} core profile results`
              );
              qlooResponse.results = coreResponse.results;
              fallbackWorked = true;
            }
          } catch (coreError: any) {
            console.error("Strategy 4 failed:", coreError.message);
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

    // Step 6: Generate response based on intent type
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

    // Step 7: Format response based on intent type
    let formattedResponse: string;
    try {
      if (parsedIntent.intent === "itinerary") {
        const location =
          parsedIntent.signals.location_query ||
          tasteProfile.homeCity ||
          "this area";
        formattedResponse = await formatItinerary(
          qlooResponse,
          affinityKeywords,
          location
        );
      } else if (parsedIntent.intent === "analysis") {
        formattedResponse = await formatAnalysis(qlooResponse);
      } else if (parsedIntent.intent === "trending") {
        formattedResponse = await formatTrending(qlooResponse);
      } else {
        formattedResponse = await formatRecommendations(
          qlooResponse,
          affinityKeywords
        );
      }
    } catch (error: any) {
      console.error("Response formatting failed:", error.message);

      // Enhanced manual fallback with personalization
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
