import { Conversation } from '@/types/chat';

export const updateConversation = (
  updatedConversation: Conversation,
  allConversations: Conversation[],
  userId: string | undefined
) => {

  const updatedConversations = allConversations.map((c) => {
    if (c.id === updatedConversation.id) {
      return updatedConversation;
    }

    return c;
  });

  saveConversation(updatedConversation, userId);
  saveConversations(updatedConversations, userId);

  return {
    single: updatedConversation,
    all: updatedConversations,
  };
};

export const saveConversation = (conversation: Conversation, userId: string | undefined) => {
  localStorage.setItem('selectedConversation', JSON.stringify(conversation));
};

export const saveConversations = async (conversations: Conversation[], userId: string | undefined) => {
  localStorage.setItem('conversationHistory', JSON.stringify(conversations));
  
  await fetch("api/conversations", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify({conversations: JSON.stringify(conversations), userId: userId}),
  });
  console.log(">>>", userId)


};
