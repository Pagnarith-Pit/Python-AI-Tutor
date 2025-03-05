
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, StopCircle, LockIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useMessageDraft } from "@/hooks/useMessageDraft";

interface MessageInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  conversationId: string;
  isCompleted?: boolean;
}

export const MessageInput = ({ 
  onSend, 
  onStop, 
  disabled, 
  isGenerating,
  conversationId,
  isCompleted = false
}: MessageInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messageDraft, updateMessageDraft } = useMessageDraft(conversationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageDraft.trim() && !disabled && !isCompleted) {
      onSend(messageDraft);
      updateMessageDraft('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [messageDraft]);

  if (isCompleted) {
    return (
      <div className="p-4 bg-white border-t">
        <div className="mx-auto max-w-3xl flex gap-4">
          <div className="flex-1 bg-gray-100 rounded-md p-4 text-center flex items-center justify-center">
            <LockIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-600">Want some more challenge? Start a New Chat. Hi</span>
          </div>
          <div className="h-[60px] w-[60px]"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
      <div className="mx-auto max-w-3xl flex gap-4">
        <Textarea
          ref={textareaRef}
          value={messageDraft}
          onChange={(e) => updateMessageDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[60px] resize-none"
          disabled={disabled}
        />
        {isGenerating ? (
          <Button
            type="button"
            size="icon"
            onClick={onStop}
            className="h-[60px] w-[60px] bg-red-600 hover:bg-red-700"
          >
            <StopCircle className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!messageDraft.trim() || disabled}
            className="h-[60px] w-[60px] bg-purple-600 hover:bg-purple-700"
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
    </form>
  );
};
