"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Share, Download, Calendar } from "lucide-react"
import { useState } from "react"
import confetti from "canvas-confetti"

interface ItineraryCardProps {
  itinerary: {
    title: string
    duration: string
    days: Array<{
      day: number
      date: string
      activities: Array<{
        time: string
        name: string
        type: string
        location: string
        duration: string
        description: string
      }>
    }>
  }
}

export function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const [isLocked, setIsLocked] = useState(false)

  const handleLockIn = () => {
    setIsLocked(true)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const handleShare = async () => {
    // Generate shareable link
    const shareData = {
      title: itinerary.title,
      text: `Check out this ${itinerary.duration} itinerary!`,
      url: `${window.location.origin}/shared/${btoa(JSON.stringify(itinerary))}`,
    }

    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{itinerary.title}</CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {itinerary.duration}
              </Badge>
              {isLocked && <Badge className="bg-green-100 text-green-800">✓ Locked In</Badge>}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {itinerary.days.map((day) => (
          <div key={day.day} className="border-l-2 border-purple-200 pl-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {day.day}
              </div>
              <h3 className="font-semibold">Day {day.day}</h3>
              <span className="text-sm text-muted-foreground">{day.date}</span>
            </div>

            <div className="space-y-3">
              {day.activities.map((activity, index) => (
                <Card key={index} className="bg-gray-50 dark:bg-gray-900">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">{activity.time}</span>
                        <Badge variant="secondary" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.duration}</span>
                    </div>

                    <h4 className="font-semibold mb-1">{activity.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {activity.location}
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {!isLocked && (
          <div className="pt-4 border-t">
            <Button onClick={handleLockIn} className="w-full" size="lg">
              🎯 Lock In This Itinerary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
