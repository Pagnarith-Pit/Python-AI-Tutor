import { MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "./ui/button";

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
}

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  onNewChat,
}: ConversationListProps) => {
  const { toast } = useToast();
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const saveConversations = async () => {
    try {
      console.log("Attempting to save conversations:", conversationsRef.current);
      const response = await fetch("/api/save-conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversations: conversationsRef.current }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save conversations");
      }

      console.log("Conversations saved successfully!");
      // toast({
      //   title: "Saved",
      //   description: "Your conversations have been saved",
      // });
    } catch (error) {
      console.error("Error saving conversations:", error);
      toast({
        title: "Error",
        description: "Conversation Failed To Save.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (conversationsRef.current.length > 0) {
        saveConversations();
      }
    }, 300000); // 300,000 ms = 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch("/api/delete-conversation", {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id }),
      });


    if (response.status === 404) {
      // Handle 404 error specifically
      console.warn("Conversation not found, Deleting from Frontend");
      onDelete(id);
      toast({
        title: "Deleted",
        description: "Conversation has been removed",
      });
      return;
    }

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }
      console.log("Conversation deleted successfully!");
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
                    handleDeleteConversation(conversation.id);
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