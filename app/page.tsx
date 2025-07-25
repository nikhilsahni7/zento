"use client";

import { AuthNavbar } from "@/components/auth-navbar";
import { ChatInterface } from "@/components/chat-interface";
import HomePage from "@/components/home-page";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { PersonalizationBanner } from "@/components/personalization-banner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { Mic, MicOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function App() {
  const { data: session, isPending: isLoading } = useSession();
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userAffinities, setUserAffinities] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (mounted && !isLoading && !session) {
      router.push("/auth");
    }
  }, [mounted, isLoading, session, router]);

  // Fetch onboarding status from server
  useEffect(() => {
    const fetchStatus = async () => {
      if (!session?.user) return;
      try {
        const res = await fetch("/api/profile/status");
        const data = await res.json();
        setIsOnboarded(data.hasProfile);
        setUserAffinities(data.affinityTags || []);
      } catch (error) {
        console.error("Failed to fetch profile status", error);
      }
    };
    fetchStatus();
  }, [session]);

  const handleOnboardingComplete = async (answers: {
    movie: string;
    artist: string;
    city: string;
  }) => {
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      // Refresh to update the onboarded state
      window.location.reload();
    } catch (error) {
      console.error("Onboarding completion error:", error);
    }
  };

  const toggleVoiceMode = () => {
    setIsListening(!isListening);
  };

  const startChat = () => {
    setShowChat(true);
  };

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-400"></div>
          <div className="absolute inset-0 rounded-full bg-violet-100 dark:bg-violet-900/20 animate-ping opacity-20"></div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show loading while redirecting
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-200 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated but hasn't completed onboarding
  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-300/30 to-purple-300/30 dark:from-violet-600/20 dark:to-purple-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-300/30 to-blue-300/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <AuthNavbar />

        <div className="relative z-10">
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        </div>
      </div>
    );
  }

  // User is authenticated and onboarded
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-300/30 to-purple-300/30 dark:from-violet-600/20 dark:to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-300/30 to-blue-300/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-pink-300/20 to-rose-300/20 dark:from-pink-600/10 dark:to-rose-600/10 rounded-full blur-3xl animate-pulse-slow"></div>

        {/* Additional floating elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-emerald-300/20 to-teal-300/20 dark:from-emerald-600/10 dark:to-teal-600/10 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-orange-300/20 to-amber-300/20 dark:from-orange-600/10 dark:to-amber-600/10 rounded-full blur-2xl animate-float-reverse"></div>
      </div>

      <AuthNavbar />

      {/* Voice Control Button for Chat */}
      {showChat && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleVoiceMode}
            className={`h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${
              isListening
                ? "bg-red-50 text-red-600 border-red-200 shadow-lg shadow-red-100/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800 dark:shadow-red-900/20"
                : "hover:bg-violet-50 hover:border-violet-200 dark:hover:bg-violet-950/20 hover:shadow-lg hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 animate-pulse" />
                <div className="absolute inset-0 bg-red-400/20 animate-pulse-ring rounded-full"></div>
              </>
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      {/* Personalization Banner */}
      {showChat && (
        <div className="relative z-10 animate-slide-in-down">
          <PersonalizationBanner affinities={userAffinities} />
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {showChat ? (
          <div className="container py-8">
            <div className="animate-fade-in-up">
              <ChatInterface
                userAffinities={userAffinities}
                isListening={isListening}
                onAffinitiesUpdate={setUserAffinities}
              />
            </div>
          </div>
        ) : (
          <HomePage userAffinities={userAffinities} onStartChat={startChat} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-violet-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl mt-12">
        <div className="container py-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Zero-PII Guarantee
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            GDPR/CCPA Compliant •
            <a
              href="/privacy"
              className="underline ml-1 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
