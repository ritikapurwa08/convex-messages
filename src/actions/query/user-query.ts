import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";

export const useGetUserByUserId = ({
  userId,
}: {
  userId: Id<"users"> | undefined;
}) => {
  const user = useQuery(api.users.getUserById, userId ? { userId } : "skip");
  return user;
};
