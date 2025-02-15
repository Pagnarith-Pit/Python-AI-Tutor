import { useState, useEffect, useRef } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ConversationList } from "./ConversationList";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "./ui/use-toast";

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

  const handleSendMessage = async (content: string) => {
    // Lock in the current conversation so that even if the active conversation changes,
    // we update the right one.
    const conversationId = activeConversationId;

    // Create our user message
    const userMessage: Message = { role: "user", content };
    // Create a placeholder for the assistant message that will be updated as the stream comes in.
    const assistantMessage: Message = { role: "assistant", content: "" };

    // Build the new messages array.
    // (Since setState is async, we don’t want to rely on a variable computed before this point.)
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, userMessage, assistantMessage] }
          : conv
      )
    );

    // Update the active conversation with the new user message
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage],
    };

    setIsLoading(true);

    try {
      // Build the request body.
      // We know what messages we just added so we don’t rely on a stale snapshot.
      const requestBody = JSON.stringify({ message: updatedConversation });

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let accumulatedContent = "";
      // Clear any previous content.
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
            let data = line.slice(6);
            // Check if data is only \r and replace it with a space, otherwise remove \r
            // if (data === "\r") {
            //   data = " ";
            // } else {
            //   data = data.replace(/\r/g, "");
            // }

            const detailed = [...data].map((char, index) => {
              return `Index ${index}: "${char}" (Code: ${char.charCodeAt(0)})`;
            }).join("\n");
            
            console.log(detailed);

            accumulatedContent += data;
            accumulatedContentRef.current = accumulatedContent;
            // Testing to see if the elements are being removed
            const currentConversation = conversations.find(conv => conv.id === conversationId);
            // Use a functional update so that you always work off the latest state.
            setConversations((prevConversations) =>
              prevConversations.map((conv) => {
                if (conv.id === conversationId) {
                  // Copy the messages array
                  const messages = [...conv.messages];
                  // Always update the last message (the assistant message)
                  const lastIndex = messages.length - 1;
                  // console.log(messages[lastIndex].content);
                  // console.log("Spacing");
                  // console.log(formatContent(accumulatedContentRef.current));
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
      console.error("Error in chat:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
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

  // Recompute the active conversation on every render
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
        <MessageList messages={activeConversation.messages} isLoading={isLoading} />
        <MessageInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};
