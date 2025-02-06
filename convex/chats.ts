import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createChat = mutation({
  args: {
    chatUsers: v.array(v.id("users")),
    chatImage: v.optional(v.string()), // Optional: You might make chatImage optional for personal chats
  },
  handler: async (ctx, args) => {
    let chatType: "personal" | "group" = "personal";
    let chatId: Id<"chats"> | undefined = undefined; // Initialize chatId outside the conditional blocks

    if (args.chatUsers.length > 2) {
      chatType = "group";
      // ... (group chat logic - if you need to create a group chat record)
      chatId = await ctx.db.insert("chats", {
        chatType,
        chatUsers: args.chatUsers,
      });
    } else if (args.chatUsers.length === 2) {
      chatType = "personal";
      const user1 = await ctx.db.get(args.chatUsers[0]);
      const user2 = await ctx.db.get(args.chatUsers[1]);

      if (user1 && user2) {
        chatId = await ctx.db.insert("chats", {
          // Assign chatId here
          chatType,
          chatUsers: args.chatUsers,
        });

        await ctx.db.insert("userChats", {
          userId: args.chatUsers[0],
          chatId: chatId,
          chatName: user2.name,
          chatImage: user2.customImage,
        });

        await ctx.db.insert("userChats", {
          userId: args.chatUsers[1],
          chatId: chatId,
          chatName: user1.name,
          chatImage: user1.customImage,
        });

        // Add chatId to users' 'chats' array
        await ctx.db.patch(args.chatUsers[0], {
          chats: [
            ...((await ctx.db.get(args.chatUsers[0]))?.chats || []),
            chatId,
          ],
        });

        await ctx.db.patch(args.chatUsers[1], {
          chats: [
            ...((await ctx.db.get(args.chatUsers[1]))?.chats || []),
            chatId,
          ],
        });
      }
    }

    return chatId; // Return chatId outside the conditional blocks
  },
});

export const getUserChats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userChatsFromDb = await ctx.db
      .query("userChats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const chatsWithDetails = await Promise.all(
      userChatsFromDb.map(async (userChat) => {
        const chat = await ctx.db.get(userChat.chatId);
        if (!chat) return null; // Handle deleted chats

        return {
          chatId: userChat.chatId,
          chatImage: userChat.chatImage,
          chatName: userChat.chatName,
          chatType: chat.chatType,
          lastMessage: chat.lastMessage,
          unreadMessageCount: chat.unreadMessageCount?.[args.userId] || 0, // Get unread count
        };
      })
    );

    return chatsWithDetails.filter((chat) => chat !== null);
  },
});

export const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    chatId: v.id("chats"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.insert("messages", {
      senderId: args.senderId,
      chatId: args.chatId,
      message: args.message,
      readBy: [],
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
    chatId: v.id("chats"),
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

export const getMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    // Fetch messages for the given chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_id", (q) => q.eq("chatId", args.chatId))
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

export const chatAlreadyExist = query({
  args: {
    chatUsers: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_chat_users", (q) => q.eq("chatUsers", args.chatUsers))
      .unique();

    return {
      exists: !!existingChat,
      chatId: existingChat?._id,
    };
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    newMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    await ctx.db.patch(args.messageId, {
      message: args.newMessage ?? message.message,
      updatedAt: Date.now(),
    });
    return args.messageId;
  },
});

export const getMessageById = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    const exitingMessage = message.message;
    return exitingMessage;
  },
});

export const getOtherUserInChat = query({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      return null; // Or throw an error
    }

    const otherUserId = chat.chatUsers.find((id) => id !== args.userId);
    if (!otherUserId) {
      return null; // Or throw an error if no other user exists (e.g., group chat with only one user)
    }

    const otherUserChat = await ctx.db
      .query("userChats")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", otherUserId)
      )
      .unique();

    if (!otherUserChat) {
      return null; // Handle the case where the other user's entry is not found
    }

    return {
      name: otherUserChat.chatName,
      image: otherUserChat.chatImage,
    };
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
