"use client";

import { AuthNavbar } from "@/components/auth-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/lib/auth-client";
import {
  Calendar,
  Edit3,
  Film,
  Mail,
  MapPin,
  Music,
  Palette,
  RefreshCw,
  Sparkles,
  User,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session, isPending: isLoading } = useSession();
  const [userAffinities, setUserAffinities] = useState<any[]>([]);
  const [onboardingDate, setOnboardingDate] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      const affinitiesKey = `user_affinities_${session.user.id}`;
      const onboardingKey = `onboarding_complete_${session.user.id}`;

      const storedAffinities = localStorage.getItem(affinitiesKey);
      if (storedAffinities) {
        try {
          const affinities = JSON.parse(storedAffinities);
          setUserAffinities(affinities);
        } catch (error) {
          console.error("Error parsing stored affinities:", error);
        }
      }

      // Get onboarding completion date (we'll store this when user completes onboarding)
      const completionDate = localStorage.getItem(`${onboardingKey}_date`);
      if (completionDate) {
        setOnboardingDate(new Date(completionDate).toLocaleDateString());
      }
    }
  }, [session]);

  const handleRedoOnboarding = () => {
    if (session?.user) {
      const onboardingKey = `onboarding_complete_${session.user.id}`;
      const affinitiesKey = `user_affinities_${session.user.id}`;
      const progressKey = `onboarding_progress_${session.user.id}`;
      const dateKey = `${onboardingKey}_date`;

      // Clear all onboarding data
      localStorage.removeItem(onboardingKey);
      localStorage.removeItem(affinitiesKey);
      localStorage.removeItem(progressKey);
      localStorage.removeItem(dateKey);

      // Redirect to home page which will show onboarding
      router.push("/");
    }
  };

  // Since affinities are now Qloo URN strings, we'll group them by extracting the category
  const getAffinitiesByCategory = (category: string) => {
    return userAffinities.filter((affinity) => {
      if (typeof affinity !== "string") return false;
      return affinity.includes(category);
    });
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case "media":
      case "genre":
        return Film;
      case "cuisine":
        return Utensils;
      case "music":
        return Music;
      case "place":
      case "location":
        return MapPin;
      default:
        return Sparkles;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "movie_genre":
        return "Movie Genres";
      case "cuisine":
        return "Cuisines";
      case "music_genre":
        return "Music Genres";
      case "travel_destination":
        return "Travel Preferences";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-400"></div>
          <div className="absolute inset-0 rounded-full bg-violet-100 dark:bg-violet-900/20 animate-ping opacity-20"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth");
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

  const affinityTypes = [
    "media",
    "cuisine",
    "music",
    "place",
    "genre",
    "location",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-300/30 to-purple-300/30 dark:from-violet-600/20 dark:to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-300/30 to-blue-300/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <AuthNavbar />

      <div className="relative z-10 container py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Your Profile
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Manage your account and cultural preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {session.user.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : session.user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">
                  {session.user.name || "User"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{session.user.email}</span>
                </div>

                {session.user.emailVerified && (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-emerald-500 text-white">
                      ✓ Email Verified
                    </Badge>
                  </div>
                )}

                {onboardingDate && (
                  <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Profile completed on {onboardingDate}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Quick Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-950/20 dark:to-cyan-950/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {userAffinities.length}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Preferences
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {
                          affinityTypes.filter(
                            (type) => getAffinitiesByCategory(type).length > 0
                          ).length
                        }
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Categories
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                  <Edit3 className="h-5 w-5" />
                  <span>Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleRedoOnboarding}
                  className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Redo Taste Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full hover:bg-violet-50 dark:hover:bg-violet-950/20"
                  onClick={() => router.push("/")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Back to Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Cultural Preferences */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl text-slate-900 dark:text-slate-100">
                  <Palette className="h-6 w-6" />
                  <span>Your Cultural Preferences</span>
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400">
                  Based on your taste profile questionnaire
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {userAffinities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      No preferences set yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Complete your taste profile to get personalized
                      recommendations
                    </p>
                    <Button
                      onClick={handleRedoOnboarding}
                      className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Complete Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {affinityTypes.map((type) => {
                      const typeAffinities = getAffinitiesByCategory(type);
                      if (typeAffinities.length === 0) return null;

                      const IconComponent = getIconForCategory(type);

                      return (
                        <div key={type} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg">
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {getTypeLabel(type)}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {typeAffinities.length} selected
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {typeAffinities.map((affinity, index) => (
                              <Badge
                                key={index}
                                className="bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-950/30 dark:to-cyan-950/30 text-slate-700 dark:text-slate-300 border border-violet-200/50 dark:border-violet-700/50 px-3 py-1"
                              >
                                {affinity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
