"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Brain,
  Camera,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Film,
  Globe,
  Heart,
  Lightbulb,
  MapPin,
  MessageCircle,
  Music,
  Palette,
  Play,
  Quote,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface HomePageProps {
  userAffinities: any[];
  onStartChat: () => void;
}

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Recommendations",
    description:
      "Get personalized suggestions based on your unique taste profile across films, food, and travel",
    color: "from-indigo-600 to-blue-700",
    delay: "0ms",
  },
  {
    icon: MapPin,
    title: "Smart Itinerary Planning",
    description:
      "Create detailed cultural itineraries that match your preferences and interests",
    color: "from-rose-500 to-coral-600",
    delay: "100ms",
  },
  {
    icon: Globe,
    title: "Cross-Domain Discovery",
    description:
      "Discover connections between your film tastes and restaurant preferences",
    color: "from-amber-500 to-orange-500",
    delay: "200ms",
  },
  {
    icon: Zap,
    title: "Voice Interactions",
    description: "Chat naturally using voice commands in 40+ languages",
    color: "from-emerald-600 to-teal-600",
    delay: "300ms",
  },
];

const STATS = [
  {
    icon: Users,
    value: "10K+",
    label: "Happy Users",
    color: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: MapPin,
    value: "500+",
    label: "Cities Covered",
    color: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Star,
    value: "4.9",
    label: "User Rating",
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: TrendingUp,
    value: "95%",
    label: "Match Accuracy",
    color: "text-emerald-600 dark:text-emerald-400",
  },
];

const SAMPLE_RECOMMENDATIONS = [
  {
    type: "Restaurant",
    name: "Hidden Ramen Bar",
    location: "Tokyo, Japan",
    match: "94%",
    tags: ["Authentic", "Local Favorite"],
    emoji: "🍜",
    color: "from-rose-500 to-coral-500",
    description:
      "Intimate 8-seat counter serving the city's most sought-after tonkotsu ramen",
  },
  {
    type: "Cultural Site",
    name: "Underground Art Gallery",
    location: "Berlin, Germany",
    match: "91%",
    tags: ["Contemporary", "Emerging Artists"],
    emoji: "🎨",
    color: "from-indigo-600 to-blue-700",
    description:
      "Converted bunker showcasing avant-garde installations and digital art",
  },
  {
    type: "Experience",
    name: "Rooftop Cinema",
    location: "Barcelona, Spain",
    match: "89%",
    tags: ["Unique", "Cinematic"],
    emoji: "🎬",
    color: "from-amber-500 to-orange-500",
    description:
      "Watch indie films under the stars with the city's skyline as your backdrop",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Travel Photographer",
    location: "San Francisco",
    avatar: "👩‍💻",
    quote:
      "This AI completely transformed how I discover cultural gems. It found places I never would have discovered on my own!",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Food Critic",
    location: "Mexico City",
    avatar: "👨‍🍳",
    quote:
      "The cross-domain recommendations are incredible. It connected my love for jazz to the perfect speakeasy restaurants.",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Cultural Anthropologist",
    location: "London",
    avatar: "👩‍🎓",
    quote:
      "Finally, an AI that understands the nuances of cultural preference. It's like having a local friend in every city.",
    rating: 5,
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    icon: Brain,
    title: "Share Your Taste",
    description:
      "Tell us about your favorite films, cuisines, and destinations",
    color: "from-indigo-600 to-blue-700",
  },
  {
    step: "2",
    icon: Lightbulb,
    title: "AI Analyzes Patterns",
    description: "Our AI finds hidden connections in your cultural preferences",
    color: "from-amber-500 to-orange-500",
  },
  {
    step: "3",
    icon: Target,
    title: "Get Perfect Matches",
    description: "Receive personalized recommendations with 95% accuracy",
    color: "from-emerald-600 to-teal-600",
  },
];

const FEATURED_DESTINATIONS = [
  {
    name: "Tokyo",
    emoji: "🏯",
    highlight: "3,000 restaurants",
    color: "from-rose-400 to-coral-400",
  },
  {
    name: "Paris",
    emoji: "🗼",
    highlight: "200 museums",
    color: "from-indigo-400 to-blue-500",
  },
  {
    name: "New York",
    emoji: "🗽",
    highlight: "500 galleries",
    color: "from-emerald-400 to-teal-500",
  },
  {
    name: "Barcelona",
    emoji: "🏛️",
    highlight: "150 venues",
    color: "from-amber-400 to-orange-400",
  },
  {
    name: "Istanbul",
    emoji: "🕌",
    highlight: "400 cafes",
    color: "from-rose-500 to-pink-500",
  },
];

