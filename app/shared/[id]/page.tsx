"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface SharedItineraryPageProps {
  params: {
    id: string
  }
}

export default function SharedItineraryPage({ params }: SharedItineraryPageProps) {
  const [itinerary, setItinerary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Decode the shared itinerary data
      const decodedData = atob(params.id)
      const itineraryData = JSON.parse(decodedData)
      setItinerary(itineraryData)
    } catch (error) {
      console.error("Failed to decode shared itinerary:", error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading shared itinerary...</p>
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Itinerary Not Found</h1>
          <p className="text-muted-foreground mb-4">The shared itinerary could not be loaded.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Shared Itinerary</h1>
          </div>
          <Link href="/">
            <Button>Create Your Own</Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{itinerary.title}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {itinerary.duration}
              </Badge>
              <Badge variant="secondary">Shared Itinerary</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {itinerary.days?.map((day: any) => (
              <div key={day.day} className="border-l-2 border-purple-200 pl-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {day.day}
                  </div>
                  <h3 className="font-semibold">Day {day.day}</h3>
                  <span className="text-sm text-muted-foreground">{day.date}</span>
                </div>

                <div className="space-y-3">
                  {day.activities?.map((activity: any, index: number) => (
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

            <div className="pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Want to create your own personalized cultural itinerary?
              </p>
              <Link href="/">
                <Button size="lg">Start Your Cultural Journey</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
