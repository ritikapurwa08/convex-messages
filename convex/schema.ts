import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const Tables = () => {
  const users = defineTable({
    name: v.string(),
    email: v.string(),
    customImage: v.string(),
    chats: v.array(v.id("userChats")), // Relation to userChats
  }).index("by_chats", ["chats"]);

  const userChats = defineTable({
    chatType: v.union(v.literal("group"), v.literal("personal")),
    chatName: v.string(), // Generic chat name (can be dynamic on frontend)
    chatImage: v.string(), // Generic chat image (can be dynamic on frontend)
    chatUsers: v.array(v.id("users")), // Users in the chat (for both personal and group)
    lastMessage: v.optional(v.string()),
    unreadMessageCount: v.optional(v.record(v.id("users"), v.number())), // Unread counts per user
  })
    .index("by_user_chat_type", ["chatType"]) // For chat type based queries // For finding personal chats (no filter here)
    .index("by_chatUsers", ["chatUsers"]); // For finding chats by users (efficient chat existence check)

  const messages = defineTable({
    senderId: v.id("users"),
    userChatId: v.id("userChats"), // Link to userChats
    message: v.string(),
    reactionPath: v.optional(v.record(v.id("users"), v.string())),
    readBy: v.array(v.id("users")),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user_chat_id", ["userChatId"]) // For fetching messages in a chat
    .index("by_sender_id", ["senderId"]); // For querying messages by sender

  return {
    users,
    messages,
    userChats,
  };
};

export default defineSchema({
  ...authTables,
  messages: Tables().messages,
  users: Tables().users,
  userChats: Tables().userChats,
});
