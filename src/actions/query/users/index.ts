import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

export const useGetCurrentUser = () => {
  const user = useQuery(api.users.getCurrentUser);

  return user;
};

export const useCheckEmail = ({ email }: { email: string }) => {
  const checkEmail = useQuery(api.users.checkEmail, { email });
  return checkEmail;
};

export const useGetUserChats = ({
  userId,
}: {
  userId: Id<"users"> | undefined;
}) => {
  const chats = useQuery(api.chats.getUserChats, userId ? { userId } : "skip");
  return chats;
};

export const useGetAllUsers = () => {
  const allUsers = useQuery(api.users.getAllUsers);
  return allUsers;
};
