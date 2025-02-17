
import { ChatInterface } from "@/components/ChatInterface";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Chat = () => {
  return (
    <ProtectedRoute>
      <ChatInterface />
    </ProtectedRoute>
  );
};

export default Chat;

