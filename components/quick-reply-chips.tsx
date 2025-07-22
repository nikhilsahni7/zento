"use client"

import { Button } from "@/components/ui/button"
import { MapPin, UtensilsCrossed, Calendar, Compass, Coffee, Camera } from "lucide-react"

interface QuickReplyChipsProps {
  onReply: (reply: string) => void
}

const QUICK_REPLIES = [
  {
    icon: UtensilsCrossed,
    text: "Find restaurants like my favorites",
    query: "Recommend restaurants based on my taste profile",
  },
  {
    icon: MapPin,
    text: "Plan a weekend itinerary",
    query: "Create a 2-day cultural itinerary for my city",
  },
  {
    icon: Calendar,
    text: "What's happening this weekend?",
    query: "What cultural events and activities are happening this weekend?",
  },
  {
    icon: Compass,
    text: "Discover hidden gems",
    query: "Show me hidden cultural gems and local favorites",
  },
  {
    icon: Coffee,
    text: "Coffee shop recommendations",
    query: "Find unique coffee shops that match my vibe",
  },
  {
    icon: Camera,
    text: "Instagram-worthy spots",
    query: "Suggest photogenic cultural spots and experiences",
  },
]

export function QuickReplyChips({ onReply }: QuickReplyChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {QUICK_REPLIES.map((reply, index) => {
        const Icon = reply.icon
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onReply(reply.query)}
            className="flex items-center space-x-2 text-xs"
          >
            <Icon className="h-3 w-3" />
            <span>{reply.text}</span>
          </Button>
        )
      })}
    </div>
  )
}
