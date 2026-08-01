import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrainCircuit, Send, User, Trash2, Plus, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useListOpenaiConversations, useCreateOpenaiConversation, useGetOpenaiConversation, useDeleteOpenaiConversation, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Advisor() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Extract ID from path like /advisor/123 or just /advisor
  const pathParts = location.split('/');
  const conversationId = pathParts.length > 2 ? parseInt(pathParts[2]) : null;

  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useListOpenaiConversations();
  const { data: currentConvo, isLoading: isLoadingConvo } = useGetOpenaiConversation(conversationId || 0, {
    query: { enabled: !!conversationId, queryKey: ['/api/openai/conversations', String(conversationId)] }
  });

  const createConvo = useCreateOpenaiConversation();
  const deleteConvo = useDeleteOpenaiConversation();

  const handleNewChat = () => {
    createConvo.mutate(
      { data: { title: "New Conversation" } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          setLocation(`/advisor/${data.id}`);
        }
      }
    );
  };

  const handleDeleteChat = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteConvo.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          if (conversationId === id) {
            setLocation("/advisor");
          }
        }
      }
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;

    const messageToSend = inputMessage;
    setInputMessage("");
    setIsStreaming(true);
    setStreamedContent("");

    // Optimistically add user message via query client cache patching or just wait for invalidation.
    // For simplicity, we'll let the SSE stream append and invalidate at end.
    
    try {
      const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
      const response = await fetch(`${BASE}/api/openai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageToSend }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.content) {
                setStreamedContent(prev => prev + data.content);
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
    } finally {
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['/api/openai/conversations', String(conversationId)] });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConvo?.messages, streamedContent]);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-card border rounded-2xl overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b">
          <Button onClick={handleNewChat} className="w-full gap-2 shadow-sm" disabled={createConvo.isPending}>
            <Plus className="size-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations?.map((convo) => (
              <div
                key={convo.id}
                onClick={() => setLocation(`/advisor/${convo.id}`)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors text-sm group",
                  conversationId === convo.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="size-4 shrink-0" />
                  <span className="truncate">{convo.title}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive shrink-0"
                  onClick={(e) => handleDeleteChat(e, convo.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-background/50">
        {!conversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <BrainCircuit className="size-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">FinanceAI Advisor</h2>
            <p className="text-muted-foreground max-w-md">
              I'm your personal wealth management assistant. I can analyze your spending, suggest investment strategies, or help you build a budget.
            </p>
            <Button onClick={handleNewChat} size="lg" className="mt-4 shadow-md shadow-primary/20">
              Start a Conversation
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-6 max-w-3xl mx-auto pb-4">
                {currentConvo?.messages?.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id || i} 
                    className={cn(
                      "flex gap-4",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className={cn("size-8 mt-1", msg.role === "assistant" && "bg-primary/20 p-1")}>
                      {msg.role === "user" ? (
                        <>
                          <AvatarImage src="https://i.pravatar.cc/150?u=financeai" />
                          <AvatarFallback>AW</AvatarFallback>
                        </>
                      ) : (
                        <BrainCircuit className="size-6 text-primary" />
                      )}
                    </Avatar>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap leading-relaxed shadow-sm",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-card border rounded-tl-sm"
                    )}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isStreaming && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 flex-row"
                  >
                    <Avatar className="size-8 mt-1 bg-primary/20 p-1">
                      <BrainCircuit className="size-6 text-primary" />
                    </Avatar>
                    <div className="px-4 py-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap leading-relaxed shadow-sm bg-card border rounded-tl-sm">
                      {streamedContent || (
                        <div className="flex gap-1 items-center h-5">
                          <div className="size-1.5 bg-primary/50 rounded-full animate-bounce" />
                          <div className="size-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="size-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
              <div className="max-w-3xl mx-auto relative">
                <Input 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your finances, investments, or budget..."
                  className="pr-12 h-14 rounded-full bg-background border shadow-sm focus-visible:ring-primary/50 text-base"
                  disabled={isStreaming}
                />
                <Button 
                  size="icon" 
                  className="absolute right-2 top-2 size-10 rounded-full shrink-0 shadow-md shadow-primary/20"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isStreaming}
                >
                  <Send className="size-4" />
                </Button>
              </div>
              
              {!currentConvo?.messages?.length && (
                <div className="max-w-3xl mx-auto flex flex-wrap gap-2 mt-4 justify-center">
                  {["How can I save more money?", "Analyze my spending.", "Explain SIP.", "Build an emergency fund."].map(prompt => (
                    <Badge 
                      key={prompt}
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-xs font-normal px-3 py-1.5"
                      onClick={() => setInputMessage(prompt)}
                    >
                      {prompt}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
