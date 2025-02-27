
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { formatContent } from "@/components/Message";

/**
 * useChat hook:
 * - Handles sending messages and receiving responses from the AI server.
 * - Used in: ChatInterface component.
 * - Calls: useToast, formatContent, fetch to FastAPI endpoint
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const useChat = (
  setConversations: (
    updater: (prevConversations: any[]) => any[]
  ) => void,
  activeConversationId: string,
  conversations: any[]
) => {
  const [isLoadingChat, setIsLoadingChat] = useState(false);
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

    // Find the current conversation
    const currentConversation = conversations.find(conv => conv.id === conversationId);
    if (!currentConversation) {
      console.error("Conversation not found");
      return;
    }

    // Create updated conversation with the new user message
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage]
    };

    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, userMessage, assistantMessage] }
          : conv
      )
    );

    setIsLoadingChat(true);
    setIsStreaming(true);

    try {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const requestBody = JSON.stringify({
        message: updatedConversation
      });

      const response = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_FASTAPI_PORT}/chat`, {
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

      setIsLoadingChat(false);

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
        } else if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
          console.error("Server connection failed:", error);
          toast({
            title: "Connection Error",
            description: "Cannot connect to AI server. Please ensure it's running on port " + process.env.NEXT_PUBLIC_FASTAPI_PORT,
            variant: "destructive",
          });} else {
          console.error("Error in chat:", error);
          toast({
            title: "Error",
            description: "Failed to send message",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoadingChat(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return {
    isLoadingChat,
    isStreaming,
    handleSendMessage,
    handleStopGeneration
  };
};
