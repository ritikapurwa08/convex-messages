import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createChat = mutation({
  args: {
    chatUsers: v.array(v.id("users")),
    chatImage: v.string(), // Optional: You might make chatImage optional for personal chats
  },
  handler: async (ctx, args) => {
    let chatName = "";
    let chatType: "personal" | "group" = "personal"; // Default to "personal"

    if (args.chatUsers.length > 2) {
      chatType = "group";
      // Determine group chat name (e.g., using the first user's name)
      if (args.chatUsers.length > 0) {
        const firstUser = await ctx.db.get(args.chatUsers[0]);
        chatName = firstUser ? `Group with ${firstUser.name}` : "New Group";
      } else {
        chatName = "New Group";
      }
    } else if (args.chatUsers.length === 2) {
      chatType = "personal";
      const user1 = await ctx.db.get(args.chatUsers[0]);
      const user2 = await ctx.db.get(args.chatUsers[1]);

      if (user1 && user2) {
        chatName = `${user1.name} and ${user2.name}`;
        // Consider returning here if you *only* want to create personal chats when there are exactly 2 users and *not* insert into the database
        // return chatName;
      } else {
        // Handle the case where one or both users are not found.
        // You might throw an error or set a default chat name.
        chatName = "Unknown Chat";
      }
    } else {
      // Handle cases with 0 or 1 users.
      // Maybe throw an error or set a default name.
      chatName = "Invalid Chat";
    }

    const chat = await ctx.db.insert("chats", {
      chatName, // Now determined by the number of users
      chatType, // "group" or "personal" based on the number of users
      chatUsers: args.chatUsers,
      chatImage: args.chatImage,
    });

    for (const userId of args.chatUsers) {
      await ctx.db.patch(userId, {
        chats: [...((await ctx.db.get(userId))?.chats || []), chat],
      });
    }

    return chat;
  },
});

export const getUserChats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Fetch user document
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Fetch all chats associated with the user
    const userChats = await Promise.all(
      (user.chats || []).map(async (chatId) => {
        const chat = await ctx.db.get(chatId);
        if (!chat) return null;

        return {
          ...chat,
          unreadMessageCount: chat.unreadMessageCount?.[args.userId] || 0, // Get unread count for this user
        };
      })
    );

    return userChats.filter((chat) => chat !== null);
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
      reactions: [],
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

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"), // Message ID
    userId: v.id("users"), // User ID
    reaction: v.union(
      v.literal("like"),
      v.literal("love"),
      v.literal("haha"),
      v.literal("sad"),
      v.literal("angry"),
      v.literal("wow")
    ), // Reaction type (one of the above)
  },
  handler: async (ctx, args) => {
    const { messageId, userId, reaction } = args;

    // Fetch the message
    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    // Check if the user has already reacted to this message
    const existingReaction = message.reactions?.find(
      (reactionObj) => reactionObj.userId === userId
    );

    if (existingReaction) {
      // Replace the existing reaction with the new one
      await ctx.db.patch(messageId, {
        reactions: message.reactions?.map((reactionObj) =>
          reactionObj.userId === userId
            ? { ...reactionObj, reaction }
            : reactionObj
        ),
      });
    } else {
      // Add a new reaction
      await ctx.db.patch(messageId, {
        reactions: [...(message.reactions || []), { userId, reaction }],
      });
    }

    return { success: true };
  },
});

export const getReactions = query({
  args: {
    messageId: v.id("messages"), // Message ID to fetch reactions for
  },
  handler: async (ctx, args) => {
    // Fetch the message
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    return message.reactions || [];
  },
});
