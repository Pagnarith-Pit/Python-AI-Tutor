
import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { LoadingMessage } from "./LoadingMessage";
import { LoadingDots } from "./LoadingDots";
import ProblemForm from "./NewProblemForm";

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
        <div className="h-full flex bg-background items-center justify-center">
        <div className="text-center mt-[10%]">
          <p>Placeholder</p>
        </div>
      </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <div key={index}>
              <Message 
                {...message} 
                isLoading={isLoading && index === messages.length - 1 && message.role === "assistant"}
                isLastMessage={!isLoading && index === messages.length - 1 && message.role === "assistant"}
              />
            </div>
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};
