
import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/lib/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  messages: Message[];
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: uuidv4(), messages: [] }
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversations[0].id
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();

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

  const removeConversation = (id: string) => {
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

  const createNewChat = () => {
    // Check if there's already an empty conversation
    const hasEmptyChat = conversations.some(conv => conv.messages.length === 0);
    
    if (hasEmptyChat) {
      // Find the empty conversation and set it as active
      const emptyChat = conversations.find(conv => conv.messages.length === 0);
      if (emptyChat) {
        setActiveConversationId(emptyChat.id);
      }
      return; // Don't create a new chat
    }

    // If no empty chat exists, create a new one
    const newConversation = {
      id: uuidv4(),
      messages: [],
    };
    setConversations((prev) => [...prev, newConversation]);
    setActiveConversationId(newConversation.id);
  };

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    removeConversation,
    createNewChat,
    fetchConversations,
    isInitialLoad,
    setConversations
  };
};
