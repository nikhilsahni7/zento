import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenAI({
  apiKey:
    process.env.GEMINI_API_KEY ||
    (() => {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    })(),
});

// Enhanced models with proper fallback strategy
const MODELS = {
  primary: "gemini-2.0-flash",
  fallback: "gemini-1.5-flash",
  backup: "gemini-1.5-pro",
};

// Enhanced Gemini call with better JSON handling and error recovery
async function callGeminiWithFallback(
  prompt: string,
  requestJson = false,
  retryCount = 0
): Promise<string> {
  const models = [MODELS.primary, MODELS.fallback, MODELS.backup];
  const currentModel = models[Math.min(retryCount, models.length - 1)];

  try {
    console.log(
      `Trying Gemini model: ${currentModel} (attempt ${retryCount + 1})`
    );

    const config: any = {
      maxOutputTokens: 1500, // Increased for better responses
      temperature: 0.2, // Lower temperature for more consistent results
      topK: 40,
      topP: 0.95,
    };

    // Enhanced JSON response mode for structured output
    if (requestJson) {
      config.responseMimeType = "application/json";
      // Remove empty schema that causes API errors
    }

    const response = await genAI.models.generateContent({
      model: currentModel,
      contents: prompt,
      config,
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated");
    }

    return text;
  } catch (error: any) {
    console.error(`Gemini API error with ${currentModel}:`, error.message);

    // Enhanced error handling for different failure types
    if (
      error.status === 503 ||
      error.status === 429 ||
      error.status === 400 ||
      error.status === 500
    ) {
      if (retryCount < models.length - 1) {
        console.log(`Retrying with fallback model...`);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        ); // Exponential backoff
        return callGeminiWithFallback(prompt, requestJson, retryCount + 1);
      }
    }

    // If all models fail, return a helpful fallback
    if (retryCount >= models.length - 1) {
      console.error("All Gemini models failed, using fallback response");
      return requestJson
        ? '{"error": "AI temporarily unavailable"}'
        : "I'm having trouble processing that request right now. Please try again in a moment.";
    }

    throw error;
  }
}

// Enhanced keyword extraction with better prompt engineering
export async function extractKeywords(text: string): Promise<string[]> {
  const prompt = `Extract EXACTLY 3-5 key genres, themes, or cultural keywords from this title. Focus on what makes this unique and culturally significant.

Return ONLY a JSON array of strings. Be specific and culturally relevant.

Examples:
- "Blade Runner" → ["Science Fiction", "Cyberpunk", "Neo-Noir", "Dystopian", "Futuristic"]
- "Tame Impala" → ["Psychedelic Rock", "Indie Pop", "Electronic", "Alternative"]
- "Tokyo" → ["Japanese Culture", "Urban Life", "Modern City", "Technology", "Tradition"]
- "The Godfather" → ["Crime Drama", "Family Saga", "Italian-American", "Classic Cinema"]
- "Pink Floyd" → ["Progressive Rock", "Psychedelic", "Concept Albums", "Experimental"]

Title: "${text}"

JSON Array:`;

  try {
    const response = await callGeminiWithFallback(prompt, true); // Request JSON
    const parsed = JSON.parse(response);

    if (Array.isArray(parsed)) {
      return parsed.slice(0, 5); // Ensure max 5 keywords
    }

    throw new Error("Response is not an array");
  } catch (error) {
    console.error("Keyword extraction failed:", error);

    // Enhanced smart fallback based on text analysis
    const words = text.toLowerCase().split(/\s+/);
    const enhancedKeywords = words
      .slice(0, 3)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

    // Add some cultural context based on common patterns
    if (
      text.toLowerCase().includes("tokyo") ||
      text.toLowerCase().includes("japan")
    ) {
      enhancedKeywords.push("Japanese Culture");
    }
    if (
      text.toLowerCase().includes("india") ||
      text.toLowerCase().includes("delhi")
    ) {
      enhancedKeywords.push("Indian Culture");
    }
    if (
      text.toLowerCase().includes("music") ||
      text.toLowerCase().includes("band")
    ) {
      enhancedKeywords.push("Music");
    }

    return enhancedKeywords;
  }
}

