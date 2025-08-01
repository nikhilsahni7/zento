import { AuthForms } from "@/components/auth-forms";
import Image from "next/image";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-300/30 to-purple-300/30 dark:from-violet-600/20 dark:to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-300/30 to-blue-300/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-pink-300/20 to-rose-300/20 dark:from-pink-600/10 dark:to-rose-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Mobile Header - Chatbot and Welcome Text */}
      <div className="lg:hidden flex flex-col items-center justify-center py-8 px-4 relative z-10">
        <div className="text-center space-y-6 max-w-sm">
          {/* Mobile Chatbot Image */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image
              src="/Chat bot-pana.png"
              alt="Zento AI Assistant"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
            {/* Floating elements around chatbot */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full animate-bounce opacity-80"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-bounce-delayed opacity-80"></div>
          </div>

          {/* Mobile Welcome Text */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Welcome to Zento
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 font-medium">
              Your personal taste-driven AI companion
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Discover amazing restaurants, plan cultural itineraries, and find
              experiences that match your unique style.
            </p>
          </div>

          {/* Mobile Feature Highlights */}
          <div className="grid grid-cols-1 gap-3 mt-6">
            <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
              <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">✨</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                Personalized recommendations
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">🎯</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                Cultural experience discovery
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
              <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">🚀</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                AI-powered travel planning
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Left Side - Chatbot Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10">
        <div className="flex flex-col justify-center items-center w-full p-12">
          <div className="max-w-lg text-center space-y-8">
            {/* Desktop Chatbot Image */}
            <div className="relative w-80 h-80 mx-auto mb-8">
              <Image
                src="/Chat bot-pana.png"
                alt="Zento AI Assistant"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
              {/* Floating elements around chatbot */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full animate-bounce opacity-80"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-bounce-delayed opacity-80"></div>
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-pulse opacity-60"></div>
            </div>

            {/* Desktop Welcome Text */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Welcome to Zento
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
                Your personal taste-driven AI companion
              </p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Discover amazing restaurants, plan cultural itineraries, and
                find experiences that match your unique style. Let our AI
                assistant guide your journey.
              </p>
            </div>

            {/* Desktop Feature Highlights */}
            <div className="grid grid-cols-1 gap-4 mt-8">
              <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">✨</span>
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Personalized recommendations
                </span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🎯</span>
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Cultural experience discovery
                </span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🚀</span>
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  AI-powered travel planning
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-md">
          <AuthForms />
        </div>
      </div>
    </div>
  );
}
