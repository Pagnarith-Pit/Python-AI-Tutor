
import { ChatInterface } from "@/components/ChatInterface";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import dynamic from 'next/dynamic';

// Disable SSR for ChatInterface to ensure client-side only rendering
const DynamicChatInterface = dynamic(
  () => import('@/components/ChatInterface').then((mod) => mod.ChatInterface),
  { ssr: false }
);

const Chat = () => {
  return (
    <ProtectedRoute>
      <DynamicChatInterface />
    </ProtectedRoute>
  );
};

export default Chat;
