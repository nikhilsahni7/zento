"use client";

import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function AuthForms() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { toast } = useToast();

  const handleEmailSignIn = async (formData: FormData) => {
    setLoading(true);
    setError("");
    setSuccess("");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    toast({
      title: "Signing in...",
      description: "Please wait while we verify your credentials.",
    });

    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          setSuccess("Welcome back! Redirecting to your Zento journey...");
          toast({
            title: "Welcome back! 🎉",
            description: "Successfully signed in. Redirecting you now...",
            variant: "default",
          });
          setTimeout(() => {
            router.push(callbackUrl);
          }, 1500);
        },
        onError: (ctx) => {
          let errorMessage = "Sign in failed. Please check your credentials.";

          if (ctx.error.status === 403) {
            errorMessage =
              "Please verify your email address before signing in. Check your inbox for a verification link.";
          } else if (ctx.error.message) {
            errorMessage = ctx.error.message;
          }

          setError(errorMessage);
          toast({
            title: "Sign in failed",
            description: errorMessage,
            variant: "destructive",
          });
        },
      }
    );
    setLoading(false);
  };

  const handleEmailSignUp = async (formData: FormData) => {
    setLoading(true);
    setError("");
    setSuccess("");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = formData.get("name") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast({
        title: "Password mismatch",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Creating account...",
      description: "Please wait while we set up your Zento journey.",
    });

    await authClient.signUp.email(
      { email, password, name },
      {
        onSuccess: () => {
          const successMsg =
            "🎉 Account created successfully! Please check your email to verify your account before signing in.";
          setSuccess(successMsg);
          toast({
            title: "Account created! 🎉",
            description: "Please check your email to verify your account.",
            variant: "default",
          });
          // Switch to sign in tab after successful signup
          setTimeout(() => {
            setActiveTab("signin");
          }, 2000);
        },
        onError: (ctx) => {
          const errorMessage =
            ctx.error.message || "Sign up failed. Please try again.";
          setError(errorMessage);
          toast({
            title: "Sign up failed",
            description: errorMessage,
            variant: "destructive",
          });
        },
      }
    );
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    toast({
      title: "Connecting with Google...",
      description: "Redirecting to Google for authentication.",
    });

    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: callbackUrl,
      },
      {
        onSuccess: () => {
          setSuccess("Signing in with Google...");
          toast({
            title: "Google authentication successful",
            description: "Completing sign in process...",
            variant: "default",
          });
        },
        onError: (ctx) => {
          const errorMessage =
            ctx.error.message || "Google sign in failed. Please try again.";
          setError(errorMessage);
          toast({
            title: "Google sign in failed",
            description: errorMessage,
            variant: "destructive",
          });
        },
      }
    );
    setLoading(false);
  };

  const handleForgotPassword = async (formData: FormData) => {
    setLoading(true);
    setError("");
    setSuccess("");
    const email = formData.get("email") as string;

    toast({
      title: "Sending reset email...",
      description: "Please wait while we send you a password reset link.",
    });

    try {
      await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      const successMsg =
        "Password reset email sent! Please check your inbox and follow the instructions.";
      setSuccess(successMsg);
      toast({
        title: "Reset email sent! 📧",
        description: "Check your inbox for password reset instructions.",
        variant: "default",
      });
      setShowForgotPassword(false);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send password reset email";
      setError(errorMessage);
      toast({
        title: "Failed to send reset email",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    const email = (
      document.querySelector('input[name="email"]') as HTMLInputElement
    )?.value;
    if (!email) {
      setError("Please enter your email address first");
      toast({
        title: "Email required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");

    toast({
      title: "Resending verification...",
      description: "Please wait while we send a new verification email.",
    });

    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: callbackUrl,
      });
      setSuccess("Verification email sent! Please check your inbox.");
      toast({
        title: "Verification email sent! 📧",
        description: "Check your inbox for the new verification link.",
        variant: "default",
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send verification email";
      setError(errorMessage);
      toast({
        title: "Failed to send verification",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in-up">
        {error && (
          <Alert
            variant="destructive"
            className="border-red-200 bg-red-50 dark:bg-red-950/20 animate-slide-in-down"
          >
            <AlertDescription className="text-red-700 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 animate-slide-in-down">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="text-emerald-700 dark:text-emerald-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 left-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setShowForgotPassword(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Enter your email address and we'll send you a secure link to reset
              your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                  required
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6 animate-fade-in-up">
      {error && (
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 dark:bg-red-950/20 animate-slide-in-down"
        >
          <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
            {error}
            {error.includes("verify your email") && (
              <Button
                variant="link"
                className="p-0 h-auto ml-2 text-red-600 dark:text-red-400 underline hover:text-red-700 dark:hover:text-red-300 text-sm"
                onClick={handleResendVerification}
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend verification email"}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 animate-slide-in-down">
          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-400 text-sm">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-4 sm:pb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-cyan-600/5 dark:from-violet-400/5 dark:to-cyan-400/5"></div>
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-pulse" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
              Welcome to Zento
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
              Your personal taste-driven travel companion
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="relative px-4 sm:px-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 h-10 sm:h-12 rounded-lg p-1">
              <TabsTrigger
                value="signin"
                className="font-medium text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                disabled={loading}
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="font-medium text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                disabled={loading}
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="signin"
              className="mt-4 sm:mt-6 space-y-4 sm:space-y-6"
            >
              <form action={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="h-11 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signin-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-11 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 pr-10 text-sm"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 sm:h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-sm"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Signing In..." : "Sign In to Your Journey"}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                  onClick={() => setShowForgotPassword(true)}
                  disabled={loading}
                >
                  Forgot your password?
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-[1.02] text-sm"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Connecting..." : "Continue with Google"}
              </Button>
            </TabsContent>

            <TabsContent
              value="signup"
              className="mt-4 sm:mt-6 space-y-4 sm:space-y-6"
            >
              <form action={handleEmailSignUp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-name"
                      className="text-sm font-medium"
                    >
                      Name
                    </Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      className="h-11 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 text-sm"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className="text-sm font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="h-11 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 text-sm"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      minLength={8}
                      placeholder="At least 8 characters"
                      className="h-11 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 pr-10 text-sm"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 sm:h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-confirm-password"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      minLength={8}
                      placeholder="Confirm your password"
                      className="h-11 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 pr-10 text-sm"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 sm:h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-sm"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Creating Account..." : "Start Your Zento Journey"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-[1.02] text-sm"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Connecting..." : "Continue with Google"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
