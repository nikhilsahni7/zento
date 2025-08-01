"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PersonalizationBannerProps {
  affinities: any[];
}

export function PersonalizationBanner({
  affinities,
}: PersonalizationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [personalizedMessage, setPersonalizedMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (affinities.length > 0) {
      setIsAnimating(true);
      const messages = [
        "I'm learning you have exquisite taste in cinema and cuisine ✨",
        "Your cultural preferences are helping me curate better recommendations 🎭",
        "I notice you appreciate both artistic films and authentic flavors 🍿",
        "Your taste profile suggests you enjoy immersive cultural experiences 🌟",
        "Based on your preferences, I can suggest amazing hidden gems 💎",
        "Your sophisticated taste is opening doors to unique discoveries 🚪",
      ];
      setPersonalizedMessage(
        messages[Math.floor(Math.random() * messages.length)]
      );

      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [affinities]);

  if (!isVisible || !personalizedMessage) return null;

  return (
    <div className="container py-4">
      <Card
        className={`
        relative overflow-hidden border-0 shadow-lg
        bg-gradient-to-r from-violet-50/90 via-purple-50/90 to-cyan-50/90
        dark:from-violet-950/30 dark:via-purple-950/30 dark:to-cyan-950/30
        backdrop-blur-sm
        ${isAnimating ? "animate-pulse-gentle" : ""}
        transition-all duration-500 hover:shadow-xl
      `}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-violet-300/30 dark:bg-violet-600/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-300/30 dark:bg-cyan-600/20 rounded-full blur-xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-xl animate-pulse-slow"></div>
        </div>

        <div className="relative flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full shadow-lg">
                <Brain className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-bounce">
                <TrendingUp className="h-2 w-2 text-white ml-0.5 mt-0.5" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium text-slate-800 dark:text-slate-200 font-space-grotesk">
                {personalizedMessage}
              </p>

              <div className="flex flex-wrap gap-2">
                {affinities.slice(0, 3).map((affinity, index) => {
                  // Parse Qloo URN to extract meaningful display name
                  // Example: "urn:tag:genre:media:action" -> "Action"
                  const displayName =
                    typeof affinity === "string"
                      ? affinity
                          .replace(/^urn:tag:[^:]+:/, "")
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())
                      : affinity?.name || affinity?.id || "Unknown";

                  return (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`
                        text-xs px-3 py-1
                        bg-white/80 dark:bg-slate-800/80
                        text-slate-700 dark:text-slate-300
                        border border-violet-300/70 dark:border-violet-600/70
                        hover:bg-white/95 dark:hover:bg-slate-800/95
                        hover:border-violet-400 dark:hover:border-violet-500
                        transition-all duration-300
                        animate-fade-in
                        font-semibold
                        shadow-sm
                      `}
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <span className="capitalize">{displayName}</span>
                    </Badge>
                  );
                })}
                {affinities.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs
                      bg-white/80 dark:bg-slate-800/80
                      border-violet-300/70 dark:border-violet-600/70
                      text-slate-700 dark:text-slate-300
                      hover:bg-white/95 dark:hover:bg-slate-800/95
                      hover:border-violet-400 dark:hover:border-violet-500
                      animate-fade-in font-semibold shadow-sm"
                    style={{ animationDelay: "600ms" }}
                  >
                    +{affinities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
