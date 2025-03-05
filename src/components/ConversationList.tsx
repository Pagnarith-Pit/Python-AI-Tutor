import { MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useDeleteConversation } from "@/hooks/useDeleteConversation";
import { useSaveConversationList } from "@/hooks/useSaveConversationList";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface Conversation {
  id: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  progress: number; 
  model_think?: string;
  model_solution?: string;
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
  const conversationsRef = useRef(conversations);
  const { deleteConversation } = useDeleteConversation();
  const { saveConversations } = useSaveConversationList(conversations, user.id);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (user && conversations.length > 0) {
      const timeoutId = setTimeout(() => {
        saveConversations();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [conversations, user]);

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setPendingDeleteId(conversationId);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      deleteConversation(pendingDeleteId, user.id, onDelete);
      setPendingDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <AlertDialog open={pendingDeleteId !== null} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-4">
        <Button
          variant="outline"
          className="w-full rounded-lg py-6 text-base font-medium"
          onClick={onNewChat}
        >
          Start A New Problem
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
                  onClick={(e) => handleDeleteClick(e, conversation.id)}
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