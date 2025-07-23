import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const model = openai("gpt-4o", { apiKey: OPENAI_API_KEY });

// Mock Qloo API integration (replace with actual Qloo API calls)
async function getQlooRecommendations(affinities: any[], query: string) {
  // This would be replaced with actual Qloo API calls
  const mockRecommendations = [
    {
      name: "Nobu Tokyo",
      type: "Japanese Restaurant",
      description:
        "World-renowned sushi restaurant with innovative fusion cuisine",
      rating: 4.8,
      location: "Minato City, Tokyo",
      priceRange: "$$$",
      tags: ["Sushi", "Fine Dining", "Celebrity Chef"],
      matchScore: 95,
    },
    {
      name: "Tsukiji Outer Market",
      type: "Food Market",
      description:
        "Historic fish market with authentic street food and fresh seafood",
      rating: 4.6,
      location: "Chuo City, Tokyo",
      priceRange: "$",
      tags: ["Street Food", "Authentic", "Historic"],
      matchScore: 88,
    },
    {
      name: "Robot Restaurant",
      type: "Entertainment Venue",
      description:
        "Futuristic dinner show with robots, lasers, and Japanese pop culture",
      rating: 4.2,
      location: "Shinjuku, Tokyo",
      priceRange: "$$",
      tags: ["Entertainment", "Unique", "Pop Culture"],
      matchScore: 82,
    },
  ];

  return mockRecommendations;
}

async function generateItinerary(
  affinities: any[],
  destination: string,
  duration: string
) {
  // Mock itinerary generation (replace with actual logic)
  const mockItinerary = {
    title: `Cultural Tokyo Experience - ${duration}`,
    duration: duration,
    days: [
      {
        day: 1,
        date: "March 15, 2024",
        activities: [
          {
            time: "9:00 AM",
            name: "Tsukiji Outer Market",
            type: "Food Experience",
            location: "Chuo City, Tokyo",
            duration: "2 hours",
            description:
              "Start your day with fresh sushi and traditional Japanese breakfast at the famous fish market",
          },
          {
            time: "12:00 PM",
            name: "TeamLab Borderless",
            type: "Digital Art Museum",
            location: "Odaiba, Tokyo",
            duration: "3 hours",
            description:
              "Immersive digital art experience that combines technology with creativity",
          },
          {
            time: "7:00 PM",
            name: "Nobu Tokyo",
            type: "Fine Dining",
            location: "Minato City, Tokyo",
            duration: "2 hours",
            description:
              "World-class Japanese fusion cuisine in an elegant setting",
          },
        ],
      },
      {
        day: 2,
        date: "March 16, 2024",
        activities: [
          {
            time: "10:00 AM",
            name: "Senso-ji Temple",
            type: "Cultural Site",
            location: "Asakusa, Tokyo",
            duration: "2 hours",
            description:
              "Tokyo's oldest temple with traditional architecture and spiritual significance",
          },
          {
            time: "2:00 PM",
            name: "Harajuku District",
            type: "Cultural District",
            location: "Shibuya, Tokyo",
            duration: "3 hours",
            description:
              "Explore youth culture, fashion, and unique street art in Tokyo's most vibrant district",
          },
          {
            time: "8:00 PM",
            name: "Robot Restaurant",
            type: "Entertainment",
            location: "Shinjuku, Tokyo",
            duration: "2 hours",
            description:
              "Futuristic dinner show combining robots, music, and Japanese pop culture",
          },
        ],
      },
    ],
  };

  return mockItinerary;
}

export async function POST(request: NextRequest) {
  try {
    const { message, affinities, history } = await request.json();

    // Determine intent and route to appropriate agent
    const isRecommendationQuery =
      message.toLowerCase().includes("recommend") ||
      message.toLowerCase().includes("suggest") ||
      message.toLowerCase().includes("find");

    const isItineraryQuery =
      message.toLowerCase().includes("itinerary") ||
      message.toLowerCase().includes("plan") ||
      message.toLowerCase().includes("trip");

    // Build context from user affinities
    const affinityContext = affinities
      .map((a: any) => `${a.type}: ${a.id}`)
      .join(", ");

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Missing OPENAI_API_KEY. Set it in your Vercel / local env (e.g. `.env.local`).",
        },
        { status: 500 }
      );
    }

    if (isRecommendationQuery) {
      // Get recommendations from Qloo API
      const recommendations = await getQlooRecommendations(affinities, message);

      // Generate contextual response with Gemini
      const { text } = await generateText({
        model: model,
        system: `You are a sophisticated cultural concierge AI with deep knowledge of global cuisine, entertainment, and travel. Your personality is warm, knowledgeable, and slightly playful. You understand cultural nuances and can make connections across different domains (film → restaurants, music → travel destinations, etc.).

User's taste profile: ${affinityContext}

Provide personalized recommendations that connect to their established preferences. Be specific about why each recommendation matches their taste, and include cultural context that enhances the experience.`,
        prompt: `Based on the user's request: "${message}" and their taste profile, I've found these recommendations. Please provide a warm, personalized response explaining why these match their taste and include cultural insights:

${JSON.stringify(recommendations, null, 2)}`,
      });

      return NextResponse.json({
        content: text,
        type: "recommendations",
        data: { recommendations },
      });
    }

    if (isItineraryQuery) {
      // Extract destination and duration from message
      const destination = "Tokyo"; // This would be extracted from the message
      const duration = "2 days"; // This would be extracted from the message

      const itinerary = await generateItinerary(
        affinities,
        destination,
        duration
      );

      const { text } = await generateText({
        model: model,
        system: `You are a sophisticated cultural concierge AI specializing in creating immersive, taste-driven itineraries. Your personality is enthusiastic, detail-oriented, and culturally savvy.

User's taste profile: ${affinityContext}

Create itineraries that reflect the user's cultural preferences and provide rich context about each experience. Connect activities to their established tastes and explain the cultural significance.`,
        prompt: `I've created a personalized ${duration} itinerary for ${destination} based on the user's request: "${message}" and their taste profile. Please provide an engaging introduction to this itinerary, explaining how it connects to their preferences:

${JSON.stringify(itinerary, null, 2)}`,
      });

      return NextResponse.json({
        content: text,
        type: "itinerary",
        data: itinerary,
      });
    }

    // General conversation with Gemini
    const { text } = await generateText({
      model: model,
      system: `You are a sophisticated cultural concierge AI with expertise in global cuisine, entertainment, travel, and cultural experiences. Your personality is warm, knowledgeable, and engaging.

User's taste profile: ${affinityContext}

You help users discover cultural experiences that match their taste. You can:
- Recommend restaurants, bars, and food experiences
- Suggest cultural activities, museums, and entertainment
- Plan detailed itineraries and cultural tours
- Make cross-domain connections (e.g., film preferences → restaurant recommendations)
- Provide cultural context and insider knowledge

Always personalize responses based on their taste profile and be specific about why recommendations match their preferences.`,
      prompt: `User message: "${message}"

Previous conversation context:
${history
  .slice(-3)
  .map((h: any) => `${h.role}: ${h.content}`)
  .join("\n")}

Respond in a helpful, engaging way that acknowledges their taste profile and offers specific cultural recommendations or insights.`,
    });

    return NextResponse.json({
      content: text,
      type: "text",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
