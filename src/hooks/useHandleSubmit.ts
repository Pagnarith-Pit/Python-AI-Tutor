import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/lib/supabase";
import { useSaveConversations } from "@/hooks/useConversations";
import { useConversations } from "@/hooks/useConversations";

/**
 * useHandleSubmit hook:
 * - Handles the form submission for creating a new problem.
 * - Used in: ProblemForm component.
 * - Calls: useToast, useSaveConversations, useConversations, fetch to FastAPI endpoint
 */
export const useHandleSubmit = (
  activeConversationId: string, 
  userId: string, 
  setIsSubmitted: (isSubmitted: boolean) => void,
  setConversations: (updater: (prevConversations: any[]) => any[]) => void
) => {

  const { toast } = useToast();
  const { saveConversations } = useSaveConversations();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    concept: '',
    problemDesc: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create initial message
      const initialMessage = {
        role: 'user' as const,
        content: JSON.stringify(formData)
      };

      // Update conversations immediately with the user's message
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              messages: [initialMessage]
            };
          }
          return conv;
        });
      });

      setIsLoading(true);

      const response = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_FASTAPI_PORT}/createSolution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            messages: formData
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const model_reasoning = data.model_reasoning;
      const model_answer = data.response;

      // Create assistant message
      const assistantMessage = {
        role: 'assistant' as const,
        content: model_answer
      };

      // Update conversations with both messages
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              messages: [initialMessage, assistantMessage],
              model_solution: model_answer,
              model_think: model_reasoning
            };
          }
          return conv;
        });
      });

      // Reset form after successful submission
      setFormData({ concept: '', problemDesc: '' });

      setIsSubmitted(true);

      // Save to database
      await saveConversations(activeConversationId, userId, model_reasoning, model_answer);


    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to submit the form",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    handleSubmit,
    handleChange,
    isLoading
  };
};