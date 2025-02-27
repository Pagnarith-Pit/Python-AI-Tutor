
import { useState, useEffect } from 'react';

export const useMessageDraft = (conversationId: string) => {
  const [messageDraft, setMessageDraft] = useState('');

  // Load draft from localStorage when conversation changes
  useEffect(() => {
    const savedDraft = localStorage.getItem(`message_draft_${conversationId}`);
    if (savedDraft) {
      setMessageDraft(savedDraft);
    } else {
      setMessageDraft('');
    }
  }, [conversationId]);

  // Save draft to localStorage whenever it changes
  const updateMessageDraft = (newDraft: string) => {
    setMessageDraft(newDraft);
    if (newDraft.trim()) {
      localStorage.setItem(`message_draft_${conversationId}`, newDraft);
    } else {
      localStorage.removeItem(`message_draft_${conversationId}`);
    }
  };

  return {
    messageDraft,
    updateMessageDraft,
  };
};
