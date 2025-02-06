import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";

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

export const useGetUserChats = ({
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

export const useGetuserChatByUserId = ({
  chatId,
  userId,
}: {
  chatId: Id<"chats"> | undefined;
  userId: Id<"users"> | undefined;
}) => {
  const chat = useQuery(
    api.chats.getOtherUserInChat,
    chatId && userId ? { chatId, userId } : "skip"
  );
  return chat;
};
