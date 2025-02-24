
import { useEffect } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ConversationList } from "./ConversationList";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "./LoginForm";
import { useConversations } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";
import ProblemForm from "./NewProblemForm";

export const ChatInterface = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    removeConversation,
    createNewChat,
    fetchConversations,
    setConversations
  } = useConversations();

  const {
    isLoading,
    isStreaming,
    handleSendMessage,
    handleStopGeneration
  } = useChat(setConversations, activeConversationId, conversations);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0];

  return (
    <div className="flex h-screen bg-gray-50">
      <UserMenu />
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={setActiveConversationId}
        onDelete={removeConversation}
        onNewChat={createNewChat}
        user={user}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeConversation?.messages?.length > 0 ? (
          <>
            <MessageList 
              messages={activeConversation.messages} 
              isLoading={isLoading} 
            />
            <MessageInput 
              onSend={handleSendMessage} 
              onStop={handleStopGeneration}
              disabled={isLoading} 
              isGenerating={isStreaming}
            />
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="h-full flex bg-background items-center justify-center">
              <div className="text-center mt-[10%]">
                <ProblemForm 
                  user={user} 
                  activeConversationId={activeConversationId}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
