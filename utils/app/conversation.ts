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

export const getConversations = (userId: string | undefined) => {
  return new Promise(async (resolve, reject) => {
    const resp = await fetch("api/getConversations", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userId }),
    });
    const data = await resp.json()
    localStorage.setItem('conversationHistory', JSON.stringify(data.conversations));
    
    console.log("conv",data);
    resolve(data.conversations)

  })
};

export const saveConversations = async (conversations: Conversation[], userId: string | undefined) => {
  localStorage.setItem('conversationHistory', JSON.stringify(conversations));
  uploadConversations(conversations, userId);
};

const uploadConversations = async (conversations: Conversation[], userId: string | undefined) => {
  await fetch("api/conversations", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ conversations: conversations, userId: userId }),
  });
};