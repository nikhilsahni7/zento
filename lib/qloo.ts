import { z } from "zod";

const QLOO_BASE_URL = "https://hackathon.api.qloo.com";
const QLOO_API_KEY = process.env.QLOO_API_KEY;

if (!QLOO_API_KEY) {
  throw new Error("QLOO_API_KEY environment variable is required");
}

// Enhanced response schemas based on confirmed API structure
const TagResultSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  category: z.string().optional(),
});

export const TagsResponseSchema = z.object({
  results: z.object({
    tags: z.array(TagResultSchema),
  }),
});

const EntityResultSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  location: z
    .object({
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

export const InsightsResponseSchema = z.object({
  results: z.object({
    entities: z.array(EntityResultSchema).optional(),
    insights: z.array(EntityResultSchema).optional(),
  }),
});

// Enhanced fetch function with better error handling and retry logic
async function qlooFetch<T>(
  endpoint: string,
  params: Record<string, string>,
  retryCount = 0
): Promise<T> {
  const maxRetries = 3;
  const timeoutMs = 20000; // Increased timeout for better reliability

  const url = new URL(`${QLOO_BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  console.log(`Qloo API call (attempt ${retryCount + 1}): ${endpoint}`, {
    params: Object.keys(params),
    url: url.toString().replace(QLOO_API_KEY!, "[API_KEY]"),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "x-api-key": QLOO_API_KEY!,
        Accept: "application/json",
        "User-Agent": "Zento/1.0",
      },
      signal: controller.signal,
      next: { revalidate: 1800 }, // 30 minutes cache
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Qloo API error ${res.status}:`, errorText);

      if (res.status === 504 || res.status === 502 || res.status === 503) {
        throw new Error(`QLOO_GATEWAY_ERROR:${res.status}`);
      } else if (res.status === 429) {
        throw new Error(`QLOO_RATE_LIMIT:${res.status}`);
      } else if (res.status === 401) {
        throw new Error(`QLOO_AUTH_ERROR:${res.status}`);
      } else if (res.status === 403) {
        throw new Error(`QLOO_FORBIDDEN:${res.status}`);
      } else if (res.status === 404) {
        throw new Error(`QLOO_NOT_FOUND:${res.status}`);
      } else {
        throw new Error(`QLOO_ERROR:${res.status}:${errorText}`);
      }
    }

    const data = await res.json();

    // Validate response structure
    if (!data.results) {
      throw new Error("Invalid Qloo response structure");
    }

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

    // Enhanced retry logic for specific errors
    if (retryCount < maxRetries) {
      if (
        error.message.includes("QLOO_GATEWAY_ERROR") ||
        error.message.includes("QLOO_RATE_LIMIT") ||
        error.message.includes("QLOO_FORBIDDEN") ||
        error.name === "AbortError"
      ) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 8000); // Exponential backoff, max 8s
        console.log(`Retrying Qloo API in ${delay}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return qlooFetch<T>(endpoint, params, retryCount + 1);
      }
    }

    // Enhanced error messages
    if (error.message.includes("QLOO_AUTH_ERROR")) {
      throw new Error(
        "Authentication failed with Qloo API. Please check API configuration."
      );
    } else if (error.message.includes("QLOO_FORBIDDEN")) {
      throw new Error(
        "Access forbidden. This entity type may not be supported in the hackathon."
      );
    } else if (error.message.includes("QLOO_NOT_FOUND")) {
      throw new Error("Endpoint not found. Please check the API endpoint.");
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

// Enhanced tag search with better filtering and coffee shop handling
export async function searchTags(query: string): Promise<string[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    console.log(`Searching Qloo tags for: "${query}"`);

    // Special handling for coffee/cafe queries
    let searchQueries = [query.trim().toLowerCase()];
    if (
      query.toLowerCase().includes("coffee") ||
      query.toLowerCase().includes("cafe")
    ) {
      searchQueries = [
        "coffee",
        "cafe",
        "coffeehouse",
        "espresso",
        "coffee shop",
      ];
    }

    let allTags: any[] = [];

    // Search for multiple variations
    for (const searchQuery of searchQueries) {
      try {
        const data = await qlooFetch<any>("v2/tags", {
          "filter.query": searchQuery,
        });
        const tags = data.results?.tags || [];
        allTags.push(...tags);
      } catch (error) {
        console.warn(`Failed to search for "${searchQuery}":`, error);
      }
    }

    // Remove duplicates
    const uniqueTags = Array.from(
      new Map(allTags.map((tag) => [tag.id, tag])).values()
    );

    // Enhanced filtering to remove irrelevant tags
    const relevantTags = uniqueTags.filter((tag: any) => {
      const tagId = tag.id?.toLowerCase() || "";

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

      return !irrelevantPatterns.some((pattern) => tagId.includes(pattern));
    });

    const tagIds = relevantTags.map((tag: any) => tag.id).filter(Boolean);

    console.log(
      `Found ${tagIds.length} relevant tags for "${query}" from ${searchQueries.length} searches`
    );
    return tagIds.slice(0, 10); // Slightly higher limit for better results
  } catch (error: any) {
    console.error(`searchTags failed for "${query}":`, error.message);
    return []; // Return empty array instead of failing
  }
}

// Enhanced entity search for specific entities
export async function searchEntities(
  query: string,
  types: string[]
): Promise<string[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    console.log(
      `Searching Qloo entities for: "${query}" with types: ${types.join(", ")}`
    );

    const data = await qlooFetch<any>("search", {
      query: query.trim(),
      types: types.join(","),
    });

    const entities = data.results?.entities || [];
    const entityIds = entities.map((entity: any) => entity.id).filter(Boolean);

    console.log(`Found ${entityIds.length} entities for "${query}"`);
    return entityIds.slice(0, 5); // Limit to prevent too many entities
  } catch (error: any) {
    console.error(`searchEntities failed for "${query}":`, error.message);
    return [];
  }
}

// Supported Qloo entity types for the hackathon
const SUPPORTED_ENTITY_TYPES = [
  "urn:entity:place",
  "urn:entity:book",
  "urn:entity:movie",
  "urn:entity:artist",
  "urn:entity:brand",
  "urn:entity:destination",
  "urn:entity:tv_show",
  "urn:entity:video_game",
  "urn:entity:podcast",
  "urn:entity:person",
];

// Validate and sanitize entity type
export function validateEntityType(entityType: string): string {
  if (SUPPORTED_ENTITY_TYPES.includes(entityType)) {
    return entityType;
  }
  console.warn(`Unsupported entity type: ${entityType}, falling back to place`);
  return "urn:entity:place";
}

// Enhanced entity type detection with more categories
function getEntityTypeFromQuery(message: string): string {
  const msg = message.toLowerCase();

  // Books & Literature
  if (
    msg.includes("book") ||
    msg.includes("novel") ||
    msg.includes("read") ||
    msg.includes("literature") ||
    msg.includes("author") ||
    msg.includes("publisher")
  ) {
    return validateEntityType("urn:entity:book");
  }

  // Movies
  if (
    msg.includes("movie") ||
    msg.includes("film") ||
    msg.includes("cinema") ||
    msg.includes("director") ||
    msg.includes("actor")
  ) {
    return validateEntityType("urn:entity:movie");
  }

  // TV Shows specifically
  if (
    msg.includes("tv show") ||
    msg.includes("tv series") ||
    msg.includes("series") ||
    msg.includes("episode")
  ) {
    return validateEntityType("urn:entity:tv_show");
  }

  // Music & Artists
  if (
    msg.includes("music") ||
    msg.includes("artist") ||
    msg.includes("band") ||
    msg.includes("song") ||
    msg.includes("album") ||
    msg.includes("concert") ||
    msg.includes("live music")
  ) {
    return validateEntityType("urn:entity:artist");
  }

  // Video Games
  if (
    msg.includes("game") ||
    msg.includes("video game") ||
    msg.includes("gaming") ||
    msg.includes("play")
  ) {
    return validateEntityType("urn:entity:video_game");
  }

  // Podcasts
  if (
    msg.includes("podcast") ||
    msg.includes("listen") ||
    msg.includes("audio show")
  ) {
    return validateEntityType("urn:entity:podcast");
  }

  // Destinations & Travel
  if (
    msg.includes("travel") ||
    msg.includes("destination") ||
    msg.includes("city") ||
    msg.includes("country") ||
    msg.includes("visit")
  ) {
    return validateEntityType("urn:entity:destination");
  }

  // Brands & Products
  if (
    msg.includes("brand") ||
    msg.includes("product") ||
    msg.includes("shopping") ||
    msg.includes("buy") ||
    msg.includes("store")
  ) {
    return validateEntityType("urn:entity:brand");
  }

  // People/Celebrities
  if (
    msg.includes("celebrity") ||
    msg.includes("person") ||
    msg.includes("people") ||
    msg.includes("famous")
  ) {
    return validateEntityType("urn:entity:person");
  }

  // Places (default for most location-based queries)
  // Restaurants, cafes, venues, attractions, etc.
  return validateEntityType("urn:entity:place");
}

// Enhanced tag prioritization with better scoring
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
    const tagLower = tag.toLowerCase();

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
      "real_estate",
      "property",
      "construction",
      "maintenance",
    ];

    return !irrelevantPatterns.some((pattern) => tagLower.includes(pattern));
  });

  console.log(`🧹 Filtered to ${relevantTags.length} relevant tags`);

  // Enhanced intent-specific priorities
  let intentKeywords: string[] = [];
  if (userIntent) {
    const intent = userIntent.toLowerCase();

    // Food & Dining
    if (intent.includes("coffee") || intent.includes("cafe")) {
      intentKeywords = ["coffee", "cafe", "cafeteria", "espresso"];
    } else if (
      intent.includes("restaurant") ||
      intent.includes("dining") ||
      intent.includes("food") ||
      intent.includes("eat")
    ) {
      intentKeywords = ["restaurant", "dining", "cuisine", "food", "eatery"];
    } else if (
      intent.includes("bar") ||
      intent.includes("drink") ||
      intent.includes("cocktail") ||
      intent.includes("pub")
    ) {
      intentKeywords = ["bar", "cocktail", "drink", "pub", "nightlife"];
    }

    // Entertainment & Culture
    else if (
      intent.includes("music") ||
      intent.includes("concert") ||
      intent.includes("live") ||
      intent.includes("venue")
    ) {
      intentKeywords = [
        "music",
        "concert",
        "live",
        "venue",
        "hall",
        "performance",
        "entertainment",
        "nightlife",
      ];
    } else if (
      intent.includes("theater") ||
      intent.includes("cinema") ||
      intent.includes("show") ||
      intent.includes("movie")
    ) {
      intentKeywords = [
        "theater",
        "cinema",
        "show",
        "performance",
        "entertainment",
        "movie",
        "film",
      ];
    } else if (
      intent.includes("museum") ||
      intent.includes("gallery") ||
      intent.includes("cultural") ||
      intent.includes("art")
    ) {
      intentKeywords = [
        "museum",
        "gallery",
        "cultural",
        "art",
        "history",
        "exhibition",
      ];
    }

    // Shopping & Retail
    else if (
      intent.includes("shopping") ||
      intent.includes("store") ||
      intent.includes("mall") ||
      intent.includes("retail")
    ) {
      intentKeywords = [
        "shopping",
        "store",
        "retail",
        "mall",
        "boutique",
        "market",
      ];
    }

    // Outdoor & Activities
    else if (
      intent.includes("park") ||
      intent.includes("outdoor") ||
      intent.includes("nature") ||
      intent.includes("recreation")
    ) {
      intentKeywords = ["park", "outdoor", "nature", "recreation", "leisure"];
    } else if (
      intent.includes("gym") ||
      intent.includes("fitness") ||
      intent.includes("sport") ||
      intent.includes("exercise")
    ) {
      intentKeywords = ["gym", "fitness", "sport", "exercise", "wellness"];
    }

    // Accommodation
    else if (
      intent.includes("hotel") ||
      intent.includes("stay") ||
      intent.includes("accommodation") ||
      intent.includes("lodging")
    ) {
      intentKeywords = ["hotel", "accommodation", "stay", "lodge", "resort"];
    }

    // Cultural & Local
    else if (
      intent.includes("cultural") ||
      intent.includes("authentic") ||
      intent.includes("local") ||
      intent.includes("traditional")
    ) {
      intentKeywords = [
        "cultural",
        "authentic",
        "local",
        "traditional",
        "heritage",
      ];
    }
  }

  // Enhanced scoring system
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
      if (tag.includes("urn:tag:atmosphere:")) score += 200;
    } else if (entityType === "urn:entity:book") {
      if (tag.includes("urn:tag:genre:media:")) score += 500;
      if (tag.includes("urn:tag:theme:")) score += 400;
      if (tag.includes("urn:tag:subgenre:")) score += 300;
      if (tag.includes("urn:tag:style:")) score += 200;
    } else if (entityType === "urn:entity:movie") {
      if (tag.includes("urn:tag:genre:media:")) score += 500;
      if (tag.includes("urn:tag:theme:")) score += 400;
      if (tag.includes("urn:tag:subgenre:")) score += 300;
      if (tag.includes("urn:tag:style:")) score += 200;
    } else if (entityType === "urn:entity:artist") {
      if (tag.includes("urn:tag:genre:music:")) score += 500;
      if (tag.includes("urn:tag:style:")) score += 400;
      if (tag.includes("urn:tag:subgenre:")) score += 300;
    } else if (entityType === "urn:entity:brand") {
      if (tag.includes("urn:tag:category:brand:")) score += 500;
      if (tag.includes("urn:tag:industry:")) score += 400;
      if (tag.includes("urn:tag:style:")) score += 300;
    }

    // MEDIUM PRIORITY: Cultural and thematic relevance
    if (tag.includes("cultural") || tag.includes("authentic")) score += 150;
    if (tag.includes("local") || tag.includes("traditional")) score += 120;
    if (tag.includes("modern") || tag.includes("contemporary")) score += 100;
    if (tag.includes("luxury") || tag.includes("premium")) score += 80;
    if (tag.includes("casual") || tag.includes("relaxed")) score += 60;

    // LOWER PRIORITY: Generic preferences (taste profile)
    if (
      tag.includes("family") ||
      tag.includes("indian") ||
      tag.includes("bollywood") ||
      tag.includes("asian")
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

// Enhanced insights function with better error handling
export async function getInsights(opts: {
  type: string;
  tagIds: string[];
  locationQuery?: string;
  take?: number;
  userIntent?: string;
  userHomeCity?: string; // Add user's home city as fallback
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

    // Use location query if provided, otherwise fall back to user's home city
    const locationToUse = opts.locationQuery || opts.userHomeCity;
    if (
      locationToUse &&
      locationToUse !== "my area" &&
      !locationToUse.toLowerCase().includes("area")
    ) {
      params["signal.location.query"] = locationToUse;
    }

    console.log(`Qloo Insights Query:`, {
      type: opts.type,
      tags: selectedTags,
      location: locationToUse || "global",
      selectedFromTotal: `${selectedTags.length}/${opts.tagIds.length}`,
      userIntent: opts.userIntent,
      homeCity: opts.userHomeCity,
    });

    const data = await qlooFetch<any>("v2/insights", params);

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

// Enhanced weighted insights function for advanced usage
export async function getWeightedInsights(opts: {
  type: string;
  weightedTags: Array<{ tag: string; weight: number }>;
  locationQuery?: string;
  take?: number;
  userHomeCity?: string; // Add user's home city as fallback
}) {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const params: Record<string, string> = {
        "filter.type": opts.type,
        take: String(opts.take ?? 5),
      };

      // Use location query if provided, otherwise fall back to user's home city
      const locationToUse = opts.locationQuery || opts.userHomeCity;
      if (
        locationToUse &&
        locationToUse !== "my area" &&
        !locationToUse.toLowerCase().includes("area")
      ) {
        params["signal.location.query"] = locationToUse;
      }

      // Create weighted JSON body
      const body: any = {
        filter: {
          type: validateEntityType(opts.type),
          ...(opts.take ? { take: opts.take } : {}),
        },
        signal: {
          interests: {
            tags: opts.weightedTags.filter((t) => t.tag && t.weight > 0),
          },
          ...(locationToUse ? { location: { query: locationToUse } } : {}),
        },
      };

      console.log(`Qloo Weighted Insights Query (attempt ${attempt}):`, {
        type: opts.type,
        weightedTags: opts.weightedTags.slice(0, 5), // Log only first 5 for clarity
        location: locationToUse || "global",
        homeCity: opts.userHomeCity,
      });

      const url = new URL(`${QLOO_BASE_URL}/v2/insights`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "x-api-key": QLOO_API_KEY!,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Zento/1.0",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 504 || res.status === 502 || res.status === 503) {
          if (attempt < maxRetries) {
            console.log(
              `Gateway timeout (${res.status}), retrying in ${attempt * 2}s...`
            );
            await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
            continue;
          }
        }
        throw new Error(`Qloo weighted insights failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (error: any) {
      console.error(
        `getWeightedInsights attempt ${attempt} failed:`,
        error.message
      );

      if (attempt === maxRetries) {
        return {
          results: {
            entities: [],
            insights: [],
            error: error.message,
          },
        };
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  return {
    results: {
      entities: [],
      insights: [],
      error: "All retry attempts failed",
    },
  };
}

// -----------------------------------------------------------------------------
// Additional Qloo helpers for Trending and Analysis endpoints
// -----------------------------------------------------------------------------

// Get trending entities for a given category (e.g., places trending in NYC)
export async function getTrending(opts: {
  type: string;
  locationQuery?: string;
  take?: number;
  userHomeCity?: string; // Add user's home city as fallback
}) {
  try {
    const params: Record<string, string> = {
      "filter.type": opts.type,
      take: String(opts.take ?? 10),
    };

    // Use location query if provided, otherwise fall back to user's home city
    const locationToUse = opts.locationQuery || opts.userHomeCity;
    if (
      locationToUse &&
      locationToUse !== "my area" &&
      !locationToUse.toLowerCase().includes("area")
    ) {
      params["signal.location.query"] = locationToUse;
    }

    console.log(
      `Getting trending data for: ${opts.type} in ${locationToUse || "global"}`
    );

    // Use insights endpoint for trending data with minimal signals
    return qlooFetch<any>("v2/insights", params);
  } catch (error: any) {
    console.error("getTrending failed:", error.message);
    return {
      results: {
        entities: [],
        insights: [],
        error: error.message,
      },
    };
  }
}

// Run an analysis query for supplied entities or tags to get meta-insights
export async function getAnalysis(opts: {
  entityIds?: string[];
  tagIds?: string[];
  locationQuery?: string;
  take?: number;
  userHomeCity?: string; // Add user's home city as fallback
}) {
  const params: Record<string, string> = {
    take: String(opts.take ?? 10),
  };

  if (opts.entityIds && opts.entityIds.length > 0) {
    params["signal.interests.entities"] = opts.entityIds.join(",");
  }

  if (opts.tagIds && opts.tagIds.length > 0) {
    params["signal.interests.tags"] = opts.tagIds.join(",");
  }

  // Use location query if provided, otherwise fall back to user's home city
  const locationToUse = opts.locationQuery || opts.userHomeCity;
  if (
    locationToUse &&
    locationToUse !== "my area" &&
    !locationToUse.toLowerCase().includes("area")
  ) {
    params["signal.location.query"] = locationToUse;
  }

  return qlooFetch<any>("/analysis", params);
}

// Helper function to convert Qloo URNs back to friendly keyword names
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