// Enhanced intent parsing with better structure
const intentSchema = z.object({
  intent: z.enum([
    "recommendation",
    "itinerary",
    "refine",
    "explore",
    "analysis",
    "trending",
  ]),
  target_category: z.string(),
  signals: z.object({
    tags_to_find: z.array(z.string()),
    location_query: z.string().nullable(),
    specific_entities: z.array(z.string()).optional(),
  }),
});

export type ParsedIntent = z.infer<typeof intentSchema>;

interface IntentPromptParams {
  message: string;
  affinityKeywords: string[]; // Friendly names translated from URNs
  history: { role: "user" | "assistant"; content: string }[];
}

// Enhanced intent parsing with better prompt engineering
export async function parseIntent({
  message,
  affinityKeywords,
  history,
}: IntentPromptParams): Promise<ParsedIntent> {
  const prompt = `You are an AI assistant that converts natural language to structured commands for a cultural recommendation system. Return ONLY valid JSON.

User's Cultural Taste Profile: ${JSON.stringify(affinityKeywords.slice(0, 8))}
Recent Chat Context: ${history
    .slice(-3)
    .map((m) => `${m.role}: ${m.content}`)
    .join(" | ")}
User Message: "${message}"

Analyze the message and return this JSON structure:
{
  "intent": "recommendation|itinerary|refine|explore|analysis|trending",
  "target_category": "urn:entity:place|book|movie|artist|brand",
  "signals": {
    "tags_to_find": ["keyword1", "keyword2"],
    "location_query": "city name or null",
    "specific_entities": ["entity1", "entity2"]
  }
}

Entity Type Guidelines:
- Entertainment venues, restaurants, cafes, attractions → "urn:entity:place"
- Books, novels, literature → "urn:entity:book"
- Movies, TV shows, films → "urn:entity:movie"
- Music artists, bands, musicians → "urn:entity:artist"
- Brands, products, shopping → "urn:entity:brand"
- Destinations, cities, travel → "urn:entity:destination"
- TV shows specifically → "urn:entity:tv_show"
- Video games → "urn:entity:video_game"
- Podcasts → "urn:entity:podcast"
- People/celebrities → "urn:entity:person"

Intent Guidelines:
- "recommendation": User wants specific recommendations
- "itinerary": User wants a plan or multiple connected recommendations
- "refine": User wants to modify or improve previous recommendations
- "explore": User wants to discover new categories or broad suggestions
- "analysis": User wants high-level insights (e.g., "What themes connect these places?")
- "trending": User wants what's popular right now (e.g., "Trending artists in NYC")

Note: For trending requests about places, use "urn:entity:artist" for music venues or "urn:entity:movie" for entertainment venues.

Extract relevant keywords and location information from the user's message.

JSON Response:`;

  try {
    const text = await callGeminiWithFallback(prompt, true); // Request JSON
    const parsed = JSON.parse(text);

    return intentSchema.parse(parsed);
  } catch (error) {
    console.error("Intent parsing failed:", error);

    // Enhanced fallback with more comprehensive entity type detection
    let target_category = "urn:entity:place"; // default
    const msg = message.toLowerCase();

    // Books & Literature
    if (
      msg.includes("book") ||
      msg.includes("read") ||
      msg.includes("novel") ||
      msg.includes("literature") ||
      msg.includes("author") ||
      msg.includes("publisher") ||
      msg.includes("library")
    ) {
      target_category = "urn:entity:book";
    }
    // Movies
    else if (
      msg.includes("movie") ||
      msg.includes("film") ||
      msg.includes("cinema") ||
      msg.includes("director") ||
      msg.includes("actor")
    ) {
      target_category = "urn:entity:movie";
    }
    // TV Shows specifically
    else if (
      msg.includes("tv show") ||
      msg.includes("tv series") ||
      msg.includes("series") ||
      msg.includes("episode")
    ) {
      target_category = "urn:entity:tv_show";
    }
    // Music & Artists
    else if (
      msg.includes("music") ||
      msg.includes("artist") ||
      msg.includes("song") ||
      msg.includes("concert") ||
      msg.includes("live music") ||
      msg.includes("band") ||
      msg.includes("album") ||
      msg.includes("musician")
    ) {
      target_category = "urn:entity:artist";
    }
    // Video Games
    else if (
      msg.includes("game") ||
      msg.includes("video game") ||
      msg.includes("gaming") ||
      msg.includes("play")
    ) {
      target_category = "urn:entity:video_game";
    }
    // Podcasts
    else if (
      msg.includes("podcast") ||
      msg.includes("listen") ||
      msg.includes("audio show")
    ) {
      target_category = "urn:entity:podcast";
    }
    // Destinations & Travel
    else if (
      msg.includes("travel") ||
      msg.includes("destination") ||
      msg.includes("city") ||
      msg.includes("country") ||
      msg.includes("visit")
    ) {
      target_category = "urn:entity:destination";
    }
    // Brands & Shopping
    else if (
      msg.includes("brand") ||
      msg.includes("product") ||
      msg.includes("shopping") ||
      msg.includes("store") ||
      msg.includes("buy") ||
      msg.includes("retail")
    ) {
      target_category = "urn:entity:brand";
    }
    // People/Celebrities
    else if (
      msg.includes("celebrity") ||
      msg.includes("person") ||
      msg.includes("people") ||
      msg.includes("famous")
    ) {
      target_category = "urn:entity:person";
    }
    // Places (restaurants, venues, attractions, etc.) - fallback
    else if (
      msg.includes("restaurant") ||
      msg.includes("cafe") ||
      msg.includes("bar") ||
      msg.includes("venue") ||
      msg.includes("place")
    ) {
      target_category = "urn:entity:place";
    }

    // Enhanced keyword extraction by category with more specific patterns
    const keywords = [];

    // Food & Dining
    if (msg.includes("coffee") || msg.includes("cafe")) {
      keywords.push("coffee", "cafe", "espresso");
    }
    if (
      msg.includes("restaurant") ||
      msg.includes("dining") ||
      msg.includes("food") ||
      msg.includes("eat") ||
      msg.includes("cuisine")
    ) {
      keywords.push("restaurant", "dining", "cuisine");
    }
    if (
      msg.includes("bar") ||
      msg.includes("cocktail") ||
      msg.includes("drink") ||
      msg.includes("pub") ||
      msg.includes("nightlife")
    ) {
      keywords.push("bar", "cocktail", "nightlife");
    }

    // Entertainment & Culture
    if (
      msg.includes("music") ||
      msg.includes("concert") ||
      msg.includes("live")
    ) {
      keywords.push("live music", "concert", "venue");
    }
    if (
      msg.includes("theater") ||
      msg.includes("cinema") ||
      msg.includes("show")
    ) {
      keywords.push("theater", "cinema", "entertainment");
    }
    if (
      msg.includes("museum") ||
      msg.includes("gallery") ||
      msg.includes("art")
    ) {
      keywords.push("museum", "gallery", "cultural");
    }

    // Shopping & Retail
    if (
      msg.includes("shopping") ||
      msg.includes("mall") ||
      msg.includes("store") ||
      msg.includes("retail")
    ) {
      keywords.push("shopping", "retail", "boutique");
    }

    // Activities & Recreation
    if (
      msg.includes("park") ||
      msg.includes("outdoor") ||
      msg.includes("nature")
    ) {
      keywords.push("park", "outdoor", "recreation");
    }
    if (
      msg.includes("gym") ||
      msg.includes("fitness") ||
      msg.includes("sport")
    ) {
      keywords.push("gym", "fitness", "wellness");
    }

    // Cultural & Local
    if (
      msg.includes("cultural") ||
      msg.includes("authentic") ||
      msg.includes("local")
    ) {
      keywords.push("cultural", "authentic", "local");
    }
    if (msg.includes("traditional") || msg.includes("heritage")) {
      keywords.push("traditional", "heritage");
    }

    // Luxury & Premium
    if (
      msg.includes("luxury") ||
      msg.includes("premium") ||
      msg.includes("upscale")
    ) {
      keywords.push("luxury", "premium");
    }

    // Casual & Relaxed
    if (
      msg.includes("casual") ||
      msg.includes("relaxed") ||
      msg.includes("chill")
    ) {
      keywords.push("casual", "relaxed");
    }

    // Enhanced location extraction
    let location_query = null;
    const locationKeywords = ["in", "at", "near", "around", "visit"];
    const words = message.split(" ");
    for (let i = 0; i < words.length; i++) {
      if (
        locationKeywords.includes(words[i].toLowerCase()) &&
        i + 1 < words.length
      ) {
        const potentialLocation = words[i + 1].toLowerCase();
        // Filter out pronouns and generic location terms
        const invalidLocations = [
          "my",
          "your",
          "his",
          "her",
          "their",
          "our",
          "this",
          "that",
          "the",
          "a",
          "an",
          "area", // Don't use "area" as location
          "place",
          "vicinity",
          "neighborhood",
        ];
        if (
          !invalidLocations.includes(potentialLocation) &&
          potentialLocation !== "area"
        ) {
          // Only set location if it looks like a real place name
          if (
            potentialLocation.length > 2 &&
            !potentialLocation.includes("area")
          ) {
            location_query = words[i + 1];
            break;
          }
        }
      }
    }

    // Additional check - if we found "my area" or similar, don't use it
    if (
      location_query &&
      (location_query.toLowerCase().includes("area") ||
        location_query.toLowerCase() === "my")
    ) {
      location_query = null;
    }

    return {
      intent:
        msg.includes("plan") || msg.includes("itinerary") || msg.includes("day")
          ? "itinerary"
          : msg.includes("refine") ||
            msg.includes("different") ||
            msg.includes("other")
          ? "refine"
          : msg.includes("trend") || msg.includes("trending")
          ? "trending"
          : msg.includes("analysis") || msg.includes("analyze")
          ? "analysis"
          : msg.includes("explore") ||
            msg.includes("discover") ||
            msg.includes("new")
          ? "explore"
          : "recommendation",
      target_category,
      signals: {
        tags_to_find: keywords.length > 0 ? keywords : [message.split(" ")[0]], // First word as fallback
        location_query,
        specific_entities: [],
      },
    };
  }
}

