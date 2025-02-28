import { useToast } from "@/components/ui/use-toast";
import supabase from "@/lib/supabase";

/**
 * useSaveConversationList hook:
 * - Saves the list of conversations to the database.
 * - Used in: ConversationList component.
 * - Calls: useToast, supabase.from('conversations').upsert
 */
export const useSaveConversationList = (conversations: any[], userId: string) => {
  const { toast } = useToast();

  const saveConversations = async () => {
    if (!userId) return;

    // santiize the conversations to maintain the created_at date
    const sanitizedConversations = conversations.map((conv) => ({
      id: conv.id,
      user_id: userId,
      messages: conv.messages,
      progress: conv.progress || 0,  // Use the item's progress or default to 0
      model_think: conv.model_think || '',
      model_solution: conv.model_solution || '',
      updated_at: new Date().toISOString()
    }));

    try {
      const { error } = await supabase
        .from('conversations')
        .upsert(sanitizedConversations);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving conversations:", error);
      toast({
        title: "Error",
        description: "Failed to save conversations",
        variant: "destructive",
      });
    }
  };

  return { saveConversations };
};