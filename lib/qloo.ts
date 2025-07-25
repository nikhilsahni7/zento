import { z } from "zod";

const QLOO_BASE_URL = "https://hackathon.api.qloo.com/v2";
const QLOO_API_KEY = process.env.QLOO_API_KEY;

if (!QLOO_API_KEY) {
  throw new Error("QLOO_API_KEY environment variable is required");
}

// Basic response schemas (can be expanded)
const TagResultSchema = z.object({ id: z.string() });
export const TagsResponseSchema = z.object({
  results: z.object({ tags: z.array(TagResultSchema) }),
});

async function qlooFetch<T>(
  endpoint: string,
  params: Record<string, string>,
  retryCount = 0
): Promise<T> {
  const maxRetries = 3;
  const timeoutMs = 15000; // 15 second timeout

  const url = new URL(`${QLOO_BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  console.log(`Qloo API call (attempt ${retryCount + 1}): ${endpoint}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "x-api-key": QLOO_API_KEY!,
        Accept: "application/json",
        "User-Agent": "Cultural-Compass/1.0",
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // Handle specific error codes
      if (res.status === 504 || res.status === 502 || res.status === 503) {
        throw new Error(`QLOO_GATEWAY_ERROR:${res.status}`);
      } else if (res.status === 429) {
        throw new Error(`QLOO_RATE_LIMIT:${res.status}`);
      } else if (res.status === 401) {
        throw new Error(`QLOO_AUTH_ERROR:${res.status}`);
      } else {
        throw new Error(`QLOO_ERROR:${res.status}`);
      }
    }

    const data = await res.json();
    console.log(
      `Qloo API success: ${endpoint} - ${
        data.results?.tags?.length ||
        data.results?.entities?.length ||
        data.results?.insights?.length ||
        0
      } results`
    );
    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    console.error(`Qloo API error (attempt ${retryCount + 1}):`, error.message);

    // Retry logic for specific errors
    if (retryCount < maxRetries) {
      if (
        error.message.includes("QLOO_GATEWAY_ERROR") ||
        error.message.includes("QLOO_RATE_LIMIT") ||
        error.name === "AbortError"
      ) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
        console.log(`Retrying Qloo API in ${delay}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return qlooFetch<T>(endpoint, params, retryCount + 1);
      }
    }

    // If all retries failed, throw a user-friendly error
    if (error.message.includes("QLOO_AUTH_ERROR")) {
      throw new Error(
        "Authentication failed with Qloo API. Please check API configuration."
      );
    } else if (
      error.message.includes("QLOO_GATEWAY_ERROR") ||
      error.name === "AbortError"
    ) {
      throw new Error(
        "Qloo service is temporarily unavailable. Please try again in a moment."
      );
    } else if (error.message.includes("QLOO_RATE_LIMIT")) {
      throw new Error(
        "Too many requests to Qloo API. Please wait a moment and try again."
      );
    } else {
      throw new Error(`Qloo API error: ${error.message}`);
    }
  }
}

export async function searchTags(query: string): Promise<string[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    console.log(`Searching Qloo tags for: "${query}"`);

    const data = await qlooFetch<any>("tags", {
      "filter.query": query.trim().toLowerCase(),
    });

    const tags = data.results?.tags || [];
    const tagIds = tags.map((tag: any) => tag.id).filter(Boolean);

    console.log(`Found ${tagIds.length} tags for "${query}"`);
    return tagIds.slice(0, 10); // Limit to prevent too many tags
  } catch (error: any) {
    console.error(`searchTags failed for "${query}":`, error.message);
    return []; // Return empty array instead of failing
  }
}

// ENHANCED: Expanded entity type mapping for broader recommendations
function getEntityTypeFromQuery(message: string): string {
  const msg = message.toLowerCase();

  // Books & Literature
  if (
    msg.includes("book") ||
    msg.includes("novel") ||
    msg.includes("read") ||
    msg.includes("literature")
  ) {
    return "urn:entity:book";
  }

  // Movies & TV
  if (
    msg.includes("movie") ||
    msg.includes("film") ||
    msg.includes("tv") ||
    msg.includes("cinema") ||
    msg.includes("watch")
  ) {
    return "urn:entity:movie";
  }

  // Music & Artists
  if (
    msg.includes("music") ||
    msg.includes("artist") ||
    msg.includes("band") ||
    msg.includes("song") ||
    msg.includes("album")
  ) {
    return "urn:entity:artist";
  }

  // Brands & Products (if supported by Qloo)
  if (
    msg.includes("brand") ||
    msg.includes("product") ||
    msg.includes("shopping") ||
    msg.includes("buy")
  ) {
    return "urn:entity:brand";
  }

  // Places (default for most location-based queries)
  // Restaurants, cafes, venues, attractions, etc.
  return "urn:entity:place";
}

// ENHANCED: More sophisticated tag prioritization
function prioritizeTagsForEntityType(
  entityType: string,
  allTags: string[],
  userIntent?: string
): string[] {
  console.log(
    `🔍 Prioritizing ${allTags.length} tags for entity: ${entityType}`
  );
  console.log(`🎯 User intent: ${userIntent}`);

  // First, filter out completely irrelevant tags
  const relevantTags = allTags.filter((tag) => {
    // Remove medical, legal, educational junk
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
    ];

    return !irrelevantPatterns.some((pattern) =>
      tag.toLowerCase().includes(pattern)
    );
  });

  console.log(`🧹 Filtered to ${relevantTags.length} relevant tags`);

  // EXPANDED: Intent-specific priorities
  let intentKeywords: string[] = [];
  if (userIntent) {
    const intent = userIntent.toLowerCase();

    // Food & Dining
    if (intent.includes("coffee") || intent.includes("cafe")) {
      intentKeywords = ["coffee", "cafe", "cafeteria"];
    } else if (
      intent.includes("restaurant") ||
      intent.includes("dining") ||
      intent.includes("food")
    ) {
      intentKeywords = ["restaurant", "dining", "cuisine", "food"];
    } else if (
      intent.includes("bar") ||
      intent.includes("drink") ||
      intent.includes("cocktail")
    ) {
      intentKeywords = ["bar", "cocktail", "drink", "pub"];
    }

    // Entertainment & Culture
    else if (
      intent.includes("music") ||
      intent.includes("concert") ||
      intent.includes("live")
    ) {
      intentKeywords = [
        "music",
        "concert",
        "live",
        "venue",
        "hall",
        "performance",
      ];
    } else if (
      intent.includes("theater") ||
      intent.includes("cinema") ||
      intent.includes("show")
    ) {
      intentKeywords = [
        "theater",
        "cinema",
        "show",
        "performance",
        "entertainment",
      ];
    } else if (
      intent.includes("museum") ||
      intent.includes("gallery") ||
      intent.includes("cultural")
    ) {
      intentKeywords = ["museum", "gallery", "cultural", "art", "history"];
    }

    // Shopping & Retail
    else if (
      intent.includes("shopping") ||
      intent.includes("store") ||
      intent.includes("mall")
    ) {
      intentKeywords = ["shopping", "store", "retail", "mall", "boutique"];
    }

    // Outdoor & Activities
    else if (
      intent.includes("park") ||
      intent.includes("outdoor") ||
      intent.includes("nature")
    ) {
      intentKeywords = ["park", "outdoor", "nature", "recreation"];
    } else if (
      intent.includes("gym") ||
      intent.includes("fitness") ||
      intent.includes("sport")
    ) {
      intentKeywords = ["gym", "fitness", "sport", "exercise"];
    }

    // Accommodation
    else if (
      intent.includes("hotel") ||
      intent.includes("stay") ||
      intent.includes("accommodation")
    ) {
      intentKeywords = ["hotel", "accommodation", "stay", "lodge"];
    }
  }

  // Score tags based on relevance to user's CURRENT request
  const scoredTags = relevantTags.map((tag) => {
    let score = 0;

    // HIGHEST PRIORITY: Direct match with user intent
    for (const keyword of intentKeywords) {
      if (tag.toLowerCase().includes(keyword)) {
        score += 1000; // Super high priority
        break;
      }
    }

    // HIGH PRIORITY: Correct entity type categories
    if (entityType === "urn:entity:place") {
      if (tag.includes("urn:tag:category:place:")) score += 500;
      if (tag.includes("urn:tag:genre:place:")) score += 400;
      if (tag.includes("urn:tag:cuisine:")) score += 300;
      if (tag.includes("urn:tag:amenity:place:")) score += 250;
    } else if (entityType === "urn:entity:book") {
      if (tag.includes("urn:tag:genre:media:")) score += 500;
      if (tag.includes("urn:tag:theme:")) score += 400;
      if (tag.includes("urn:tag:subgenre:")) score += 300;
    } else if (entityType === "urn:entity:movie") {
      if (tag.includes("urn:tag:genre:media:")) score += 500;
      if (tag.includes("urn:tag:theme:")) score += 400;
      if (tag.includes("urn:tag:subgenre:")) score += 300;
    } else if (entityType === "urn:entity:artist") {
      if (tag.includes("urn:tag:genre:music:")) score += 500;
      if (tag.includes("urn:tag:style:")) score += 400;
    } else if (entityType === "urn:entity:brand") {
      if (tag.includes("urn:tag:category:brand:")) score += 500;
      if (tag.includes("urn:tag:industry:")) score += 400;
    }

    // LOWER PRIORITY: Generic preferences (taste profile)
    if (
      tag.includes("family") ||
      tag.includes("indian") ||
      tag.includes("bollywood")
    ) {
      score += 10; // Much lower priority
    }

    return { tag, score };
  });

  // Sort by score and return top tags
  const sortedTags = scoredTags
    .sort((a, b) => b.score - a.score)
    .map((item) => item.tag);

  console.log(`🏆 Top 5 selected tags:`, sortedTags.slice(0, 5));
  return sortedTags;
}

export async function getInsights(opts: {
  type: string;
  tagIds: string[];
  locationQuery?: string;
  take?: number;
  userIntent?: string; // Add user intent for smarter tag selection
}) {
  try {
    // Use smart tag prioritization with user intent
    const prioritizedTags = prioritizeTagsForEntityType(
      opts.type,
      opts.tagIds,
      opts.userIntent
    );

    // Use only the most relevant tags (max 3 for better precision)
    const selectedTags = prioritizedTags.slice(0, 3);

    if (selectedTags.length === 0) {
      console.warn("No relevant tags found for insights query");
      return { results: { entities: [], insights: [] } };
    }

    const params: Record<string, string> = {
      "filter.type": opts.type,
      "signal.interests.tags": selectedTags.join(","),
      take: String(opts.take ?? 5),
    };

    if (opts.locationQuery) {
      params["signal.location.query"] = opts.locationQuery;
    }

    console.log(`Qloo Insights Query:`, {
      type: opts.type,
      tags: selectedTags,
      location: opts.locationQuery || "global",
      selectedFromTotal: `${selectedTags.length}/${opts.tagIds.length}`,
      userIntent: opts.userIntent,
    });

    const data = await qlooFetch<any>("insights", params);

    // Validate response structure
    if (!data.results) {
      console.warn("Qloo insights returned no results structure");
      return { results: { entities: [], insights: [] } };
    }

    return data;
  } catch (error: any) {
    console.error(`getInsights failed:`, error.message);

    // Return empty results instead of throwing
    return {
      results: {
        entities: [],
        insights: [],
        error: error.message,
      },
    };
  }
}

// Helper function to convert Qloo URNs back to friendly keyword names
// This is needed for the Gemini prompts to provide user context
export function convertUrnsToKeywords(urnArray: string[]): string[] {
  return urnArray
    .map((urn) => {
      // Extract the meaningful part from URNs like "urn:tag:genre:media:science_fiction"
      const parts = urn.split(":");
      if (parts.length >= 4) {
        // Get the last part and clean it up
        const keyword = parts[parts.length - 1]
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        return keyword;
      }
      return urn; // fallback to original URN if parsing fails
    })
    .filter(Boolean);
}
