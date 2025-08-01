"use client";

import { AuthNavbar } from "@/components/auth-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/lib/auth-client";
import {
  Bell,
  Globe,
  Lock,
  Moon,
  Palette,
  Settings as SettingsIcon,
  Shield,
  Sun,
  Volume2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session, isPending: isLoading } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);

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
            <SettingsIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Customize your Zento experience
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Appearance Settings */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Theme</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Choose your preferred color scheme
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex items-center space-x-2"
                  >
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex items-center space-x-2"
                  >
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive notifications about new recommendations
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice & Audio Settings */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                <Volume2 className="h-5 w-5" />
                <span>Voice & Audio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Voice Commands</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enable voice input for chat interface
                  </p>
                </div>
                <Switch
                  checked={voiceEnabled}
                  onCheckedChange={setVoiceEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                <Shield className="h-5 w-5" />
                <span>Privacy & Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium text-emerald-800 dark:text-emerald-300">
                    Zero-PII Guarantee
                  </span>
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  We don't store any personally identifiable information. Your
                  conversations and preferences are kept local and anonymous.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Anonymous Analytics
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Help improve our service with anonymous usage data
                  </p>
                </div>
                <Switch
                  checked={dataCollection}
                  onCheckedChange={setDataCollection}
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  className="w-full hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => router.push("/privacy")}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  View Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                <Globe className="h-5 w-5" />
                <span>Language & Region</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Language</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Choose your preferred language
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  English (US)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="text-center pt-6">
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white px-8"
            >
              Back to Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
