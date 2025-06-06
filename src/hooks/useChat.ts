
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { formatContent } from "@/components/Message";

/**
 * useChat hook:
 * - Handles sending messages and receiving responses from the AI server.
 * - Used in: ChatInterface component.
 * - Calls: useToast, formatContent, fetch to FastAPI endpoint
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const useChat = (
  setConversations: (
    updater: (prevConversations: any[]) => any[]
  ) => void,
  activeConversationId: string,
  conversations: any[]
) => {
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef("");

  // This function will be used to check the response from the AI server
  // Output: { student_mistake: string, strategy: string }
  const handleCheckResponse = async (messageHistory: any, correctAnswer: string) => {
    const requestBody = JSON.stringify({
      message: messageHistory,
      correct_answer: correctAnswer,
    });

    try {
      const response = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_FASTAPI_PORT}/checkResponse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error in Check Response! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error checking response:", error);
        toast({
          title: "Error",
          description: "Failed to check response",
          variant: "destructive",
        });
      }
    }
  };

  // Helper function to make API call
  const fetchAIResponse = async (requestBody: string, signal: AbortSignal, conversationId: string) => {
    const response = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_FASTAPI_PORT}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    await handleStreamingResponse(reader, conversationId);
  };

  const fetchRecapResponse = async (requestBody: string, signal: AbortSignal, conversationId: string) => {
    const response = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_FASTAPI_PORT}/recap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error for Recap! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        await handleStreamingResponse(reader, conversationId);
      };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  // Helper function to prepare conversation updates
  const prepareConversationUpdate = (conversationId: string, userMessage: Message) => {
    const currentConversation = conversations.find(conv => conv.id === conversationId);
    if (!currentConversation) {
      console.error("Conversation not found");
      return null;
    }
    
    return {
      currentConversation,
      updatedConversation: {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage]
      }
    };
  };

  // Helper function to update conversations state with new messages
  const updateConversationsWithMessages = (
    conversationId: string, 
    userMessage: Message, 
    assistantMessage: Message
  ) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, userMessage, assistantMessage] }
          : conv
      )
    );
  };

  // Helper function to check student's progress
  const checkStudentProgress = async (conversation: any, correctAnswer: any) => {
    return await handleCheckResponse(conversation, correctAnswer);
  };

  // Helper function to handle AI streaming response
  const handleStreamingResponse = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    conversationId: string
  ) => {
    const decoder = new TextDecoder();
    accumulatedContentRef.current = "";

    setIsLoadingChat(false);

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        setIsStreaming(false);
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = formatContent(line.slice(6));
          accumulatedContentRef.current += data;

          setConversations((prevConversations) =>
            prevConversations.map((conv) => {
              if (conv.id === conversationId) {
                const messages = [...conv.messages];
                const lastIndex = messages.length - 1;
                messages[lastIndex] = {
                  ...messages[lastIndex],
                  content: accumulatedContentRef.current,
                };
                return { ...conv, messages };
              }
              return conv;
            })
          );
        }
      }
    }
  };

  // Function to add congratulatory message when student completes all tasks
  const addCongratulationsMessage = (conversationId: string) => {
    const congratsMessage: Message = { 
      role: "assistant", 
      content: "Congratulation. Hope You Enjoyed The Lessons." 
    };

    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? { 
              ...conv, 
              messages: [...conv.messages, congratsMessage],
            }
          : conv
      )
    );
  };

  // Main function to handle sending a message
  const handleSendMessage = async (content: string) => {
    const conversationId = activeConversationId;
    const userMessage: Message = { role: "user", content };
    const assistantMessage: Message = { role: "assistant", content: "Please Wait" };

    // Prepare conversation update
    const conversationData = prepareConversationUpdate(conversationId, userMessage);
    if (!conversationData) return;
    
    const { currentConversation, updatedConversation } = conversationData;

    // Update conversations state
    updateConversationsWithMessages(conversationId, userMessage, assistantMessage);

    // Set loading states
    setIsLoadingChat(true);
    setIsStreaming(true);

    // Check student's progress
    let currentProgress = currentConversation.progress;
    const modelSolutionArray = Object.values(currentConversation.model_solution);
    const currentCorrectAnswer = modelSolutionArray[modelSolutionArray.length - currentProgress];

    const data = await checkStudentProgress(updatedConversation, currentCorrectAnswer);
    const student_mistake = data[0]
    const strategy = data[1]

    // Check if student's answer is correct
    if (student_mistake === "CORRECT") {
      // Update the progress by decrementing it
      currentProgress = currentProgress - 1;
      
      // Update the actual state with the new progress value
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === conversationId
            ? { ...conv, progress: currentProgress }
            : conv
        )
      );
    }
    
    // End Chat if student is done (progress = 0)
    if (currentProgress === 0) { 
        setIsLoadingChat(false);
        setIsStreaming(false);

        // Sumarise the conversation
        const requestBodyRecap = JSON.stringify({
          message: updatedConversation,
          correct_answer: currentCorrectAnswer,
          strategy: strategy,
          student_mistake: student_mistake
        });

        await fetchRecapResponse(requestBodyRecap, new AbortController().signal, conversationId);
  
        // Add congratulatory message
        addCongratulationsMessage(conversationId);

        toast({
          title: "Chat Completed",
          description: "This learning session has been completed. Please start a new chat for more practice.",
          variant: "default",
        });
        
        return;
    }

    try {
      // Setup abort controller and make API call
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      const requestBody = JSON.stringify({
        message: updatedConversation,
        correct_answer: currentCorrectAnswer,
        strategy: strategy,
        student_mistake: student_mistake
      });

      await fetchAIResponse(requestBody, signal, conversationId);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
          console.error("Server connection failed:", error);
          toast({
            title: "Connection Error",
            description: "Cannot connect to AI server. Please ensure it's running on port " + process.env.NEXT_PUBLIC_FASTAPI_PORT,
            variant: "destructive",
          });
        } else {
          console.error("Error in chat:", error);
          toast({
            title: "Error",
            description: "Failed to send message",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoadingChat(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return {
    isLoadingChat,
    isStreaming,
    handleSendMessage,
    handleStopGeneration
  };
};

