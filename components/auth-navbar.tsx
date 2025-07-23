"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import {
  LogIn,
  Moon,
  Settings,
  Sparkles,
  Sun,
  User,
  UserPlus,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { Button } from "./ui/button";

export function AuthNavbar() {
  const { data: session, isPending: isLoading } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="relative z-10 border-b border-violet-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-sm">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3">
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
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-violet-50 hover:border-violet-200 dark:hover:bg-violet-950/20 transition-all duration-300 hover:shadow-lg hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
          </Button>

          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : session ? (
            // User is logged in
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="relative h-9 w-9 rounded-full hover:bg-violet-50 hover:border-violet-200 dark:hover:bg-violet-950/20 transition-all duration-300"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs">
                      {session.user.name
                        ? session.user.name.charAt(0).toUpperCase()
                        : session.user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-violet-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs">
                      {session.user.name
                        ? session.user.name.charAt(0).toUpperCase()
                        : session.user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-violet-200/50 dark:bg-slate-700/50" />
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-950/20"
                >
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile & Preferences</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-950/20"
                >
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-violet-200/50 dark:bg-slate-700/50" />
                <div className="p-1">
                  <LogoutButton />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // User is not logged in
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white border-0"
              >
                <Link href="/auth">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
