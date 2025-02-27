
import { useEffect, useRef } from "react";
import { Message } from "./Message";

interface MessageType {
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: MessageType[];
  isLoadingChat?: boolean;
  isLoadingSolution?: boolean;
}

/**
 * @description MessageList component renders a list of messages.
 * @parent ChatInterface
 * @child Message
 * @output A list of Message components.
 */

export const MessageList = ({ messages, isLoadingChat, isLoadingSolution }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingChat]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="h-full flex bg-background items-center justify-left">
          <div className="text-left mt-[10%] px-8">
            <p>Placeholder</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <div key={index}>
              <Message 
                {...message} 
                isLoadingSolution={isLoadingSolution && index === messages.length - 1} // Pass isLoadingSolution to Message
                isLastMessage={!isLoadingChat && index === messages.length - 1 && message.role === "assistant"}
                isFirstMessage={index === 0 && message.role === "user"}
              />
            </div>
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};
