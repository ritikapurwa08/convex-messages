import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createGroupChat = mutation({
  args: {
    chatUsers: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (args.chatUsers.length < 2) {
      throw new Error("Group chat must have at least 2 users");
    }

    // Fetch all users to ensure they exist
    const users = await Promise.all(
      args.chatUsers.map((userId) => ctx.db.get(userId))
    );

    if (users.some((user) => !user)) {
      throw new Error("One or more users not found for group chat creation");
    }

    // Optional: Check if a group chat with the exact same users already exists
    // (Skipping this for simplicity in this version, can be added later if needed)

    const groupChatId = await ctx.db.insert("userChats", {
      chatType: "group",
      chatUsers: args.chatUsers,
      chatName: "group ",
      chatImage: "/src/web-avatars/Aliah%20Lane.webp", // Default group image if not provided
      lastMessage: undefined,
      unreadMessageCount: {}, // Initialize unreadMessageCount as empty record
    });

    // Update users' chats array to include the new userChats ID
    await Promise.all(
      args.chatUsers.map(async (userId) => {
        await ctx.db.patch(userId, {
          chats: [
            ...((await ctx.db.get(userId))?.chats || []),
            groupChatId as Id<"userChats">,
          ],
        });
      })
    );

    return groupChatId;
  },
});
export const createPersonalChat = mutation({
  args: {
    userId: v.id("users"),
    otherPersonUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.userId === args.otherPersonUserId) {
      throw new Error("Cannot create personal chat with the same user");
    }

    const currentUser = await ctx.db.get(args.userId);
    const otherUser = await ctx.db.get(args.otherPersonUserId);

    if (!currentUser || !otherUser) {
      throw new Error("Users not found for personal chat creation");
    }

    // Check if a personal chat already exists between these two users

    // Determine chat name and image (using other user's info for personal chats)
    const chatName = otherUser.name;
    const chatImage = otherUser.customImage;

    const personalChatId = await ctx.db.insert("userChats", {
      chatType: "personal",
      chatUsers: [args.userId, args.otherPersonUserId],
      chatName: chatName, // Set chat name to the other user's name
      chatImage: chatImage, // Set chat image to the other user's image
      lastMessage: undefined,
      unreadMessageCount: {}, // Initialize unreadMessageCount as empty record
    });

    // Update users' chats array to include the new userChats ID
    await ctx.db.patch(args.userId, {
      chats: [
        ...((await ctx.db.get(args.userId))?.chats || []),
        personalChatId as Id<"userChats">,
      ],
    });

    await ctx.db.patch(args.otherPersonUserId, {
      chats: [
        ...((await ctx.db.get(args.otherPersonUserId))?.chats || []),
        personalChatId as Id<"userChats">,
      ],
    });

    return personalChatId;
  },
});

export const personalChatExists = query({
  args: {
    user1Id: v.id("users"),
    user2Id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userChat = await ctx.db
      .query("userChats")
      .withIndex("by_chatUsers", (q) =>
        q.eq("chatUsers", [args.user1Id, args.user2Id])
      )
      .unique();

    return {
      exists: !!userChat,
      chatId: userChat?._id,
    };
  },
});

export const getUserChats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user || !user.chats) {
      return []; // Return empty array if user or chats not found
    }

    const userChats = await Promise.all(
      user.chats.map(async (chatId) => {
        return await ctx.db.get(chatId);
      })
    );

    // Filter out null values in case some chatIds are invalid
    return userChats.filter((chat) => chat !== null);
  },
});
export const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    chatId: v.id("userChats"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.insert("messages", {
      message: args.message,
      senderId: args.senderId,
      readBy: [],
      userChatId: args.chatId,
    });
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    // Increment unreadMessageCount for all users except the sender
    const updatedUnreadCounts = chat.chatUsers.reduce(
      (acc, userId) => {
        acc[userId] =
          userId === args.senderId
            ? 0
            : (chat.unreadMessageCount?.[userId] ?? 0) + 1;
        return acc;
      },
      {} as Record<Id<"users">, number>
    );

    await ctx.db.patch(args.chatId, {
      lastMessage: args.message,
      unreadMessageCount: updatedUnreadCounts,
    });
    return message;
  },
});
export const markMessagesAsRead = mutation({
  args: {
    chatId: v.id("userChats"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Fetch the chat
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    // Reset unread messages count for the specific user
    const updatedUnreadCounts = {
      ...chat.unreadMessageCount,
      [args.userId]: 0,
    };

    await ctx.db.patch(args.chatId, {
      unreadMessageCount: updatedUnreadCounts,
    });

    return { success: true };
  },
});

export const setReaction = mutation({
  args: {
    messageId: v.id("messages"),
    reactionPath: v.string(), // Now reactionPath is required string
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required to add reaction"); // Enforce authentication
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const currentReactions = message.reactionPath || {}; // Get existing reactions or empty record
    const updatedReactions = {
      ...currentReactions,
      [userId]: args.reactionPath,
    }; // Update/add user's reaction

    await ctx.db.patch(args.messageId, {
      reactionPath: updatedReactions, // Update with the new record
    });
  },
});
export const removeReaction = mutation({
  // Optional: Mutation to remove reaction
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required to remove reaction");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const currentReactions = message.reactionPath || {};
    const updatedReactions = { ...currentReactions }; // Copy current reactions
    delete updatedReactions[userId]; // Remove user's reaction

    await ctx.db.patch(args.messageId, {
      reactionPath: updatedReactions,
    });
  },
});
export const getMessageReactions = query({
  // Renamed query to getMessageReactions
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      return null; // Or throw an error if message not found is exceptional
    }
    return message.reactionPath || []; // Return reactionPath array or empty array if not set
  },
});

export const getMessages = query({
  args: {
    chatId: v.id("userChats"),
  },
  handler: async (ctx, args) => {
    // Fetch messages for the given chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user_chat_id", (q) => q.eq("userChatId", args.chatId))
      .order("asc")
      .collect();

    // Extract unique sender IDs
    const senderIds = [...new Set(messages.map((message) => message.senderId))];

    // Fetch sender details in a single batch operation, filtering out null values
    const senders = await Promise.all(
      senderIds.map(async (senderId) => {
        const sender = await ctx.db.get(senderId);
        return sender
          ? {
              _id: sender._id,
              name: sender.name,
              customImage: sender.customImage,
            }
          : null;
      })
    );

    // Create a map of senderId -> sender details for easy lookup
    const senderMap = Object.fromEntries(
      senders
        .filter(
          (
            sender
          ): sender is {
            _id: Id<"users">;
            name: string;
            customImage: string;
          } => sender !== null
        ) // Ensure non-null values
        .map((sender) => [
          sender._id,
          { name: sender.name, customImage: sender.customImage },
        ])
    );

    // Attach sender details to each message
    const messagesWithSenders = messages.map((message) => ({
      ...message,
      sender: senderMap[message.senderId] || {
        name: "Unknown",
        customImage: "",
      }, // Default in case sender not found
    }));

    return messagesWithSenders;
  },
});

export const getChatById = query({
  args: {
    chatId: v.id("userChats"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    return chat;
  },
});
