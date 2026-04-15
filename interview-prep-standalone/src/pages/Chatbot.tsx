import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, RotateCcw, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Make sure your tailwind utils path is correct

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
}

const suggestedPrompts = [
  "How do I prepare for a system design interview?",
  "What are the most common behavioral interview questions?",
  "Explain Big O notation with examples",
  "Help me practice STAR method answers",
];

const initialMessages: Message[] = [
  {
    id: 1,
    role: "ai",
    content: "Hi there! I'm your AI interview coach. I can help you practice interview questions, improve your answers, explain technical concepts, and give you personalized feedback. What would you like to work on today?",
    timestamp: new Date(),
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 max-w-3xl">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="chat-ai rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onLike, onDislike }: { msg: Message; onLike: () => void; onDislike: () => void }) {
  const isAI = msg.role === "ai";

  const formatContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className={cn("flex items-end gap-3 max-w-3xl group", !isAI && "ml-auto flex-row-reverse")}>
      {isAI ? (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
          PS
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-lg",
            isAI
              ? "chat-ai text-white/90 rounded-bl-sm border border-white/10"
              : "chat-user text-white rounded-br-sm bg-purple-600"
          )}
        >
          {formatContent(msg.content)}
        </div>

        {isAI && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            <span className="text-[10px] text-muted-foreground">
              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button
              onClick={() => navigator.clipboard?.writeText(msg.content)}
              className="p-1 rounded-md hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={onLike}
              className={cn("p-1 rounded-md hover:bg-white/5 transition-colors", msg.liked ? "text-green-400" : "text-muted-foreground hover:text-white")}
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={onDislike}
              className={cn("p-1 rounded-md hover:bg-white/5 transition-colors", msg.disliked ? "text-red-400" : "text-muted-foreground hover:text-white")}
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 1. Create a database conversation when the chat loads
  useEffect(() => {
    const initConversation = async () => {
      try {
        const res = await fetch("https://prepify-ai-wuil.onrender.com/api/chatbot/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Interview Prep Session" }),
        });
        const data = await res.json();
        setConversationId(data.id);
        console.log("✅ Conversation created in DB with ID:", data.id);
      } catch (err) {
        console.error("❌ Failed to create conversation:", err);
      }
    };
    initConversation();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    if (!conversationId) {
      alert("Still connecting to database, please wait a second...");
      return;
    }

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const aiMsgId = Date.now() + 1;
    setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", content: "", timestamp: new Date() }]);

    try {
      const res = await fetch(`https://prepify-ai-wuil.onrender.com/api/chatbot/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText }), 
      });

      if (!res.ok) throw new Error("Network error from backend");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiFullResponse = "";

      if (reader) {
        setIsTyping(false); 

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "");
              try {
                const data = JSON.parse(dataStr);
                
                if (data.done) break;

                if (data.content) {
                  aiFullResponse += data.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMsgId ? { ...msg, content: aiFullResponse } : msg
                    )
                  );
                }
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId ? { ...msg, content: "❌ Error connecting to AI. Is your backend running?" } : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLike = (id: number) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, liked: !m.liked, disliked: false } : m)));
  };

  const handleDislike = (id: number) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, disliked: !m.disliked, liked: false } : m)));
  };

  return (
    <div className="flex flex-col h-full bg-black page-enter">
      <div className="px-4 md:px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">PrepAI Coach</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Online · Grok-3 Powered</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setMessages(initialMessages)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-muted-foreground hover:text-white transition-all hover:scale-105"
        >
          <RotateCcw className="w-3 h-3" />
          Clear chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onLike={() => handleLike(msg.id)}
            onDislike={() => handleDislike(msg.id)}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-4 md:px-6 py-3 flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-muted-foreground hover:text-white hover:border-purple-500/30 transition-all hover:scale-105"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 md:px-6 py-4 border-t border-white/5 flex-shrink-0">
        <div className="relative flex items-end gap-3 rounded-2xl border border-white/10 focus-within:border-purple-500/40 transition-all p-2 pr-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about interview prep..."
            rows={1}
            style={{ resize: "none", minHeight: "36px", maxHeight: "120px" }}
            className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping || !conversationId}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
              input.trim() && !isTyping && conversationId
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:scale-110 active:scale-95"
                : "bg-white/5 text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/50 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}