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

    try {
      const { error } = await supabase
        .from('conversations')
        .upsert(
          conversations.map(conv => ({
            ...conv,
            user_id: userId,
            updated_at: new Date().toISOString()
          }))
        );

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