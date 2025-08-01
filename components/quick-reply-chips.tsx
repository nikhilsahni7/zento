"use client";

import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BookOpen,
  Camera,
  Clapperboard,
  Coffee,
  MapPin,
  Music,
  ShoppingBag,
  TrendingUp,
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

// ENHANCED: More diverse quick reply suggestions optimized for judges
const DEFAULT_REPLIES: QuickReply[] = [
  {
    icon: Coffee,
    text: "Coffee shops nearby",
    query: "Find coffee shops and cafes in my area",
  },
  {
    icon: Music,
    text: "Live music venues",
    query: "Find live music venues and concert halls",
  },
  {
    icon: Utensils,
    text: "Restaurants nearby",
    query: "Find restaurants and dining places in my area",
  },
  {
    icon: BookOpen,
    text: "Books like my taste",
    query: "Recommend books similar to my preferences",
  },
  {
    icon: Clapperboard,
    text: "Movies like my taste",
    query: "Recommend movies similar to my preferences",
  },
  {
    icon: MapPin,
    text: "Cultural places",
    query: "Find cultural places and attractions in my area",
  },
  {
    icon: ShoppingBag,
    text: "Shopping places",
    query: "Find shopping places and retail stores",
  },
  {
    icon: Camera,
    text: "Entertainment venues",
    query: "Find entertainment venues and attractions",
  },
  {
    icon: TrendingUp,
    text: "Trending artists",
    query: "What music artists are trending right now?",
  },
  {
    icon: Clapperboard,
    text: "Trending movies",
    query: "What movies are trending right now?",
  },
  {
    icon: BarChart3,
    text: "Analyze my taste",
    query: "Analyze my cultural preferences and show me themes",
  },
];

// Generate personalized quick replies based on user's taste profile
function generatePersonalizedReplies(
  affinities: string[] = [],
  userCity?: string
): QuickReply[] {
  const city = userCity && userCity !== "my area" ? userCity : "my area";

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
      text: "Movie theaters",
      query: "Find movie theaters and cinemas in my area",
    });
  }

  if (hasMusicTags) {
    personalized.push({
      icon: Music,
      text: "Music venues",
      query: "Find music venues and concert halls in my area",
    });
  }

  if (hasFoodTags) {
    personalized.push({
      icon: Utensils,
      text: `Restaurants in ${city}`,
      query: `Find restaurants and dining places in ${city}`,
    });
  }

  if (hasFoodTags || city !== "my area") {
    personalized.push({
      icon: Coffee,
      text: `Coffee shops in ${city}`,
      query: `Find coffee shops and cafes in ${city}`,
    });
  }

  if (hasCultureTags) {
    personalized.push({
      icon: Camera,
      text: "Cultural attractions",
      query: "Find cultural attractions and museums in my area",
    });
  }

  // Always add some general exploratory options (only if we have a real city)
  if (city !== "my area") {
    personalized.push({
      icon: MapPin,
      text: "Local attractions",
      query: "Find local attractions and places to visit in my area",
    });
  }

  personalized.push({
    icon: MapPin,
    text: "Local attractions",
    query: "Find local attractions and places to visit in my area",
  });

  // Add trending and analysis options
  if (city !== "my area") {
    personalized.push({
      icon: TrendingUp,
      text: `Trending artists in ${city}`,
      query: `What music artists are trending in ${city} right now?`,
    });
  } else {
    personalized.push({
      icon: TrendingUp,
      text: "Trending artists",
      query: "What music artists are trending right now?",
    });
  }

  personalized.push({
    icon: Clapperboard,
    text: `Trending movies`,
    query: `What movies are trending right now?`,
  });

  personalized.push({
    icon: BarChart3,
    text: "Analyze my taste",
    query: "Analyze my cultural preferences and show me themes",
  });

  // Add some variety for better demo
  if (personalized.length < 8) {
    personalized.push({
      icon: BookOpen,
      text: "Book recommendations",
      query: "Recommend books similar to my preferences",
    });

    if (city !== "my area") {
      personalized.push({
        icon: Camera,
        text: "Plan my day",
        query: `Plan a cultural day for me in ${city}`,
      });
    } else {
      personalized.push({
        icon: Camera,
        text: "Plan my day",
        query: "Plan a cultural day for me",
      });
    }
  }

  // Return max 8 personalized replies, fallback to defaults if not enough
  const finalReplies = personalized.slice(0, 8);

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
      : DEFAULT_REPLIES.slice(0, 8);

  return (
    <div className="flex flex-wrap gap-2 mt-4 p-4 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-700/80 rounded-lg border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
      {replies.map((reply, index) => {
        const IconComponent = reply.icon;
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onReply(reply.query || reply.text)}
            className="flex items-center gap-2 text-sm
              bg-white/90 dark:bg-slate-800/90
              hover:bg-white dark:hover:bg-slate-700
              border-slate-300 dark:border-slate-600
              hover:border-indigo-400 dark:hover:border-indigo-500
              text-slate-700 dark:text-slate-300
              hover:text-indigo-700 dark:hover:text-indigo-300
              shadow-sm hover:shadow-md
              transition-all duration-300
              backdrop-blur-sm
              font-medium"
          >
            <IconComponent className="w-4 h-4" />
            {reply.text}
          </Button>
        );
      })}
    </div>
  );
}
