"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ExternalLink,
  Heart,
  MapPin,
  Share,
  Star,
  ThumbsDown,
} from "lucide-react";
import { useState } from "react";

interface RecommendationCardProps {
  recommendation: {
    name: string;
    type: string;
    description: string;
    rating: number;
    location: string;
    priceRange: string;
    tags: string[]; // Should include URNs when possible
    imageUrl?: string;
    matchScore: number;
  };
}

export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const sendFeedback = async (action: "love" | "like" | "skip") => {
    const tagUrn = recommendation.tags?.find((t) => t.startsWith("urn:"));
    if (!tagUrn) return;

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagUrn, action }),
      });
    } catch (err) {
      console.error("feedback failed", err);
    }
  };

  const handleLove = () => {
    setIsLiked(true);
    sendFeedback("love");
  };

  const handleSkip = () => {
    setIsLiked(false);
    sendFeedback("skip");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recommendation.name,
        text: recommendation.description,
        url: window.location.href,
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 relative">
        {recommendation.imageUrl ? (
          <img
            src={recommendation.imageUrl || "/placeholder.svg"}
            alt={recommendation.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">🏛️</div>
              <div className="text-sm text-muted-foreground">
                {recommendation.type}
              </div>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 text-black">
            {recommendation.matchScore}% match
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{recommendation.name}</h3>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLove}
              className="h-8 w-8 text-red-500"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8 text-gray-400"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {recommendation.description}
        </p>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span>{recommendation.rating}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{recommendation.location}</span>
          </div>
          <Badge variant="outline">{recommendation.priceRange}</Badge>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {recommendation.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button className="w-full" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
