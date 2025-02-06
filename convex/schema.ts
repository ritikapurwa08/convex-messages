import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const Tables = () => {
  const users = defineTable({
    name: v.string(),
    email: v.string(),
    customImage: v.string(),
    chats: v.array(v.id("chats")),
  }).index("by_chats", ["chats"]);
  const userChats = defineTable({
    // New table for per-user chat info
    chatId: v.id("chats"),
    userId: v.id("users"),
    chatName: v.string(),
    chatImage: v.string(),
  })
    .index("by_chat_and_user", ["chatId", "userId"])
    .index("by_userId", ["userId"])
    .index("by_chatId", ["chatId"]);

  const chats = defineTable({
    chatType: v.union(v.literal("group"), v.literal("personal")),
    chatUsers: v.array(v.id("users")),

    unreadMessageCount: v.optional(v.record(v.id("users"), v.number())),
    lastMessage: v.optional(v.string()), // Reference to the last message in the chat
  })
    .index("by_chat_users", ["chatUsers"])

    .index("by_chat_type", ["chatType"]);

  const messages = defineTable({
    senderId: v.id("users"),
    chatId: v.id("chats"),
    message: v.string(),
    reactionPath: v.optional(v.record(v.id("users"), v.string())),
    readBy: v.array(v.id("users")), // Array of user IDs who have read the message
    updatedAt: v.optional(v.number()),
  })
    .index("by_chat_id", ["chatId"])
    .index("by_sender_id", ["senderId"]);

  return {
    users,
    chats,
    messages,
    userChats,
  };
};

export default defineSchema({
  ...authTables,
  chats: Tables().chats,
  messages: Tables().messages,
  users: Tables().users,
  userChats: Tables().userChats,
});
