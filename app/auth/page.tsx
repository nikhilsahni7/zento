import { AuthForms } from "@/components/auth-forms";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-300/30 to-purple-300/30 dark:from-violet-600/20 dark:to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-300/30 to-blue-300/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-pink-300/20 to-rose-300/20 dark:from-pink-600/10 dark:to-rose-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <AuthForms />
      </div>
    </div>
  );
}
