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
export const useHandleSubmit = (activeConversationId: string, userId: string) => {
  const { toast } = useToast();
  const { saveConversations } = useSaveConversations();
  const { setConversations } = useConversations();
  const [formData, setFormData] = useState({
    concept: '',
    problemDesc: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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

      // Reset form after successful submission
      setFormData({ concept: '', problemDesc: '' });

      // Handle the response
      const data = await response.json();

      // Save this response to the database
      const model_reasoning = data.model_reasoning;
      const model_answer = data.response;

      // Update the conversation state locally
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, model_solution: model_answer, model_think: model_reasoning }
            : conv
        )
      );

      saveConversations(activeConversationId, userId, model_reasoning, model_answer);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to submit the form",
        variant: "destructive",
      });
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
  };
};