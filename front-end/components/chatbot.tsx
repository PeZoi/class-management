"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CHATBOT_API_URL } from "@/constants/env";

/** Render câu trả lời dạng markdown, giống con người (đầu dòng, in đậm, danh sách). */
function AnswerContent({ text }: { text: string }) {
  return (
    <div className="text-sm leading-relaxed [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-2 [&_li]:my-0.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-0.5 my-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-0.5 my-2">{children}</ol>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

const EDGE_MARGIN = 24;
const BUTTON_SIZE = 56;
const DRAG_THRESHOLD_PX = 8; // Chỉ coi là drag khi di chuyển > 8px, tránh click nhẹ bị chặn toggle

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type Position = { side: "left" | "right"; bottom: number };

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Xin chào! Tôi có thể giúp gì cho bạn?",
  timestamp: new Date(),
};

function resolveChatbotBaseUrl() {
  const fromEnv = (CHATBOT_API_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    const { hostname, port } = window.location;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    if (isLocalhost) {
      // Dev mode: Next chạy ở 3001, FastAPI chatbot thường ở 8000
      return "http://localhost:8000";
    }
  }

  // Prod (qua Nginx / Docker): dùng đường dẫn tương đối, đã được proxy trong nginx.conf
  return "/chatbot";
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<Position>({ side: "right", bottom: EDGE_MARGIN });
  const [dragState, setDragState] = useState<{
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);
  const [dragView, setDragView] = useState<{ left: number; top: number } | null>(null);
  const didDragRef = useRef(false);

  const snapToEdge = useCallback(
    (clientX: number, clientY: number, start: { startX: number; startY: number; startLeft: number; startTop: number }) => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      const h = typeof window !== "undefined" ? window.innerHeight : 768;
      const currentLeft = start.startLeft + (clientX - start.startX);
      const currentTop = start.startTop + (clientY - start.startY);
      const side: "left" | "right" = currentLeft + BUTTON_SIZE / 2 < w / 2 ? "left" : "right";
      const bottom = h - currentTop - BUTTON_SIZE;
      const clampedBottom = Math.max(EDGE_MARGIN, Math.min(h - EDGE_MARGIN - BUTTON_SIZE, bottom));
      setPosition({ side, bottom: clampedBottom });
    },
    []
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    didDragRef.current = false;
    setDragState({
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect.left,
      startTop: rect.top,
    });
    setDragView({ left: rect.left, top: rect.top });
    // Không setPointerCapture ở đây — nếu capture trên div thì click không tới Button
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (!didDragRef.current && distance > DRAG_THRESHOLD_PX) {
        didDragRef.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
      if (didDragRef.current) {
        e.preventDefault();
        setDragView({
          left: dragState.startLeft + dx,
          top: dragState.startTop + dy,
        });
      }
    },
    [dragState]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;
      if (didDragRef.current) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
      snapToEdge(e.clientX, e.clientY, dragState);
      setDragState(null);
      setDragView(null);
      // Không reset didDragRef ở đây — chỉ reset khi pointerdown (gesture mới), để click sau khi drag không mở sheet
    },
    [dragState, snapToEdge]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearHistory = () => {
    setMessages([WELCOME_MESSAGE]);
    setInputValue("");
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, messages]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const placeholderId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: placeholderId,
        role: "assistant",
        content: "Đang xử lý...",
        timestamp: new Date(),
      },
    ]);

    try {
      const baseUrl = resolveChatbotBaseUrl();
      const res = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await res.json()) as { answer?: string };
      const answer =
        typeof data?.answer === "string" && data.answer.trim()
          ? data.answer.trim()
          : "Xin lỗi, tôi không thể trả lời câu hỏi này.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: answer }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                ...m,
                content:
                  "Không kết nối được chatbot. Kiểm tra NEXT_PUBLIC_CHATBOT_API_URL và CORS.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const buttonStyle = dragView
    ? { left: dragView.left, top: dragView.top, right: undefined, bottom: undefined }
    : position.side === "right"
      ? { right: EDGE_MARGIN, bottom: position.bottom, left: undefined, top: undefined }
      : { left: EDGE_MARGIN, bottom: position.bottom, right: undefined, top: undefined };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        {/* Icon nằm dưới sheet (z-40 < overlay z-50), khi mở sheet sẽ đè lên icon */}
        <div
          className="fixed z-40 size-14"
          style={{
            left: buttonStyle.left ?? undefined,
            right: buttonStyle.right ?? undefined,
            top: buttonStyle.top ?? undefined,
            bottom: buttonStyle.bottom ?? undefined,
            transition: dragView ? "none" : "left 0.2s ease, right 0.2s ease, bottom 0.2s ease, top 0.2s ease",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon-lg"
                type="button"
                className={cn(
                  "size-14 rounded-full shadow-lg touch-none select-none",
                  "bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white",
                  "transition-transform hover:scale-105 active:scale-95",
                  !dragView && "cursor-grab active:cursor-grabbing"
                )}
                style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
                aria-label="Mở chat"
                onClick={(e) => {
                  if (didDragRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  setOpen((prev) => !prev);
                }}
              >
                <MessageCircle className="size-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={12} className="font-medium">
              Mở chat hỗ trợ
            </TooltipContent>
          </Tooltip>
        </div>
        <SheetContent
          side="right"
          className="flex w-full flex-col p-0 sm:max-w-md border-l border-border/80 bg-linear-to-b from-background to-muted/30"
        >
          <SheetHeader className="border-b border-border/80 bg-muted/40 px-5 py-4">
            <SheetTitle className="text-base font-semibold flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <MessageCircle className="size-4" />
              </span>
              Chat hỗ trợ
            </SheetTitle>
          </SheetHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mt-0.5 ring-2 ring-emerald-200/60 dark:ring-emerald-800/50">
                      <MessageCircle className="size-3.5" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-md shadow-md"
                        : "rounded-bl-md shadow-md border border-emerald-200/60 dark:border-emerald-800/50 bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-emerald-900/20 text-foreground"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <AnswerContent text={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input + actions */}
          <div className="border-t border-border/80 bg-muted/30 p-3">
            <div className="flex items-center gap-2 rounded-xl bg-background border border-input shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
              <Input
                placeholder="Nhập tin nhắn..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Xóa lịch sử chat"
                    onClick={handleClearHistory}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6} className="text-xs">
                  Xóa lịch sử chat
                </TooltipContent>
              </Tooltip>
              <Button
                type="button"
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                aria-label="Gửi"
                className="shrink-0 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white disabled:opacity-50"
              >
                <Send className={cn("size-4", isLoading && "animate-pulse")} />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
