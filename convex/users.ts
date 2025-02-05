import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

export const checkEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    return !!user;
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Optionally, fetch the user to verify existence
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Build up the update object based on provided fields
    const updateData: {
      name?: string;
      email?: string;
      customImage?: string;
    } = {};

    if (args.name) updateData.name = args.name;
    if (args.email) updateData.email = args.email;

    // Patch the user document with the new data
    await ctx.db.patch(args.userId, updateData);
    return args.userId;
  },
});

export const updateUserAvatar = mutation({
  args: {
    userId: v.id("users"),
    customImage: v.string(),
  },
  handler: async (ctx, { userId, customImage }) => {
    // Optionally, verify user existence and authentication here
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(userId, { customImage });
    return userId;
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", args.userId))
      .unique();

    if (!user) {
      return null;
    }

    return user;
  },
});
