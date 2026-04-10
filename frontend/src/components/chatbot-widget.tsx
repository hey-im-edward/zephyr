"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { requestChatbotCompletion } from "@/lib/api";
import type { ChatbotMessage } from "@/lib/types";

const MAX_HISTORY = 10;

const INITIAL_ASSISTANT_MESSAGE: ChatbotMessage = {
  role: "assistant",
  content: "Xin chào, mình là trợ lý ZEPHYR. Bạn có thể hỏi về sản phẩm, checkout, thanh toán hoặc theo dõi đơn hàng.",
};

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function sendMessage() {
    const trimmed = draftMessage.trim();
    if (!trimmed || isSending) {
      return;
    }

    const history = messages.slice(-MAX_HISTORY);
    const userMessage: ChatbotMessage = {
      role: "user",
      content: trimmed,
    };

    setErrorMessage(null);
    setDraftMessage("");
    setMessages((current) => [...current, userMessage]);
    setIsSending(true);

    try {
      const completion = await requestChatbotCompletion({
        message: trimmed,
        history,
      });

      const assistantReply: ChatbotMessage = {
        role: "assistant",
        content: completion.answer,
      };

      setMessages((current) => [...current, assistantReply]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Không thể kết nối chatbot lúc này.";
      setErrorMessage(detail);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Mình tạm thời gặp lỗi kết nối. Bạn thử lại sau ít phút nhé.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="surface-strong w-[min(92vw,23rem)] rounded-[1.7rem] border border-(--line) p-4 shadow-[0_24px_48px_rgba(33,60,115,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-(--foreground-dim)">AI assistant</div>
              <div className="mt-1 font-semibold text-(--foreground-hero)">Trợ lý mua hàng ZEPHYR</div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 max-h-[20rem] space-y-2 overflow-y-auto rounded-2xl border border-(--line) bg-white/65 p-3">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-[linear-gradient(135deg,var(--brand-gold),#efc57e,var(--brand-rose))] text-(--brand-ink)"
                      : "border border-(--line) bg-white text-(--foreground)"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {errorMessage ? (
            <div className="mt-2 rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-3 space-y-2">
            <Textarea
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder="Hỏi về sản phẩm, checkout, thanh toán..."
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              className="min-h-20"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] leading-5 text-(--foreground-dim)">
                Dữ liệu quan trọng vẫn cần đối soát bởi nhân viên vận hành.
              </div>
              <Button type="button" size="sm" disabled={isSending || !draftMessage.trim()} onClick={() => void sendMessage()}>
                {isSending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Đang trả lời
                  </>
                ) : (
                  "Gửi"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-12 rounded-full px-4 shadow-[0_18px_36px_rgba(45,86,165,0.24)]"
        >
          <Sparkles className="h-4 w-4" />
          Chat với AI
        </Button>
      )}
    </div>
  );
}
