
import { useState, useEffect, useRef } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ConversationList } from "./ConversationList";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "./ui/use-toast";
import { formatContent } from "./Message";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  messages: Message[];
}

export const ChatInterface = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: uuidv4(), messages: [] }
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversations[0].id
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // This ref will store the accumulated stream data.
  const accumulatedContentRef = useRef("");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/get-conversations");
        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }
        const data = await response.json();

        if (data && data.length > 0) {
          setConversations(data);
          setActiveConversationId(data[0].id);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive",
        });
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchConversations();
  }, [toast]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
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

    const updatedConversation = conversations.find(
      (conv) => conv.id === conversationId
    );

    if (!updatedConversation) return;

    setIsLoading(true);

    try {
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

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
        signal, // Pass the signal to the fetch request
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      accumulatedContentRef.current = "";

      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        if (isFirstChunk) {
          setIsLoading(false);
          isFirstChunk = false;
        }

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
    } catch (error) {
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
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleNewChat = () => {
    const newConversation = {
      id: uuidv4(),
      messages: [],
    };
    setConversations((prev) => [...prev, newConversation]);
    setActiveConversationId(newConversation.id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prevConversations) => {
      const updatedConversations = prevConversations.filter(
        (conv) => conv.id !== id
      );

      if (activeConversationId === id) {
        if (updatedConversations.length > 0) {
          setActiveConversationId(updatedConversations[0].id);
        } else {
          const newConversation = { id: uuidv4(), messages: [] };
          setActiveConversationId(newConversation.id);
          return [newConversation];
        }
      }
      return updatedConversations;
    });
  };

  if (isInitialLoad) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0];

  return (
    <div className="flex h-screen bg-gray-50">
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={setActiveConversationId}
        onDelete={handleDeleteConversation}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList 
          messages={activeConversation.messages} 
          isLoading={isLoading} 
        />
        <MessageInput 
          onSend={handleSendMessage} 
          onStop={handleStopGeneration}
          disabled={isLoading} 
          isGenerating={isLoading}
        />
      </div>
    </div>
  );
};
