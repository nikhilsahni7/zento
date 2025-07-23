"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/lib/auth-client";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Film,
  MapPin,
  Music,
  Sparkles,
  Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";

interface OnboardingWizardProps {
  onComplete: (affinities: any[]) => void;
}

// Enhanced data with more comprehensive options
const onboardingData = {
  1: {
    title: "What type of movies do you love?",
    subtitle: "Help us understand your cinematic taste",
    icon: Film,
    data: [
      {
        id: "action",
        name: "Action & Adventure",
        description: "High-octane thrills and excitement",
      },
      {
        id: "comedy",
        name: "Comedy",
        description: "Laughs and light-hearted entertainment",
      },
      {
        id: "drama",
        name: "Drama",
        description: "Emotional storytelling and character depth",
      },
      {
        id: "horror",
        name: "Horror",
        description: "Spine-chilling suspense and scares",
      },
      {
        id: "romance",
        name: "Romance",
        description: "Love stories and emotional connections",
      },
      {
        id: "sci-fi",
        name: "Sci-Fi",
        description: "Futuristic worlds and technology",
      },
      {
        id: "documentary",
        name: "Documentary",
        description: "Real stories and educational content",
      },
      {
        id: "animation",
        name: "Animation",
        description: "Animated films and cartoons",
      },
      {
        id: "thriller",
        name: "Thriller",
        description: "Edge-of-your-seat suspense",
      },
      {
        id: "fantasy",
        name: "Fantasy",
        description: "Magical worlds and mythological stories",
      },
    ],
  },
  2: {
    title: "What cuisine makes your mouth water?",
    subtitle: "Let's explore your culinary preferences",
    icon: Utensils,
    data: [
      {
        id: "italian",
        name: "Italian",
        description: "Pasta, pizza, and Mediterranean flavors",
      },
      {
        id: "japanese",
        name: "Japanese",
        description: "Sushi, ramen, and authentic Japanese dishes",
      },
      {
        id: "mexican",
        name: "Mexican",
        description: "Tacos, spicy flavors, and vibrant cuisine",
      },
      {
        id: "chinese",
        name: "Chinese",
        description: "Dim sum, stir-fry, and traditional dishes",
      },
      {
        id: "indian",
        name: "Indian",
        description: "Curries, spices, and rich flavors",
      },
      {
        id: "french",
        name: "French",
        description: "Fine dining and culinary artistry",
      },
      {
        id: "thai",
        name: "Thai",
        description: "Sweet, sour, and spicy Southeast Asian flavors",
      },
      {
        id: "mediterranean",
        name: "Mediterranean",
        description: "Fresh, healthy, and flavorful dishes",
      },
      {
        id: "american",
        name: "American",
        description: "Classic comfort food and BBQ",
      },
      {
        id: "korean",
        name: "Korean",
        description: "K-BBQ, kimchi, and fermented flavors",
      },
    ],
  },
  3: {
    title: "Which music genres move your soul?",
    subtitle: "Share your musical preferences with us",
    icon: Music,
    data: [
      {
        id: "pop",
        name: "Pop",
        description: "Catchy melodies and mainstream hits",
      },
      {
        id: "rock",
        name: "Rock",
        description: "Guitar-driven and energetic music",
      },
      {
        id: "jazz",
        name: "Jazz",
        description: "Improvisation and sophisticated harmonies",
      },
      {
        id: "classical",
        name: "Classical",
        description: "Orchestral and timeless compositions",
      },
      {
        id: "hip-hop",
        name: "Hip-Hop",
        description: "Rhythmic beats and lyrical expression",
      },
      {
        id: "electronic",
        name: "Electronic",
        description: "Synthesized sounds and dance beats",
      },
      {
        id: "indie",
        name: "Indie",
        description: "Independent and alternative sounds",
      },
      {
        id: "folk",
        name: "Folk",
        description: "Traditional and acoustic storytelling",
      },
      {
        id: "r&b",
        name: "R&B/Soul",
        description: "Smooth vocals and emotional depth",
      },
      {
        id: "world",
        name: "World Music",
        description: "Global sounds and cultural fusion",
      },
    ],
  },
  4: {
    title: "What destinations call to you?",
    subtitle: "Tell us about your travel dreams",
    icon: MapPin,
    data: [
      {
        id: "urban",
        name: "Urban Cities",
        description: "Bustling metropolises and city life",
      },
      {
        id: "beach",
        name: "Beach & Coastal",
        description: "Ocean views and relaxation",
      },
      {
        id: "mountains",
        name: "Mountains",
        description: "Alpine adventures and scenic views",
      },
      {
        id: "cultural",
        name: "Cultural Sites",
        description: "Museums, temples, and historical places",
      },
      {
        id: "nature",
        name: "Nature & Wildlife",
        description: "National parks and natural wonders",
      },
      {
        id: "adventure",
        name: "Adventure Sports",
        description: "Thrilling outdoor activities",
      },
      {
        id: "luxury",
        name: "Luxury Resorts",
        description: "High-end accommodations and spas",
      },
      {
        id: "backpacking",
        name: "Backpacking",
        description: "Budget travel and authentic experiences",
      },
      {
        id: "food-tour",
        name: "Food Tourism",
        description: "Culinary adventures and local cuisine",
      },
      {
        id: "art-culture",
        name: "Art & Culture",
        description: "Galleries, festivals, and cultural events",
      },
    ],
  },
};

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { data: session, isPending: isLoading } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState<{ [key: number]: string[] }>({});
  const [isCompleting, setIsCompleting] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    if (session?.user) {
      const progressKey = `onboarding_progress_${session.user.id}`;
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        try {
          const { step, selections: savedSelections } =
            JSON.parse(savedProgress);
          setCurrentStep(step);
          setSelections(savedSelections);
        } catch (error) {
          console.error("Error loading onboarding progress:", error);
        }
      }
    }
  }, [session]);

  // Save progress whenever selections change
  useEffect(() => {
    if (session?.user && Object.keys(selections).length > 0) {
      const progressKey = `onboarding_progress_${session.user.id}`;
      localStorage.setItem(
        progressKey,
        JSON.stringify({ step: currentStep, selections })
      );
    }
  }, [currentStep, selections, session]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      // Convert selections to affinities format
      const affinities = Object.entries(selections).flatMap(([step, items]) => {
        const stepData =
          onboardingData[parseInt(step) as keyof typeof onboardingData];
        return items.map((itemId) => {
          const item = stepData.data.find((d) => d.id === itemId);
          return {
            type: stepData.title.toLowerCase().includes("movie")
              ? "movie_genre"
              : stepData.title.toLowerCase().includes("cuisine")
              ? "cuisine"
              : stepData.title.toLowerCase().includes("music")
              ? "music_genre"
              : "travel_destination",
            id: itemId,
            name: item?.name || itemId,
            description: item?.description || "",
          };
        });
      });

      // Clear progress since we're completing
      if (session?.user) {
        const progressKey = `onboarding_progress_${session.user.id}`;
        const onboardingKey = `onboarding_complete_${session.user.id}`;
        const dateKey = `${onboardingKey}_date`;

        localStorage.removeItem(progressKey);
        // Store completion date for profile page
        localStorage.setItem(dateKey, new Date().toISOString());
      }

      onComplete(affinities);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const canProceed = () => {
    const currentSelections = selections[currentStep] || [];
    return currentSelections.length >= 2; // Require at least 2 selections per step
  };

  const getStepIcon = (stepNumber: number) => {
    const stepData = onboardingData[stepNumber as keyof typeof onboardingData];
    const IconComponent = stepData.icon;
    const isCompleted = selections[stepNumber]?.length >= 2;
    const isCurrent = stepNumber === currentStep;

    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
          isCompleted
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
            : isCurrent
            ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg animate-pulse"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
        }`}
      >
        {isCompleted ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <IconComponent className="h-5 w-5" />
        )}
      </div>
    );
  };

  const getStepTitle = () => {
    const stepData = onboardingData[currentStep as keyof typeof onboardingData];
    return stepData.title;
  };

  const getStepSubtitle = () => {
    const stepData = onboardingData[currentStep as keyof typeof onboardingData];
    return stepData.subtitle;
  };

  const getCurrentData = () => {
    const stepData = onboardingData[currentStep as keyof typeof onboardingData];
    return stepData.data;
  };

  const getCurrentSelection = () => {
    return selections[currentStep] || [];
  };

  const handleSelection = (id: string) => {
    const currentSelections = getCurrentSelection();
    const newSelections = currentSelections.includes(id)
      ? currentSelections.filter((item) => item !== id)
      : [...currentSelections, id];

    setSelections((prev) => ({
      ...prev,
      [currentStep]: newSelections,
    }));
  };

  const totalSteps = Object.keys(onboardingData).length;
  const progress = (currentStep / totalSteps) * 100;
  const completedSteps = Object.keys(selections).filter(
    (step) => selections[parseInt(step)]?.length >= 2
  ).length;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Let's Personalize Your Experience
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Tell us about your tastes so we can recommend the perfect cultural
            experiences for you
          </p>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                {getStepIcon(step)}
                {step < 4 && (
                  <div
                    className={`w-8 h-1 mx-2 rounded-full transition-all duration-300 ${
                      selections[step]?.length >= 2
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto mb-2">
            <Progress value={progress} className="h-2" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Step {currentStep} of {totalSteps} • {completedSteps} completed
          </p>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {getStepTitle()}
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {getStepSubtitle()} • Select at least 2 options
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getCurrentData().map((item) => {
                const isSelected = getCurrentSelection().includes(item.id);
                return (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      isSelected
                        ? "ring-2 ring-violet-500 bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-950/30 dark:to-cyan-950/30 shadow-lg"
                        : "hover:shadow-md bg-white/50 dark:bg-slate-800/50"
                    }`}
                    onClick={() => handleSelection(item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {item.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Badge className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white border-0 ml-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Current Selections Summary */}
            {getCurrentSelection().length > 0 && (
              <div className="bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-950/20 dark:to-cyan-950/20 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your selections ({getCurrentSelection().length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {getCurrentSelection().map((selectionId) => {
                    const item = getCurrentData().find(
                      (d) => d.id === selectionId
                    );
                    return (
                      <Badge
                        key={selectionId}
                        variant="secondary"
                        className="bg-white/80 dark:bg-slate-800/80"
                      >
                        {item?.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="text-sm text-slate-500 dark:text-slate-400">
                {getCurrentSelection().length < 2 && (
                  <span>Select at least 2 options to continue</span>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || isCompleting}
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {isCompleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Completing...
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
