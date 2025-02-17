import { useState, useEffect, useRef } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ConversationList } from "./ConversationList";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "./ui/use-toast";
import { formatContent } from "./Message";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "./LoginForm";
import supabase from "@/lib/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  messages: Message[];
}

export const ChatInterface = () => {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: uuidv4(), messages: [] }
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversations[0].id
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef("");

  // Fetch conversations when user loads
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;

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

    if (user) {
      fetchConversations();
    }
  }, [user, toast]);

  // This callback simply updates ChatInterface's state after deletion.
  const removeConversationFromState = (id: string) => {
    setConversations((prevConversations) => {
      const updated = prevConversations.filter((conv) => conv.id !== id);
      if (activeConversationId === id) {
        if (updated.length > 0) {
          setActiveConversationId(updated[0].id);
        } else {
          const newConversation = { id: uuidv4(), messages: [] };
          setActiveConversationId(newConversation.id);
          return [newConversation];
        }
      }
      return updated;
    });
  };

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

    const updatedConversation = conversations.find(
      (conv) => conv.id === conversationId
    );

    if (!updatedConversation) return;

    setIsLoading(true);
    setIsStreaming(true);

    try {
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

  const handleNewChat = () => {
    const newConversation = {
      id: uuidv4(),
      messages: [],
    };
    setConversations((prev) => [...prev, newConversation]);
    setActiveConversationId(newConversation.id);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
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
        onDelete={removeConversationFromState} // ChatInterface simply passes this prop
        onNewChat={handleNewChat}
        user = {user}
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
          isGenerating={isStreaming}
        />
      </div>
    </div>
  );
};
