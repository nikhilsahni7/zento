"use client";

import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Camera,
  Clapperboard,
  Coffee,
  MapPin,
  Music,
  ShoppingBag,
  Utensils,
} from "lucide-react";

interface QuickReplyChipsProps {
  onReply: (reply: string) => void;
  userAffinities?: string[];
  userCity?: string;
}

interface QuickReply {
  icon: any;
  text: string;
  query?: string;
}

// ENHANCED: More diverse quick reply suggestions
const DEFAULT_REPLIES: QuickReply[] = [
  {
    icon: Coffee,
    text: "Find great coffee shops",
    query:
      "Find unique coffee shops and cafes that match my vibe and cultural interests",
  },
  {
    icon: Music,
    text: "Live music venues",
    query:
      "Recommend live music venues and concert halls that feature artists similar to my taste",
  },
  {
    icon: Utensils,
    text: "Authentic restaurants",
    query:
      "Show me authentic local restaurants that match my cultural preferences",
  },
  {
    icon: BookOpen,
    text: "Books like my favorites",
    query: "Recommend books similar to my taste in stories and genres",
  },
  {
    icon: Clapperboard,
    text: "Movies in my taste",
    query:
      "Find cinemas, theaters, and entertainment venues that show the kind of content I love",
  },
  {
    icon: MapPin,
    text: "Hidden cultural gems",
    query:
      "Show me hidden cultural gems and authentic local experiences in my area",
  },
  {
    icon: ShoppingBag,
    text: "Unique shopping",
    query: "Find unique shopping experiences and local markets",
  },
  {
    icon: Camera,
    text: "Instagram-worthy spots",
    query: "Suggest photogenic cultural spots and experiences for great photos",
  },
];

// Generate personalized quick replies based on user's taste profile
function generatePersonalizedReplies(
  affinities: string[] = [],
  userCity?: string
): QuickReply[] {
  const city = userCity || "my area";

  // Analyze user's interests from their taste profile
  const hasMovieTags = affinities.some(
    (tag) =>
      tag.includes("media") ||
      tag.includes("drama") ||
      tag.includes("thriller") ||
      tag.includes("heist")
  );
  const hasMusicTags = affinities.some(
    (tag) =>
      tag.includes("music") ||
      tag.includes("bollywood") ||
      tag.includes("classical")
  );
  const hasFoodTags = affinities.some(
    (tag) =>
      tag.includes("cuisine") ||
      tag.includes("restaurant") ||
      tag.includes("indian") ||
      tag.includes("food")
  );
  const hasCultureTags = affinities.some(
    (tag) =>
      tag.includes("culture") || tag.includes("art") || tag.includes("heritage")
  );

  const personalized: QuickReply[] = [];

  // Add personalized suggestions based on their taste profile
  if (hasMovieTags) {
    personalized.push({
      icon: Clapperboard,
      text: "Thriller movie venues",
      query:
        "Find cinemas and theaters showing thriller and crime movies like my favorites",
    });
  }

  if (hasMusicTags) {
    personalized.push({
      icon: Music,
      text: "Concert halls nearby",
      query:
        "Recommend live music venues and concert halls for Bollywood and classical music",
    });
  }

  if (hasFoodTags) {
    personalized.push({
      icon: Utensils,
      text: `Indian cuisine in ${city}`,
      query: `Find authentic Indian restaurants and cultural dining experiences in ${city}`,
    });
  }

  if (hasCultureTags) {
    personalized.push({
      icon: Camera,
      text: "Cultural landmarks",
      query:
        "Show me museums, galleries, and cultural heritage sites worth visiting",
    });
  }

  // Always add some general exploratory options
  personalized.push({
    icon: Coffee,
    text: `Coffee culture in ${city}`,
    query: `Find unique coffee shops and cafes with cultural atmosphere in ${city}`,
  });

  personalized.push({
    icon: MapPin,
    text: "Weekend adventures",
    query:
      "Plan a cultural itinerary with must-see spots and local experiences",
  });

  // Return max 6 personalized replies, fallback to defaults if not enough
  const finalReplies = personalized.slice(0, 6);

  if (finalReplies.length < 4) {
    const remainingDefaults = DEFAULT_REPLIES.filter(
      (def) => !finalReplies.some((reply) => reply.text === def.text)
    ).slice(0, 4 - finalReplies.length);

    finalReplies.push(...remainingDefaults);
  }

  return finalReplies;
}

export function QuickReplyChips({
  onReply,
  userAffinities = [],
  userCity,
}: QuickReplyChipsProps) {
  // Generate personalized replies or use defaults
  const replies =
    userAffinities.length > 0
      ? generatePersonalizedReplies(userAffinities, userCity)
      : DEFAULT_REPLIES.slice(0, 6);

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {replies.map((reply, index) => {
        const IconComponent = reply.icon;
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onReply(reply.query || reply.text)}
            className="flex items-center gap-2 text-sm bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 transition-colors"
          >
            <IconComponent className="w-4 h-4" />
            {reply.text}
          </Button>
        );
      })}
    </div>
  );
}
