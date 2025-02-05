import { Id } from "@convex/_generated/dataModel";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { MessageSquareIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useMarkAsRead } from "@/actions/mutations/messages";
import { cn } from "@/lib/utils";
import AddMessageReaction from "./add-reaction-dropdown";

interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  chatId: Id<"chats">;
  message: string;
  reactions?: {
    userId: Id<"users">;
    reaction: "like" | "love" | "haha" | "sad" | "angry" | "wow";
  }[];
  readBy: Id<"users">[];
  senderId: Id<"users">;
  updatedAt?: number;
  sender: {
    name: string;
    customImage: string;
  };
}

interface MessageListProps {
  messages: Message[] | null | undefined;
  userId: Id<"users"> | undefined;
  chatId: Id<"chats"> | undefined;
}

export const MessageList = ({ messages, userId, chatId }: MessageListProps) => {
  let stop = "stops";
  if (messages === undefined || stop === "stop") {
    return (
      <div className="flex flex-col w-full space-y-3 p-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonMessage key={i} isUser={i % 2 === 0} /> // Alternates left/right
        ))}
      </div>
    );
  }

  if (messages && messages.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <MessageSquareIcon className="size-10 mx-auto my-4" />
        <h1>You haven't sent any messages yet.</h1>
      </div>
    );
  }

  if (messages === null) {
    return (
      <div className="text-center text-gray-500">
        <MessageSquareIcon className="size-10 mx-auto my-4" />
        <h1>No messages found.</h1>
      </div>
    );
  }

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const { mutate: markAsRead } = useMarkAsRead();

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (chatId && userId) {
      markAsRead({ chatId, userId });
    }
  }, [messages]);

  return (
    <div className="flex w-full flex-col">
      <div className="pb-12 flex flex-col w-full space-y-1 px-4 mx-auto">
        {messages.map((message, index) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-end space-y-1",
              message.senderId === userId ? "justify-end" : "justify-start"
            )}
          >
            {message.senderId !== userId && (
              <img
                src={message.sender.customImage}
                className="size-8 mr-2 rounded-full object-cover shadow-md"
                alt={message.sender.name}
              />
            )}

            <div
              className={cn(
                "rounded-2xl p-3 max-w-[75%] shadow-lg",
                message.senderId === userId
                  ? "bg-gradient-to-br from-pink-400 to-red-500 text-white rounded-tr-none"
                  : "bg-gray-200 text-black rounded-tl-none"
              )}
            >
              <h1 className="font-semibold text-xs opacity-70">
                {message.sender.name}
              </h1>
              <p className="text-sm">{message.message}</p>

              <AddMessageReaction messageId={message._id} userId={userId} />
              <div className="text-xs opacity-50 mt-1 text-right">
                {new Date(message._creationTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {message.senderId === userId && (
              <img
                src={message.sender.customImage}
                className="size-8 ml-2 rounded-full object-cover shadow-md"
                alt={message.sender.name}
              />
            )}
          </motion.div>
        ))}
      </div>
      <div ref={messageEndRef} />
    </div>
  );
};

const SkeletonMessage = ({ isUser }: { isUser?: boolean }) => {
  return (
    <div
      className={`flex items-end gap-2 animate-pulse ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <Skeleton className="size-8 rounded-full" />}{" "}
      {/* Avatar on left if not user */}
      <div
        className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <Skeleton className="h-4 w-80 rounded-md" />{" "}
        {/* Simulating sender name */}
        <Skeleton
          className={`p-3 rounded-lg w-[60%] h-12 ${
            isUser
              ? "bg-gradient-to-br from-pink-400 to-red-500 text-white rounded-tr-none"
              : "bg-gray-300 text-black rounded-tl-none"
          }`}
        />
      </div>
      {isUser && <Skeleton className="size-8 rounded-full" />}{" "}
      {/* Avatar on right if user */}
    </div>
  );
};
