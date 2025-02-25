import { useToast } from "@/components/ui/use-toast";
import supabase from "@/lib/supabase";

/**
 * useDeleteConversation hook:
 * - Deletes a conversation from the database.
 * - Used in: ConversationList component.
 * - Calls: useToast, supabase.from('conversations').delete
 */
export const useDeleteConversation = () => {
  const { toast } = useToast();

  const deleteConversation = async (id: string, userId: string, onDelete: (id: string) => void) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      toast({
        title: "Deleted",
        description: "Conversation has been removed",
      });
      // Inform the parent to update the UI.
      onDelete(id);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { deleteConversation };
};