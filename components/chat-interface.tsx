"use client";

import { QuickReplyChips } from "@/components/quick-reply-chips";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";
import { Bot, Mic, Send, Sparkles, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?:
    | "text"
    | "recommendations"
    | "itinerary"
    | "analysis"
    | "trending"
    | "error";
  data?: any;
}

interface ChatInterfaceProps {
  userAffinities: any[];
  isListening: boolean;
  onAffinitiesUpdate: (affinities: any[]) => void;
}

export function ChatInterface({
  userAffinities,
  isListening,
  onAffinitiesUpdate,
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your Zento AI Assistant. Based on your taste profile, I can help you discover amazing restaurants, plan cultural itineraries, or find experiences that match your style. What would you like to explore today?",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [thinkingState, setThinkingState] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get user's first name for avatar
  const getUserInitial = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Voice input functionality
  useEffect(() => {
    if (isListening && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        setInput(transcript);
      };

      recognition.onend = () => {
        // Recognition ended
        console.log("Speech recognition ended");
      };

      recognition.start();
      return () => recognition.stop();
    }
  }, [isListening]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Show thinking states
    const thinkingStates = [
      "🧠 Understanding your cultural preferences...",
      "🔍 Searching through Qloo's recommendation engine...",
      "✨ Personalizing recommendations just for you...",
      "🎨 Crafting the perfect response...",
    ];

    let stateIndex = 0;
    const thinkingInterval = setInterval(() => {
      if (stateIndex < thinkingStates.length) {
        setThinkingState(thinkingStates[stateIndex]);
        stateIndex++;
      }
    }, 1500);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-4), // Last 4 messages for context
        }),
      });

      clearInterval(thinkingInterval);
      setThinkingState("");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        role: "assistant",
        timestamp: new Date(),
        type: data.type || "text",
        data: data.data,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update affinities if new ones were discovered (future: for feedback)
      if (data.data?.debug?.newTagsFound > 0) {
        // Could update user affinities here if needed
      }
    } catch (error) {
      clearInterval(thinkingInterval);
      setThinkingState("");

      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm having trouble processing that request right now. Could you try asking in a different way?",
        role: "assistant",
        timestamp: new Date(),
        type: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    handleSendMessage(reply);
  };

  const speakMessage = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* Optional Listening Status */}
      {isListening && (
        <div className="mb-4 text-center">
          <Badge className="bg-gradient-to-r from-rose-100 to-coral-100 dark:from-rose-950/30 dark:to-coral-950/30 text-rose-700 dark:text-rose-300 border-rose-200/50 animate-pulse">
            <Mic className="w-3 h-3 mr-1 animate-bounce" />
            Listening...
          </Badge>
        </div>
      )}

      {/* Enhanced Visual Context Images */}
      <div className="mb-6 flex justify-center space-x-4">
        <div className="relative w-16 h-16 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer group">
          <Image
            src="/c.png"
            alt="Coffee & Dining"
            fill
            className="object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Coffee & Dining
          </div>
        </div>
        <div className="relative w-16 h-16 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer group">
          <Image
            src="/Book lover-amico.png"
            alt="Books & Culture"
            fill
            className="object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Books & Culture
          </div>
        </div>
        <div className="relative w-16 h-16 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer group">
          <Image
            src="/Drive-in movie theater-amico.png"
            alt="Movies & Entertainment"
            fill
            className="object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Movies & Entertainment
          </div>
        </div>
      </div>

      <Card className="h-[650px] flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-0 shadow-2xl overflow-hidden relative">
        {/* Floating background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 left-8 w-20 h-20 border border-indigo-200/30 dark:border-indigo-700/30 rounded-full animate-float" />
          <div className="absolute bottom-12 right-12 w-16 h-16 border border-rose-200/30 dark:border-rose-700/30 rounded-full animate-float-delayed" />
          <div className="absolute top-1/3 right-8 w-2 h-2 bg-amber-400/30 rounded-full animate-bounce-gentle" />
        </div>

        <ScrollArea className="flex-1 p-6 relative z-10" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex animate-fade-in-up ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`flex space-x-4 max-w-[85%] group ${
                    message.role === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  {/* Enhanced Avatars with User Initials */}
                  <div className="relative flex-shrink-0">
                    <Avatar
                      className={`h-10 w-10 shadow-lg transition-all duration-300 group-hover:scale-110 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-blue-700"
                          : "bg-gradient-to-r from-rose-500 to-coral-500"
                      }`}
                    >
                      <AvatarFallback className="text-white font-semibold">
                        {message.role === "user" ? (
                          getUserInitial()
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Status indicator */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                        message.role === "user"
                          ? "bg-indigo-500"
                          : "bg-emerald-500 animate-pulse"
                      }`}
                    />
                  </div>

                  {/* Message Content */}
                  <div className="flex-1">
                    <div
                      className={`prose prose-sm max-w-none ${
                        message.role === "user"
                          ? "text-white bg-gradient-to-r from-indigo-600 to-blue-700 p-3 rounded-lg shadow-lg"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {/* Split content by lines and format appropriately */}
                      {message.content.split("\n").map((line, lineIndex) => {
                        // Handle empty lines
                        if (line.trim() === "") {
                          return <br key={lineIndex} />;
                        }

                        // Handle bullet points with 👉
                        if (line.trim().startsWith("👉")) {
                          return (
                            <div
                              key={lineIndex}
                              className="flex items-start space-x-2 mt-2 p-2 bg-violet-50 dark:bg-violet-950/30 rounded-lg"
                            >
                              <span className="text-violet-600 dark:text-violet-400 text-sm font-medium">
                                {line.trim()}
                              </span>
                            </div>
                          );
                        }

                        // Handle lines with **bold** text
                        if (line.includes("**")) {
                          const parts = line.split("**");
                          return (
                            <p key={lineIndex} className="mb-2">
                              {parts.map((part, partIndex) =>
                                partIndex % 2 === 1 ? (
                                  <strong
                                    key={partIndex}
                                    className="font-semibold text-violet-700 dark:text-violet-300"
                                  >
                                    {part}
                                  </strong>
                                ) : (
                                  <span key={partIndex}>{part}</span>
                                )
                              )}
                            </p>
                          );
                        }

                        // Regular text
                        return (
                          <p key={lineIndex} className="mb-2">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enhanced Message Actions */}
                  {message.role === "assistant" && (
                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          isSpeaking
                            ? stopSpeaking()
                            : speakMessage(message.content)
                        }
                        className="h-8 px-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-slate-200/50 dark:border-slate-600/50 transition-all duration-300 hover:scale-105"
                      >
                        {isSpeaking ? (
                          <VolumeX className="h-3 w-3 text-rose-500" />
                        ) : (
                          <Volume2 className="h-3 w-3 text-indigo-600" />
                        )}
                      </Button>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Enhanced Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex space-x-4 group">
                  <div className="relative">
                    <Avatar className="h-10 w-10 bg-gradient-to-r from-rose-500 to-coral-500 shadow-lg">
                      <AvatarFallback className="text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900" />
                  </div>

                  <Card className="bg-gradient-to-r from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-700/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gradient-to-r from-rose-400 to-coral-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          AI is thinking...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Enhanced Quick Reply Chips */}
        {/* AI Thinking State */}
        {isLoading && thinkingState && (
          <div className="flex items-center justify-start mb-4">
            <div className="bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-950/30 dark:to-cyan-950/30 rounded-lg p-4 max-w-md animate-pulse">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
                <span className="text-sm text-violet-700 dark:text-violet-300 ml-2">
                  {thinkingState}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Reply Chips - Show when no messages or after assistant response */}
        {(messages.length === 0 ||
          (messages[messages.length - 1]?.role === "assistant" &&
            !isLoading)) && (
          <QuickReplyChips
            onReply={handleQuickReply}
            userAffinities={userAffinities}
            userCity={
              userAffinities.find(
                (tag) => tag.includes("new_delhi") || tag.includes("delhi")
              )
                ? "New Delhi"
                : undefined
            }
          />
        )}

        {/* Enhanced Input Area */}
        <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm relative z-10">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? "🎤 Listening for your voice..."
                    : "Ask me about restaurants, travel, or cultural experiences..."
                }
                onKeyPress={(e) =>
                  e.key === "Enter" && handleSendMessage(input)
                }
                disabled={isLoading}
                className={`pr-12 transition-all duration-300 ${
                  isListening
                    ? "border-rose-300 bg-gradient-to-r from-rose-50 to-coral-50 dark:from-rose-950/20 dark:to-coral-950/20 shadow-rose-glow animate-pulse"
                    : "border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                } shadow-lg`}
              />

              {/* Input status indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isListening ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    <Mic className="h-4 w-4 text-rose-500 animate-bounce" />
                  </div>
                ) : (
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      input.trim()
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                )}
              </div>
            </div>

            <Button
              onClick={() => handleSendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-indigo-600 to-rose-500 hover:from-indigo-700 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100 px-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Send className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 relative z-10" />
            </Button>
          </div>

          {/* Input hints */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>
                Try: "Plan a weekend in Tokyo" or "Find Italian restaurants"
              </span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs border">
                Enter
              </kbd>
              <span>to send</span>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
