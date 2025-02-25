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
  model_think: string;
  model_solution: string;
  progress: number;
}

/**
 * useConversations hook:
 * - Manages the state of conversations and active conversation.
 * - Used in: ChatInterface component.
 * - Calls: useAuth, useToast, supabase.from('conversations').select, supabase.from('conversations').upsert
 */
export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
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

      if (data && data.length >= 1) {
        setConversations(data);
        setActiveConversationId(data[0].id);
      } 
      else {
        // If nothing exist, create that form
        createNewChat();
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
          const newConversation = { id: uuidv4(), messages: [], model_think: '', model_solution: '', progress: 0 };
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
      model_think: '',
      model_solution: '',
      progress: 0
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
    setConversations,
  };
};

/**
 * useSaveConversations hook:
 * - Saves a single conversation to the database.
 * - Used in: useHandleSubmit, useConversation hook.
 * - Calls: useToast, supabase.from('conversations').upsert
 */
export const useSaveConversations = () => {
  const { toast } = useToast();

  const saveConversations = async (activeConversationId: string, userId: string, model_reasoning: string, model_answer: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .upsert({
          id: activeConversationId,
          user_id: userId,
          model_think: model_reasoning,
          model_solution: model_answer,
          progress: 0,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving conversations at start:", error);
      toast({
        title: "Error",
        description: "Failed to save conversations at start",
        variant: "destructive",
      });
    }
  };

  return { saveConversations };
};
