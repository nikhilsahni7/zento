"use client";

import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    setLoading(true);

    toast({
      title: "Signing out...",
      description: "Please wait while we sign you out.",
    });

    try {
      await authClient.signOut();

      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        variant: "default",
      });

      router.push("/auth");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);

      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
      className="w-full justify-start text-left font-normal hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all duration-300"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