// Enhanced response generation with better personalization
export async function formatRecommendations(
  rawJson: any,
  userTasteKeywords: string[]
) {
  const entities = rawJson.results?.entities || rawJson.results?.insights || [];

  if (entities.length === 0) {
    return "I couldn't find specific recommendations right now. Could you try being more specific? Like 'Italian restaurants in downtown' or 'sci-fi books like Blade Runner'? 😊";
  }

  // Enhanced prompt template with better personalization
  const prompt = `You are Zento, a friendly and insightful AI concierge. The user asked for a recommendation, and here is the data we found.

Your Task: Write a fun, engaging, and conversational response. Present the recommendations clearly. For each one, add a short "Why you'll like it:" sentence that connects the recommendation back to the user's known tastes.

User's Known Cultural Tastes: ${userTasteKeywords.join(", ")}

Guidelines:
- Keep the response conversational and under 300 words
- For each recommendation, explain WHY it matches their taste profile
- Use cultural context and personalization
- End with 1-2 action suggestions
- Be enthusiastic but authentic

Examples of "Why you'll like it" connections:
- "Based on your love for Blade Runner, you'll enjoy this book's dystopian themes and futuristic storytelling."
- "Since you're into Tame Impala, this venue's psychedelic atmosphere and indie vibe will resonate with you."
- "Given your taste for Tokyo's culture, this restaurant captures that same authentic spirit and attention to detail."
- "Perfect for your appreciation of cultural authenticity - this place offers the real local experience you love."

Qloo Recommendation Data: ${JSON.stringify(entities.slice(0, 4), null, 2)}

Your Conversational Response:`;

  try {
    const response = await callGeminiWithFallback(prompt);
    return response;
  } catch (error) {
    console.error("Response formatting failed:", error);

    // Enhanced fallback with better personalization
    let response = `Based on your taste for ${userTasteKeywords
      .slice(0, 3)
      .join(", ")}, here's what I found:\n\n`;

    entities.slice(0, 3).forEach((entity: any, index: number) => {
      const name = entity.name || entity.title || `Option ${index + 1}`;
      const description =
        entity.description || "A great cultural match for your interests!";

      // Enhanced personalization based on taste keywords
      let personalization = "";
      if (userTasteKeywords.length > 0) {
        const primaryTaste = userTasteKeywords[0];
        personalization = `Perfect for your ${primaryTaste} interests!`;
      } else {
        personalization = "A great recommendation for you!";
      }

      response += `**${name}** - ${description}\n*Why you'll like it:* ${personalization}\n\n`;
    });

    response += `👉 Want more details about any of these?\n👉 Try a different search or explore new categories?`;

    return response;
  }
}

