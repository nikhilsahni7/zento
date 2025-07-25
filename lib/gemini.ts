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

// FIXED: Models with proper fallback strategy
const MODELS = {
  primary: "gemini-2.0-flash",
  fallback: "gemini-1.5-flash",
  backup: "gemini-1.5-pro",
};

// FIXED: Add JSON response configuration
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
      maxOutputTokens: 1000,
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
    };

    // FIXED: Set JSON response mode for structured output
    if (requestJson) {
      config.responseMimeType = "application/json";
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

    // Check if it's a rate limit, API key, or model unavailable error
    if (error.status === 503 || error.status === 429 || error.status === 400) {
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

// FIXED: Extract keywords with proper JSON mode
export async function extractKeywords(text: string): Promise<string[]> {
  const prompt = `Extract EXACTLY 3-5 key genres, themes, or keywords from this title. Return ONLY a JSON array of strings.

Examples:
- "Blade Runner" → ["Science Fiction", "Cyberpunk", "Neo-Noir", "Dystopian"]
- "Tame Impala" → ["Psychedelic Rock", "Indie Pop", "Electronic"]
- "Tokyo" → ["Japanese Culture", "Urban Life", "Modern City"]

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
    // Smart fallback based on text analysis
    const words = text.toLowerCase().split(/\s+/);
    return words
      .slice(0, 3)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  }
}

// ---------- INTENT PARSING (Gemini Prompt #1) - EXACT FROM PLAN ----------

const intentSchema = z.object({
  intent: z.enum(["recommendation", "itinerary", "refine"]),
  target_category: z.string(),
  signals: z.object({
    tags_to_find: z.array(z.string()),
    location_query: z.string().nullable(),
  }),
});

export type ParsedIntent = z.infer<typeof intentSchema>;

interface IntentPromptParams {
  message: string;
  affinityKeywords: string[]; // Friendly names translated from URNs
  history: { role: "user" | "assistant"; content: string }[];
}

// FIXED: Parse intent with structured JSON output
export async function parseIntent({
  message,
  affinityKeywords,
  history,
}: IntentPromptParams): Promise<ParsedIntent> {
  const prompt = `You are an AI assistant that converts natural language to structured commands. Return ONLY valid JSON.

User's Taste: ${JSON.stringify(affinityKeywords.slice(0, 10))}
Recent Chat: ${history
    .slice(-3)
    .map((m) => `${m.role}: ${m.content}`)
    .join(" | ")}
User Message: "${message}"

Analyze the message and return this JSON structure:
{
  "intent": "recommendation|itinerary|refine",
  "target_category": "urn:entity:place|book|movie|artist",
  "signals": {
    "tags_to_find": ["keyword1", "keyword2"],
    "location_query": "city name or null"
  }
}

For entity types:
- Entertainment venues, restaurants, cafes → "urn:entity:place"
- Books, novels → "urn:entity:book"
- Movies, TV shows → "urn:entity:movie"
- Music artists, bands → "urn:entity:artist"

JSON Response:`;

  try {
    const text = await callGeminiWithFallback(prompt, true); // Request JSON
    const parsed = JSON.parse(text);

    return intentSchema.parse(parsed);
  } catch (error) {
    console.error("Intent parsing failed:", error);

    // ENHANCED: More comprehensive entity type detection
    let target_category = "urn:entity:place"; // default
    const msg = message.toLowerCase();

    // Books & Literature
    if (
      msg.includes("book") ||
      msg.includes("read") ||
      msg.includes("novel") ||
      msg.includes("literature") ||
      msg.includes("author")
    ) {
      target_category = "urn:entity:book";
    }
    // Movies & TV
    else if (
      msg.includes("movie") ||
      msg.includes("film") ||
      msg.includes("tv") ||
      msg.includes("cinema") ||
      msg.includes("watch") ||
      msg.includes("director")
    ) {
      target_category = "urn:entity:movie";
    }
    // Music & Artists
    else if (
      msg.includes("music") ||
      msg.includes("artist") ||
      msg.includes("song") ||
      msg.includes("concert") ||
      msg.includes("live music") ||
      msg.includes("band") ||
      msg.includes("album")
    ) {
      target_category = "urn:entity:artist";
    }
    // Brands & Shopping (if available)
    else if (
      msg.includes("brand") ||
      msg.includes("product") ||
      msg.includes("shopping") ||
      msg.includes("store") ||
      msg.includes("buy")
    ) {
      target_category = "urn:entity:brand";
    }
    // Places (restaurants, venues, attractions, etc.)
    else {
      target_category = "urn:entity:place";
    }

    // ENHANCED: More specific keyword extraction by category
    const keywords = [];

    // Food & Dining
    if (msg.includes("coffee") || msg.includes("cafe"))
      keywords.push("coffee", "cafe");
    if (
      msg.includes("restaurant") ||
      msg.includes("dining") ||
      msg.includes("food")
    )
      keywords.push("restaurant", "dining");
    if (
      msg.includes("bar") ||
      msg.includes("cocktail") ||
      msg.includes("drink")
    )
      keywords.push("bar", "cocktail");

    // Entertainment & Culture
    if (msg.includes("music") || msg.includes("concert"))
      keywords.push("live music", "concert hall");
    if (msg.includes("theater") || msg.includes("cinema"))
      keywords.push("theater", "cinema");
    if (msg.includes("museum") || msg.includes("gallery"))
      keywords.push("museum", "gallery");

    // Shopping & Retail
    if (
      msg.includes("shopping") ||
      msg.includes("mall") ||
      msg.includes("store")
    )
      keywords.push("shopping", "retail");

    // Activities & Recreation
    if (msg.includes("park") || msg.includes("outdoor"))
      keywords.push("park", "outdoor");
    if (msg.includes("gym") || msg.includes("fitness"))
      keywords.push("gym", "fitness");

    // Cultural & Local
    if (msg.includes("cultural") || msg.includes("authentic"))
      keywords.push("cultural", "authentic");
    if (msg.includes("local") || msg.includes("hidden"))
      keywords.push("local", "hidden gems");

    return {
      intent:
        msg.includes("plan") || msg.includes("itinerary")
          ? "itinerary"
          : "recommendation",
      target_category,
      signals: {
        tags_to_find: keywords.length > 0 ? keywords : [message.split(" ")[0]], // First word as fallback
        location_query: null,
      },
    };
  }
}

// ---------- RESPONSE GENERATION (Gemini Prompt #2) - EXACT FROM PLAN ----------

export async function formatRecommendations(
  rawJson: any,
  userTasteKeywords: string[]
) {
  const entities = rawJson.results?.entities || rawJson.results?.insights || [];

  if (entities.length === 0) {
    return "I couldn't find specific recommendations right now. Could you try being more specific? Like 'Italian restaurants in downtown' or 'sci-fi books like Blade Runner'? 😊";
  }

  // EXACT prompt template from plan.md
  const prompt = `You are the Cultural Compass, a friendly and insightful AI concierge. The user asked for a recommendation, and here is the data we found.

Your Task: Write a fun, engaging, and conversational response. Present the recommendations clearly. For each one, add a short "Why you'll like it:" sentence that connects the recommendation back to the user's known tastes.

User's Known Tastes: ${userTasteKeywords.join(", ")}

Examples of "Why you'll like it" connections:
- "Based on your love for Blade Runner, you'll enjoy this book's dystopian themes."
- "Since you're into Tame Impala, this venue's psychedelic atmosphere will resonate with you."
- "Given your taste for Tokyo's culture, this restaurant captures that same authentic spirit."

Keep the response conversational, under 250 words, and end with 1-2 action suggestions.

Qloo Recommendation Data: ${JSON.stringify(entities.slice(0, 4), null, 2)}

Your Conversational Response:`;

  try {
    const response = await callGeminiWithFallback(prompt);
    return response;
  } catch (error) {
    console.error("Response formatting failed:", error);

    // Fallback with basic personalization
    let response = `Based on your taste for ${userTasteKeywords
      .slice(0, 3)
      .join(", ")}, here's what I found:\n\n`;

    entities.slice(0, 3).forEach((entity: any, index: number) => {
      const name = entity.name || entity.title || `Option ${index + 1}`;
      const reason =
        userTasteKeywords.length > 0
          ? `Perfect match for your ${userTasteKeywords[0]} interests!`
          : "A great recommendation for you!";
      response += `**${name}** - ${reason}\n`;
    });

    response += `\n👉 Want more details?\n👉 Try a different search?`;

    return response;
  }
}
