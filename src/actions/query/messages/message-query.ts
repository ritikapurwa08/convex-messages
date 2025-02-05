import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";

export const useGetMessageReaction = ({
  messageId,
}: {
  messageId: Id<"messages">;
}) => {
  const messageReaction = useQuery(api.chats.getReactions, { messageId });

  return messageReaction;
};
