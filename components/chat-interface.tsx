"use client";

import { ItineraryCard } from "@/components/itinerary-card";
import { QuickReplyChips } from "@/components/quick-reply-chips";
import { RecommendationCard } from "@/components/recommendation-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Bot, Mic, Send, Sparkles, User, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "recommendations" | "itinerary";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your Cultural AI Concierge. Based on your taste profile, I can help you discover amazing restaurants, plan cultural itineraries, or find experiences that match your style. What would you like to explore today?",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Speech recognition setup
  useEffect(() => {
    if (isListening && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");

        if (event.results[event.results.length - 1].isFinal) {
          setInput(transcript);
        }
      };

      recognition.start();
      return () => recognition.stop();
    }
  }, [isListening]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          affinities: userAffinities,
          history: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        type: data.type || "text",
        data: data.data,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update affinities if new ones were detected
      if (data.newAffinities) {
        onAffinitiesUpdate([...userAffinities, ...data.newAffinities]);
      }
    } catch (error: any) {
      const errMsg = error?.message || error?.toString?.() || "Unknown error";
      toast({
        title: "Chat error",
        description: errMsg.includes("OPENAI_API_KEY")
          ? "OpenAI key missing on the server. Add it to your environment variables."
          : errMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    handleSend();
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
                  {/* Enhanced Avatars */}
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
                          <User className="h-5 w-5" />
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

                  <div className="space-y-3 flex-1">
                    {/* Enhanced Message Bubbles */}
                    <Card
                      className={`relative overflow-hidden transition-all duration-500 hover:shadow-lg group-hover:scale-[1.02] ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-indigo-glow border-0"
                          : "bg-gradient-to-r from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-700/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50"
                      }`}
                    >
                      {/* Shimmer effect for AI messages */}
                      {message.role === "assistant" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />
                      )}

                      <CardContent className="p-4 relative z-10">
                        {message.type === "recommendations" && message.data ? (
                          <div className="space-y-4">
                            <p className="text-sm font-medium">
                              {message.content}
                            </p>
                            <div className="grid gap-4">
                              {message.data.recommendations?.map(
                                (rec: any, index: number) => (
                                  <div
                                    key={index}
                                    className="animate-fade-in-up"
                                    style={{
                                      animationDelay: `${index * 100}ms`,
                                    }}
                                  >
                                    <RecommendationCard recommendation={rec} />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ) : message.type === "itinerary" && message.data ? (
                          <div className="space-y-4">
                            <p className="text-sm font-medium">
                              {message.content}
                            </p>
                            <div className="animate-fade-in-up">
                              <ItineraryCard itinerary={message.data} />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                        )}
                      </CardContent>
                    </Card>

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
        <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative z-10">
          <QuickReplyChips onReply={handleQuickReply} />
        </div>

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
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
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
              onClick={handleSend}
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
