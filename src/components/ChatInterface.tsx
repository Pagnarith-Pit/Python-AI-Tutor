import { useState, useEffect, useRef } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ConversationList } from "./ConversationList";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "./ui/use-toast";
import {formatContent} from "./Message";

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
  const [activeConversationId, setActiveConversationId] = useState<string>(conversations[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();

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
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0];

  const accumulatedContentRef = useRef("");

  const handleSendMessage = async (content: string) => {
    const userMessage = { role: "user" as const, content };

    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    setIsLoading(true);

    try {
      const assistantMessage = { role: "assistant" as const, content: "" };
      
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...conv.messages, assistantMessage] }
            : conv
        )
      );

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            messages: [...activeConversation.messages, userMessage].map(({ role, content }) => ({
              role,
              content,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (!reader) {
        throw new Error("No reader available");
      }

      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        // console.log(chunk);
        const lines = chunk.split('\n');
        
      //Set the loading to false here
      if (isFirstChunk) {
        setIsLoading(false);
        isFirstChunk = false;
      }

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            accumulatedContent += data;
            accumulatedContentRef.current = accumulatedContent;
            setConversations((prevConversations) =>
              prevConversations.map((conv) =>
                conv.id === activeConversationId
                  ? {
                    ...conv,
                    messages: conv.messages.map((msg, index) =>
                      index === conv.messages.length - 1
                        ? { ...msg, content: formatContent(accumulatedContentRef.current) }
                        : msg
                    ),
                  }
                  : conv
              )
            );
          }
        }
      }

    } catch (error) {
      console.error("Error in chat:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } 
    // finally {
    //   setIsLoading(false);
    // }
  };

  const handleNewChat = () => {
    const newConversation = {
      id: uuidv4(),
      messages: []
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
        <MessageList messages={activeConversation.messages} isLoading={isLoading} />
        <MessageInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};
