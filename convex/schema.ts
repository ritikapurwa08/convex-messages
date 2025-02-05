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

  const chats = defineTable({
    chatName: v.string(),
    chatType: v.union(v.literal("group"), v.literal("personal")),
    chatUsers: v.array(v.id("users")),
    chatImage: v.string(),
    unreadMessageCount: v.optional(v.record(v.id("users"), v.number())),
    lastMessage: v.optional(v.string()), // Reference to the last message in the chat
  })
    .index("by_chat_users", ["chatUsers"])
    .index("by_chat_name", ["chatName"])
    .index("by_chat_type", ["chatType"]);

  const messages = defineTable({
    senderId: v.id("users"),
    chatId: v.id("chats"),
    message: v.string(),
    reactions: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          reaction: v.union(
            v.literal("like"),
            v.literal("love"),
            v.literal("haha"),
            v.literal("sad"),
            v.literal("angry"),
            v.literal("wow")
          ),
        })
      )
    ),
    readBy: v.array(v.id("users")), // Array of user IDs who have read the message
    updatedAt: v.optional(v.number()),
  })
    .index("by_chat_id", ["chatId"])
    .index("by_sender_id", ["senderId"]);

  return {
    users,
    chats,
    messages,
  };
};

export default defineSchema({
  ...authTables,
  chats: Tables().chats,
  messages: Tables().messages,
  users: Tables().users,
});
