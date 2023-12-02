import { Conversation } from '@/types/chat';

export const updateConversation = (
  updatedConversation: Conversation,
  allConversations: Conversation[],
) => {
  
  const updatedConversations = allConversations.map((c) => {
    if (c.id === updatedConversation.id) {
      return updatedConversation;
    }

    return c;
  });

  saveConversation(updatedConversation);
  saveConversations(updatedConversations);

  return {
    single: updatedConversation,
    all: updatedConversations,
  };
};

export const saveConversation = (conversation: Conversation) => {
  localStorage.setItem('selectedConversation', JSON.stringify(conversation));
};

export const saveConversations = async (conversations: Conversation[]) => {
  localStorage.setItem('conversationHistory', JSON.stringify(conversations));
  console.log(1111)
  await fetch("api/conversations", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify({conversations: JSON.stringify(conversations), userId: "cac"}),
  });

};
