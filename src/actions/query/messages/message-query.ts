import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";

export const useIsPersonalChatExist = ({
  user1Id,
  user2Id,
}: {
  user1Id: Id<"users"> | undefined;
  user2Id: Id<"users"> | undefined;
}) => {
  const personalchatExits = useQuery(
    api.chats.personalChatExists,
    user1Id && user2Id ? { user1Id, user2Id } : "skip"
  );
  return personalchatExits;
};

export const getUserChats = ({
  userId,
}: {
  userId: Id<"users"> | undefined;
}) => {
  const userChats = useQuery(
    api.chats.getUserChats,
    userId ? { userId } : "skip"
  );
  return userChats;
};

export const useGetMessages = ({
  chatId,
}: {
  chatId: Id<"userChats"> | undefined;
}) => {
  const messages = useQuery(
    api.chats.getMessages,
    chatId ? { chatId } : "skip"
  );
  return messages;
};

export const useGetMessageReaction = ({
  messageId,
}: {
  messageId: Id<"messages">;
}) => {
  const messageReaction = useQuery(api.chats.getMessageReactions, {
    messageId,
  });
  return messageReaction;
};

export const useGetChatById = ({
  chatId,
}: {
  chatId: Id<"userChats"> | undefined;
}) => {
  const chat = useQuery(api.chats.getChatById, chatId ? { chatId } : "skip");
  return chat;
};
