"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Film, UtensilsCrossed, MapPin, Sparkles, ArrowLeft } from "lucide-react"
import confetti from "canvas-confetti"

interface OnboardingWizardProps {
  onComplete: (affinities: any[]) => void
}

const SAMPLE_FILMS = [
  { id: "pulp-fiction", name: "Pulp Fiction", genre: "Crime/Drama", emoji: "🎬" },
  { id: "spirited-away", name: "Spirited Away", genre: "Animation", emoji: "✨" },
  { id: "the-grand-budapest", name: "The Grand Budapest Hotel", genre: "Comedy/Drama", emoji: "🏨" },
  { id: "parasite", name: "Parasite", genre: "Thriller", emoji: "🎭" },
  { id: "moonlight", name: "Moonlight", genre: "Drama", emoji: "🌙" },
  { id: "mad-max", name: "Mad Max: Fury Road", genre: "Action", emoji: "🚗" },
]

const SAMPLE_CUISINES = [
  { id: "japanese", name: "Japanese", type: "Sushi & Ramen", emoji: "🍣" },
  { id: "italian", name: "Italian", type: "Pasta & Pizza", emoji: "🍝" },
  { id: "mexican", name: "Mexican", type: "Tacos & Mole", emoji: "🌮" },
  { id: "indian", name: "Indian", type: "Curry & Tandoor", emoji: "🍛" },
  { id: "french", name: "French", type: "Bistro & Patisserie", emoji: "🥐" },
  { id: "korean", name: "Korean", type: "BBQ & Kimchi", emoji: "🥢" },
]

const SAMPLE_DESTINATIONS = [
  { id: "tokyo", name: "Tokyo", vibe: "Urban & Traditional", emoji: "🏯" },
  { id: "paris", name: "Paris", vibe: "Romantic & Artistic", emoji: "🗼" },
  { id: "barcelona", name: "Barcelona", vibe: "Vibrant & Coastal", emoji: "🏖️" },
  { id: "istanbul", name: "Istanbul", vibe: "Historic & Exotic", emoji: "🕌" },
  { id: "new-york", name: "New York", vibe: "Fast-paced & Diverse", emoji: "🏙️" },
  { id: "bali", name: "Bali", vibe: "Tropical & Spiritual", emoji: "🌺" },
]

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [selectedFilm, setSelectedFilm] = useState<string>("")
  const [selectedCuisine, setSelectedCuisine] = useState<string>("")
  const [selectedDestination, setSelectedDestination] = useState<string>("")
  const [customInput, setCustomInput] = useState("")

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      const affinities = [
        { type: "film", id: selectedFilm, category: "entertainment" },
        { type: "cuisine", id: selectedCuisine, category: "food" },
        { type: "destination", id: selectedDestination, category: "travel" },
      ]

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8B5CF6", "#06B6D4", "#EC4899", "#F59E0B"],
      })

      setTimeout(() => onComplete(affinities), 1000)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedFilm !== ""
      case 2:
        return selectedCuisine !== ""
      case 3:
        return selectedDestination !== ""
      default:
        return false
    }
  }

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <Film className="h-5 w-5" />
      case 2:
        return <UtensilsCrossed className="h-5 w-5" />
      case 3:
        return <MapPin className="h-5 w-5" />
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Pick a favorite film"
      case 2:
        return "Choose your favorite cuisine"
      case 3:
        return "Select a dream destination"
      default:
        return ""
    }
  }

  const getCurrentData = () => {
    switch (step) {
      case 1:
        return SAMPLE_FILMS
      case 2:
        return SAMPLE_CUISINES
      case 3:
        return SAMPLE_DESTINATIONS
      default:
        return []
    }
  }

  const getCurrentSelection = () => {
    switch (step) {
      case 1:
        return selectedFilm
      case 2:
        return selectedCuisine
      case 3:
        return selectedDestination
      default:
        return ""
    }
  }

  const handleSelection = (id: string) => {
    switch (step) {
      case 1:
        setSelectedFilm(id)
        break
      case 2:
        setSelectedCuisine(id)
        break
      case 3:
        setSelectedDestination(id)
        break
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <Card className="w-full max-w-4xl relative z-10 border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl animate-scale-in">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-purple-600 animate-pulse" />
              <div className="absolute inset-0 h-12 w-12 text-purple-400 animate-ping opacity-30">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
          </div>

          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent font-playfair mb-4">
            Welcome to Cultural AI Concierge
          </CardTitle>

          <CardDescription className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Let's learn about your taste to provide personalized recommendations that match your unique style
          </CardDescription>

          {/* Progress Indicator */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500
                    ${
                      i <= step
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 border-purple-500 text-white shadow-lg"
                        : "border-slate-300 dark:border-slate-600 text-slate-400"
                    }
                  `}
                  >
                    {i < step ? (
                      <div className="animate-scale-in">✓</div>
                    ) : i === step ? (
                      <div className="animate-pulse">{getStepIcon(i)}</div>
                    ) : (
                      getStepIcon(i)
                    )}
                  </div>
                  {i < 3 && (
                    <div
                      className={`
                      w-16 h-0.5 mx-2 transition-all duration-500
                      ${i < step ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-slate-200 dark:bg-slate-700"}
                    `}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-8">
          <div className="animate-slide-in-up">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 px-6 py-3 rounded-full">
                {getStepIcon(step)}
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 font-space-grotesk">
                  {getStepTitle()}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {getCurrentData().map((item: any, index) => (
                <Card
                  key={item.id}
                  className={`
                    cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group
                    ${
                      getCurrentSelection() === item.id
                        ? "ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 shadow-lg"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    }
                  `}
                  onClick={() => handleSelection(item.id)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {item.emoji}
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2 font-space-grotesk">
                      {item.name}
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                    >
                      {item.genre || item.type || item.vibe}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {step === 3 && (
              <div className="mt-8 max-w-md mx-auto animate-fade-in">
                <Label htmlFor="custom-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Or tell us something unique about your taste:
                </Label>
                <Input
                  id="custom-input"
                  placeholder="e.g., I love hidden speakeasies and indie bookstores..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="mt-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed px-8"
            >
              <span className="font-medium">{step === 3 ? "Start Exploring" : "Next"}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
