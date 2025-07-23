"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { data: session, isPending: isLoading } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-400"></div>
            <div className="absolute inset-0 rounded-full bg-violet-100 dark:bg-violet-900/20 animate-ping opacity-20"></div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
