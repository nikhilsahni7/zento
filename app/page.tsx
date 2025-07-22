"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { PersonalizationBanner } from "@/components/personalization-banner"
import HomePage from "@/components/home-page"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Mic, MicOff, Sparkles, LogOut, User } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [userAffinities, setUserAffinities] = useState<any[]>([])
  const [isListening, setIsListening] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const onboardingComplete = localStorage.getItem("onboarding_complete")
    if (onboardingComplete) {
      setIsOnboarded(true)
      const affinities = JSON.parse(localStorage.getItem("user_affinities") || "[]")
      setUserAffinities(affinities)
    }
  }, [])

  const handleOnboardingComplete = (affinities: any[]) => {
    setUserAffinities(affinities)
    setIsOnboarded(true)
    localStorage.setItem("onboarding_complete", "true")
    localStorage.setItem("user_affinities", JSON.stringify(affinities))
  }

  const handleLogout = () => {
    localStorage.removeItem("onboarding_complete")
    localStorage.removeItem("user_affinities")
    setIsOnboarded(false)
    setUserAffinities([])
    setShowChat(false)
  }

  const toggleVoiceMode = () => {
    setIsListening(!isListening)
  }

  const startChat = () => {
    setShowChat(true)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-400"></div>
          <div className="absolute inset-0 rounded-full bg-violet-100 dark:bg-violet-900/20 animate-ping opacity-20"></div>
        </div>
      </div>
    )
  }

  if (!isOnboarded) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
          <OnboardingWizard onComplete={handleOnboardingComplete} />
          <Toaster />
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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

        {/* Header */}
        <header className="relative z-10 border-b border-violet-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-sm">
          <div className="container flex h-20 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-violet-600 to-cyan-600 p-2 rounded-xl">
                    <Sparkles className="h-8 w-8 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent font-space-grotesk animate-gradient-shift">
                    Cultural AI Concierge
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Your personal taste-driven companion
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {showChat && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVoiceMode}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isListening
                      ? "bg-red-50 text-red-600 border-red-200 shadow-lg shadow-red-100/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800 dark:shadow-red-900/20"
                      : "hover:bg-violet-50 hover:border-violet-200 dark:hover:bg-violet-950/20 hover:shadow-lg hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 animate-pulse" />
                      <div className="absolute inset-0 bg-red-400/20 animate-pulse-ring rounded-full"></div>
                    </>
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hover:bg-violet-50 hover:border-violet-200 dark:hover:bg-violet-950/20 transition-all duration-300 hover:shadow-lg hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-violet-50 hover:border-violet-200 dark:hover:bg-violet-950/20 transition-all duration-300 bg-transparent"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-violet-200/50 dark:border-slate-700/50"
                >
                  <DropdownMenuItem className="cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-950/20">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-violet-200/50 dark:bg-slate-700/50" />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

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
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Zero-PII Guarantee</span>
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

        <Toaster />
      </div>
    </ThemeProvider>
  )
}
