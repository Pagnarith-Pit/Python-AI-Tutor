
import { useEffect, useRef } from "react";
import { Message } from "./Message";

interface MessageType {
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>Start a conversation by typing a message below.</p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <Message key={index} {...message} />
          ))}
          {isLoading && (
            <Message
              role="assistant"
              content=""
              isLoading={true}
            />
          )}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};
