import { MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "./ui/button";
import supabase from "@/lib/supabase";

interface Conversation {
  id: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  user: { id: string };
}

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  onNewChat,
  user,
}: ConversationListProps) => {
  const { toast } = useToast();
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const saveConversations = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .upsert(
          conversations.map(conv => ({
            ...conv,
            user_id: user.id,
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

  useEffect(() => {
    if (user && conversations.length > 0) {
      const timeoutId = setTimeout(() => {
        saveConversations();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [conversations, user]);

  const handleDeleteConversation = async (id: string, user: { id: string }) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

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

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full rounded-lg py-6 text-base font-medium"
          onClick={onNewChat}
        >
          Start A New Chat
        </Button>
      </div>

      {conversations.length > 0 && (
        <div className="px-2 space-y-1">
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            const preview = lastMessage
              ? lastMessage.content.slice(0, 20) + "..."
              : "How can I help today?";

            return (
              <div
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "relative px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-lg",
                  activeConversationId === conversation.id && "bg-gray-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                  <div className="truncate text-sm text-gray-600">{preview}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conversation.id, { id: user.id });
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};