export default function HomePage({
  userAffinities,
  onStartChat,
}: HomePageProps) {
  const [currentRecommendation, setCurrentRecommendation] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRecommendation(
        (prev) => (prev + 1) % SAMPLE_RECOMMENDATIONS.length
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative space-y-20 py-4 overflow-hidden"
    >
      {/* Floating cursor effect */}
      <div
        className="pointer-events-none fixed w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400/20 to-rose-400/20 blur-xl transition-all duration-300 ease-out z-10"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
        }}
      />

      {/* Enhanced Hero Section */}
      <section className="container text-center space-y-6 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-indigo-400/30 rounded-full animate-pulse" />
          <div className="absolute top-40 right-1/3 w-1 h-1 bg-rose-400/40 rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-amber-400/20 rounded-full animate-bounce-gentle delay-700" />
        </div>

        <div className="space-y-4 max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-100/80 to-blue-100/80 dark:from-indigo-950/30 dark:to-blue-950/30 px-6 py-3 rounded-full border border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide">
              Powered by Advanced AI
            </span>
            <Badge
              variant="secondary"
              className="bg-white/60 dark:bg-slate-800/60 text-xs"
            >
              New
            </Badge>
          </div>

          <div className="space-y-3">
            <h1 className="text-6xl md:text-8xl font-bold font-playfair leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-blue-700 to-rose-500 bg-clip-text text-transparent animate-gradient-shift bg-300%">
                Discover Culture
              </span>
              <br />
              <span className="text-slate-800 dark:text-slate-200 relative">
                Through Your Taste
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-indigo-400 to-rose-400 rounded-full opacity-60" />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Get personalized restaurant recommendations, cultural experiences,
              and travel itineraries based on your unique preferences. Let AI
              understand your taste and guide your cultural journey.
            </p>
          </div>

          {/* Enhanced Image Gallery */}
          <div className="flex justify-center items-center space-x-8 mb-6">
            <div className="relative w-32 h-32 md:w-40 md:h-40 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110">
              <Image
                src="/c.png"
                alt="Coffee Shop Experience"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="relative w-32 h-32 md:w-40 md:h-40 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110">
              <Image
                src="/Book lover-amico.png"
                alt="Book Lover Experience"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="relative w-32 h-32 md:w-40 md:h-40 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110">
              <Image
                src="/Drive-in movie theater-amico.png"
                alt="Drive-in Movie Experience"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Chatbot Image */}
          <div className="flex justify-center mb-4">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <Image
                src="/Chat bot-pana.png"
                alt="Zento AI Assistant"
                fill
                className="object-contain animate-float-gentle"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              onClick={onStartChat}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-rose-500 hover:from-indigo-700 hover:to-rose-600 text-white shadow-lg hover:shadow-2xl transition-all duration-500 px-10 py-7 text-xl font-semibold group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <MessageCircle className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              Start Your Zento Journey
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 px-10 py-7 text-xl group bg-transparent backdrop-blur-sm"
            >
              <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              Watch Demo
            </Button>
          </div>

          {/* Enhanced Floating Taste Profile */}
          {userAffinities.length > 0 && (
            <div
              className="max-w-3xl mx-auto animate-bounce-in"
              style={{ animationDelay: "800ms" }}
            >
              <Card className="bg-gradient-to-r from-indigo-50/90 to-rose-50/90 dark:from-indigo-950/30 dark:to-rose-950/30 border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-lg shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="relative">
                      <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400 animate-pulse" />
                      <div className="absolute inset-0 h-6 w-6 text-rose-400 animate-ping opacity-20">
                        <Heart className="h-6 w-6" />
                      </div>
                    </div>
                    <span className="font-bold text-xl text-slate-800 dark:text-slate-200">
                      Your Taste Profile
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {userAffinities.slice(0, 4).map((affinity, index) => {
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
                          className="bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-indigo-200/50 dark:border-indigo-700/50 px-4 py-2 text-sm font-medium animate-fade-in hover:scale-105 transition-all duration-300"
                          style={{ animationDelay: `${1000 + index * 150}ms` }}
                        >
                          <span className="capitalize font-semibold">
                            {displayName}
                          </span>
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-950/30 dark:to-blue-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200/50">
            How It Works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-6 font-playfair">
            Your Personal Cultural Journey
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Our AI analyzes millions of cultural data points to understand your
            unique preferences and deliver perfect matches
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {HOW_IT_WORKS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="text-center p-8 border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6">
                  <div className="relative mb-6">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 dark:bg-white text-white dark:text-slate-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Enhanced Live Recommendations Preview */}
      <section className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 text-amber-700 dark:text-amber-300 border-amber-200/50">
            Live Recommendations
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-6 font-playfair">
            See AI in Action
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Watch how our AI finds perfect cultural matches tailored to your
            taste in real-time
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl group hover:shadow-violet-500/10 transition-all duration-500">
            <div
              className={`relative h-64 bg-gradient-to-br ${SAMPLE_RECOMMENDATIONS[currentRecommendation].color} overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black/30" />

              {/* Floating particles */}
              <div className="absolute inset-0">
                <div className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-bounce" />
                <div className="absolute top-12 right-8 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-300" />
                <div className="absolute bottom-8 left-8 w-3 h-3 bg-white/20 rounded-full animate-bounce-gentle delay-700" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-7xl animate-bounce-gentle transform group-hover:scale-110 transition-transform duration-300">
                  {SAMPLE_RECOMMENDATIONS[currentRecommendation].emoji}
                </div>
              </div>

              <div className="absolute top-6 right-6">
                <Badge className="bg-white/95 text-slate-800 font-bold px-3 py-1 shadow-lg">
                  {SAMPLE_RECOMMENDATIONS[currentRecommendation].match} match
                </Badge>
              </div>

              <div className="absolute bottom-6 left-6">
                <Badge
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white backdrop-blur-sm"
                >
                  {SAMPLE_RECOMMENDATIONS[currentRecommendation].type}
                </Badge>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="space-y-4">
                <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-200">
                  {SAMPLE_RECOMMENDATIONS[currentRecommendation].name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 flex items-center text-lg">
                  <MapPin className="h-5 w-5 mr-2 text-rose-500" />
                  {SAMPLE_RECOMMENDATIONS[currentRecommendation].location}
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {SAMPLE_RECOMMENDATIONS[currentRecommendation].description}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {SAMPLE_RECOMMENDATIONS[currentRecommendation].tags.map(
                    (tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {tag}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-8 space-x-3">
          {SAMPLE_RECOMMENDATIONS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentRecommendation(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                index === currentRecommendation
                  ? "bg-indigo-600 dark:bg-indigo-400 w-10 shadow-lg"
                  : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Enhanced Features Grid */}
      <section className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-rose-100 to-coral-100 dark:from-rose-950/30 dark:to-coral-950/30 text-rose-700 dark:text-rose-300 border-rose-200/50">
            Advanced Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-6 font-playfair">
            Powered by Intelligence
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Cutting-edge AI technology that understands your cultural
            preferences and connects the dots across domains
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg hover:scale-105 animate-fade-in-up relative overflow-hidden"
                style={{ animationDelay: feature.delay }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-8 text-center space-y-6 relative z-10">
                  <div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/50">
            Global Coverage
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-6 font-playfair">
            Explore the World's Cultures
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            From bustling metropolises to hidden gems, discover cultural
            treasures in over 500 cities worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {FEATURED_DESTINATIONS.map((destination, index) => (
            <Card
              key={index}
              className="group cursor-pointer hover:shadow-xl transition-all duration-500 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:scale-110 animate-fade-in-up relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${destination.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
              />
              <CardContent className="p-6 text-center space-y-4 relative z-10">
                <div className="text-4xl group-hover:scale-125 transition-transform duration-300">
                  {destination.emoji}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-1">
                    {destination.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {destination.highlight}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-700 dark:text-indigo-300 border-blue-200/50">
            Testimonials
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-6 font-playfair">
            Loved by Culture Enthusiasts
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Join thousands who have discovered their perfect cultural matches
            through our AI
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <Card className="bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-800/90 border-0 shadow-2xl backdrop-blur-lg">
            <CardContent className="p-12 text-center">
              <Quote className="h-12 w-12 mx-auto mb-8 text-violet-400 opacity-50" />

              <div className="space-y-8">
                <blockquote className="text-2xl md:text-3xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{TESTIMONIALS[currentTestimonial].quote}"
                </blockquote>

                <div className="flex items-center justify-center space-x-1 mb-6">
                  {[...Array(TESTIMONIALS[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    )
                  )}
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <div className="text-4xl">
                    {TESTIMONIALS[currentTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-xl text-slate-800 dark:text-slate-200">
                      {TESTIMONIALS[currentTestimonial].name}
                    </h4>
                    <p className="text-violet-600 dark:text-violet-400 font-medium">
                      {TESTIMONIALS[currentTestimonial].role}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {TESTIMONIALS[currentTestimonial].location}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center mt-8 space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:scale-110 transition-all duration-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex space-x-2 items-center">
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-indigo-600 w-8"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:scale-110 transition-all duration-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="container">
        <Card className="bg-gradient-to-br from-indigo-50/80 to-rose-50/80 dark:from-indigo-950/30 dark:to-rose-950/30 border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-lg shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                Trusted by Thousands
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Real numbers from our global community
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="text-center space-y-4 group hover:scale-105 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative">
                      <Icon
                        className={`h-12 w-12 mx-auto ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400/20 to-rose-400/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
                    </div>
                    <div className="text-4xl font-bold text-slate-800 dark:text-slate-200 font-space-grotesk">
                      {stat.value}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Categories Preview */}
      <section className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-950/30 dark:to-pink-950/30 text-rose-700 dark:text-rose-300 border-rose-200/50">
            Categories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-6 font-playfair">
            Explore Every Culture
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            From hidden restaurants to cultural experiences, discover what
            matches your unique taste across all domains
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            {
              icon: UtensilsCrossed,
              label: "Restaurants",
              color: "from-rose-500 to-coral-500",
              emoji: "🍽️",
            },
            {
              icon: Film,
              label: "Cinema",
              color: "from-indigo-500 to-blue-600",
              emoji: "🎬",
            },
            {
              icon: Music,
              label: "Music",
              color: "from-amber-500 to-orange-500",
              emoji: "🎵",
            },
            {
              icon: Camera,
              label: "Art",
              color: "from-emerald-500 to-teal-600",
              emoji: "🎨",
            },
            {
              icon: Coffee,
              label: "Cafés",
              color: "from-amber-400 to-yellow-500",
              emoji: "☕",
            },
            {
              icon: Palette,
              label: "Culture",
              color: "from-indigo-600 to-purple-600",
              emoji: "🏛️",
            },
          ].map((category, index) => {
            const Icon = category.icon;
            return (
              <Card
                key={index}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:scale-110 animate-fade-in-up relative overflow-hidden"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <CardContent className="p-6 text-center space-y-4 relative z-10">
                  <div className="text-4xl group-hover:scale-125 transition-transform duration-300 relative">
                    {category.emoji}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />
                  </div>
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-20 transition-all duration-300 scale-75 group-hover:scale-100`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300">
                    {category.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="container text-center">
        <Card className="bg-gradient-to-br from-indigo-600 via-blue-700 to-rose-500 border-0 text-white overflow-hidden relative shadow-2xl">
          {/* Animated background pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />

          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-8 left-8 w-20 h-20 border border-white/10 rounded-full animate-float" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border border-white/10 rounded-full animate-float-delayed" />
            <div className="absolute top-1/2 left-16 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
            <div className="absolute top-1/4 right-20 w-3 h-3 bg-white/20 rounded-full animate-bounce-gentle" />
          </div>

          <CardContent className="relative p-16 space-y-8 z-10">
            <div className="space-y-6">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                Ready to start?
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold font-playfair leading-tight">
                Ready to Discover Your Perfect Cultural Match?
              </h2>
              <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                Join thousands of culture enthusiasts who've found their perfect
                recommendations through AI. Start your personalized journey
                today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={onStartChat}
                size="lg"
                variant="secondary"
                className="bg-white text-indigo-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-500 px-12 py-7 text-xl font-bold group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/50 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Sparkles className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                Start Exploring Now
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>

              <div className="flex items-center space-x-2 text-white/80">
                <Shield className="h-5 w-5" />
                <span className="text-sm">
                  Free to start • No credit card required
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