// New function for itinerary planning
export async function formatItinerary(
  rawJson: any,
  userTasteKeywords: string[],
  location: string
) {
  const entities = rawJson.results?.entities || rawJson.results?.insights || [];

  if (entities.length === 0) {
    return `I couldn't create a complete itinerary for ${location} right now. Try asking for specific recommendations like "Find restaurants in ${location}" or "What museums should I visit in ${location}"?`;
  }

  const prompt = `You are Zento, creating a personalized itinerary. The user wants to explore ${location}, and here are some recommendations.

Your Task: Create a fun, structured itinerary that flows naturally. Group activities logically and add cultural context.

User's Cultural Tastes: ${userTasteKeywords.join(", ")}

Guidelines:
- Create a day itinerary with timing suggestions
- Group activities by proximity or theme
- Add cultural context and local insights
- Keep it conversational and exciting
- Suggest 3-4 main activities with alternatives
- Include practical tips (best times, transportation)

Qloo Data: ${JSON.stringify(entities.slice(0, 5), null, 2)}

Your Itinerary Response:`;

  try {
    const response = await callGeminiWithFallback(prompt);
    return response;
  } catch (error) {
    console.error("Itinerary formatting failed:", error);

    // Fallback itinerary
    let response = `Here's a personalized ${location} itinerary based on your ${userTasteKeywords
      .slice(0, 2)
      .join(", ")} interests:\n\n`;

    entities.slice(0, 4).forEach((entity: any, index: number) => {
      const name = entity.name || entity.title || `Activity ${index + 1}`;
      const timeSlot =
        ["Morning", "Afternoon", "Evening", "Night"][index] || "Later";
      response += `**${timeSlot}:** ${name}\n`;
    });

    response += `\n👉 Want more specific details about any activity?\n👉 Looking for different types of experiences?`;

    return response;
  }
}

