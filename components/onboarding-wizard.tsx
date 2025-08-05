"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Film,
  MapPin,
  Music,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

interface OnboardingWizardProps {
  onComplete: (answers: {
    movie: string;
    artist: string;
    city: string;
  }) => void;
}

// The "Taste Triangle" data structure
const tasteTriangleSteps = [
  {
    id: 1,
    title: "What's one movie or TV show you absolutely love?",
    subtitle: "Tell us about something that really captivates you",
    icon: Film,
    placeholder: "e.g., Blade Runner, The Office, Spirited Away...",
    field: "movie" as const,
  },
  {
    id: 2,
    title: "Name a music artist or band on your heavy rotation",
    subtitle: "Who's been in your headphones lately?",
    icon: Music,
    placeholder: "e.g., Tame Impala, Billie Eilish, Pink Floyd...",
    field: "artist" as const,
  },
  {
    id: 3,
    title: "What city are you based in or closest to?",
    subtitle: "This helps us find local recommendations for you",
    icon: MapPin,
    placeholder: "e.g., New York, London, San Francisco, Mumbai...",
    field: "city" as const,
  },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { data: session, isPending: isLoading } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<{
    movie: string;
    artist: string;
    city: string;
  }>({
    movie: "",
    artist: "",
    city: "",
  });
  const [isCompleting, setIsCompleting] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    if (session?.user) {
      const progressKey = `onboarding_progress_${session.user.id}`;
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        try {
          const { step, answers: savedAnswers } = JSON.parse(savedProgress);
          setCurrentStep(step);
          setAnswers(savedAnswers);
        } catch (error) {
          console.error("Error loading onboarding progress:", error);
        }
      }
    }
  }, [session]);

  // Save progress whenever step or answers change
  useEffect(() => {
    if (session?.user) {
      const progressKey = `onboarding_progress_${session.user.id}`;
      localStorage.setItem(
        progressKey,
        JSON.stringify({ step: currentStep, answers })
      );
    }
  }, [currentStep, answers, session]);

  const currentStepData = tasteTriangleSteps.find(
    (step) => step.id === currentStep
  )!;
  const currentAnswer = answers[currentStepData.field];

  const handleInputChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStepData.field]: value,
    }));
  };

  const canProceed = () => {
    return currentAnswer.trim().length > 0;
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!canProceed()) return;

    setIsCompleting(true);
    try {
      await onComplete(answers);
      // Clear saved progress on completion
      if (session?.user) {
        const progressKey = `onboarding_progress_${session.user.id}`;
        localStorage.removeItem(progressKey);
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getStepIcon = (stepNumber: number) => {
    const stepData = tasteTriangleSteps.find((s) => s.id === stepNumber)!;
    const IconComponent = stepData.icon;
    const isCompleted =
      stepNumber < currentStep || (stepNumber === currentStep && canProceed());
    const isCurrent = stepNumber === currentStep;

    return (
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isCompleted
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
            : isCurrent
            ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg animate-pulse"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
        }`}
      >
        {isCompleted && stepNumber < currentStep ? (
          <CheckCircle className="h-6 w-6" />
        ) : (
          <IconComponent className="h-6 w-6" />
        )}
      </div>
    );
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            The Taste Triangle
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Tell us about three things you love, and we'll create your
            personalized cultural compass
          </p>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                {getStepIcon(step)}
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                      step < currentStep
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-8">
            <div
              className="bg-gradient-to-r from-violet-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full flex items-center justify-center">
                <currentStepData.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">
              {currentStepData.title}
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              {currentStepData.subtitle}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="answer" className="text-base font-medium">
                Your answer
              </Label>
              <Input
                id="answer"
                value={currentAnswer}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentStepData.placeholder}
                className="text-lg py-3 px-4 border-2 focus:border-violet-500 dark:focus:border-violet-400"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canProceed()) {
                    if (currentStep === 3) {
                      handleComplete();
                    } else {
                      handleNext();
                    }
                  }
                }}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="text-sm text-slate-500 dark:text-slate-400">
                Step {currentStep} of 3
              </div>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed() || isCompleting}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-2"
                >
                  {isCompleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Creating your profile...
                    </>
                  ) : (
                    <>
                      Complete
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer hint */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't worry about being perfect - we'll use AI to understand your
            cultural taste from these examples
          </p>
        </div>
      </div>
    </div>
  );
}
