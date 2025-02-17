
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { formatContent } from "@/components/Message";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const useChat = (
  setConversations: (
    updater: (prevConversations: any[]) => any[]
  ) => void,
  activeConversationId: string
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef("");

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    const conversationId = activeConversationId;
    const userMessage: Message = { role: "user", content };
    const assistantMessage: Message = { role: "assistant", content: "" };

    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, userMessage, assistantMessage] }
          : conv
      )
    );

    setIsLoading(true);
    setIsStreaming(true);

    try {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Create a full record of the conversation so far
      const requestBody = JSON.stringify({
        message: {
          ...updatedConversation,
          messages: [...updatedConversation.messages, userMessage],
        },
      });

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      accumulatedContentRef.current = "";

      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsStreaming(false);
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = formatContent(line.slice(6));
            accumulatedContentRef.current += data;

            setConversations((prevConversations) =>
              prevConversations.map((conv) => {
                if (conv.id === conversationId) {
                  const messages = [...conv.messages];
                  const lastIndex = messages.length - 1;
                  messages[lastIndex] = {
                    ...messages[lastIndex],
                    content: accumulatedContentRef.current,
                  };
                  return { ...conv, messages };
                }
                return conv;
              })
            );
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error("Error in chat:", error);
          toast({
            title: "Error",
            description: "Failed to send message",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return {
    isLoading,
    isStreaming,
    handleSendMessage,
    handleStopGeneration
  };
};