// -----------------------------------------------------------------------------
// New formatter for analysis intent
// -----------------------------------------------------------------------------
export async function formatAnalysis(rawJson: any) {
  const insights = rawJson.results?.insights || [];

  if (insights.length === 0) {
    return "I couldn't generate an analysis right now. Try refining your query or provide more context.";
  }

  const prompt = `You are the Zento analyst. Summarise the high-level insights in plain English (max 250 words). Focus on themes, commonalities, and standout patterns. Use bullet points and finish with one actionable suggestion.`;

  try {
    const response = await callGeminiWithFallback(
      `${prompt}\n\nData: ${JSON.stringify(
        insights.slice(0, 8),
        null,
        2
      )}\n\nSummary:`
    );
    return response;
  } catch (err) {
    console.error("Analysis formatting failed:", err);
    return (
      "Here are some key themes I noticed: " +
      insights
        .slice(0, 5)
        .map((i: any) => i.category || i.name || i.title)
        .filter(Boolean)
        .join(", ")
    );
  }
}

// -----------------------------------------------------------------------------
// New formatter for trending intent
// -----------------------------------------------------------------------------
export async function formatTrending(rawJson: any, location?: string) {
  const entities = rawJson.results?.entities || rawJson.results?.insights || [];

  if (entities.length === 0) {
    return `I couldn't find what's trending${
      location ? " in " + location : ""
    } right now. Try asking for specific recommendations instead.`;
  }

  const prompt = `You are the Zento trend-spotter. Create a concise list of what's trending${
    location ? " in " + location : ""
  }. Keep it breezy and under 200 words. For each item add one emoji and a short why-it-matters blurb.`;

  try {
    const response = await callGeminiWithFallback(
      `${prompt}\n\nData: ${JSON.stringify(
        entities.slice(0, 6),
        null,
        2
      )}\n\nTrends:`
    );
    return response;
  } catch (err) {
    console.error("Trending formatting failed:", err);
    return entities
      .slice(0, 6)
      .map(
        (e: any, idx: number) =>
          `${idx + 1}. ${(e.name || e.title) ?? "An item"}`
      )
      .join("\n");
  }
}
