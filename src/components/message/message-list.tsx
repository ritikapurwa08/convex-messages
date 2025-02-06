import { Id } from "@convex/_generated/dataModel";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { MessageSquareIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useMarkAsRead } from "@/actions/mutations/messages";
import { cn } from "@/lib/utils";
import AddMessageReaction from "./add-reaction-dropdown";
import ShowMessageEmoji from "./show-message-reaction";
import { format } from "date-fns"; // Import date-fns format function

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
    <div className="pb-12 flex flex-col w-full space-y-2 px-4 mx-auto">
      {messages.map((message, index) => {
        const isOwner = message.senderId === userId; // Determine if current user is the sender
        return (
          <motion.div
            key={message._id}
            // ... (animation props - you can add animation props here if needed)
            className={cn(
              "flex items-start", // Removed space-x-2, Adjusted items-start for closer layout
              isOwner ? "justify-end" : "justify-start" // Keep justify-end/start for overall alignment
            )}
          >
            <div
              className={cn("flex", isOwner ? "flex-row" : "flex-row-reverse")}
            >
              <div
                className={cn(
                  "h-full flex items-center justify-center"
                  // Conditionally reorder for other users
                )}
              >
                <AddMessageReaction messageId={message._id} />
              </div>
              <div className="flex flex-col">
                <div
                  className={cn(
                    "rounded-2xl p-3 shadow-lg relative", // Removed max-w-[75%] here
                    "max-w-[40%]", // Added max-w-[40%] here to constrain bubble width
                    "break-words", // Keep break-words for text wrapping
                    isOwner
                      ? "bg-gradient-to-br from-pink-400 to-red-500 text-white rounded-tr-none"
                      : "bg-gray-200 text-black rounded-tl-none"
                  )}
                >
                  <div className="flex flex-col m-0 p-0">
                    <span className="break-words" id="message">
                      {message.message}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <ShowMessageEmoji messageId={message._id} />
                  <span className="text-xs text-gray-500 ml-1">
                    {" "}
                    {/*Reduced ml-2 to ml-1*/}
                    {format(message._creationTime, "HH:mm")}
                  </span>
                </div>
                {!isOwner && (
                  <img
                    src={message.sender.customImage}
                    className="size-7 mr-1 rounded-full object-cover shadow-md mt-1" // Reduced mr-2 to mr-1
                    alt={message.sender.name}
                  />
                )}
              </div>
            </div>

            {isOwner && (
              <img
                src={message.sender.customImage}
                className="size-7 ml-1 rounded-full object-cover shadow-md mt-1" //Reduced ml-2 to ml-1
                alt={message.sender.name}
              />
            )}
          </motion.div>
        );
      })}
      <div ref={messageEndRef} />
    </div>
  );
};

const SkeletonMessage = ({ isUser }: { isUser?: boolean }) => {
  return (
    <div
      className={`flex items-end gap-2 animate-pulse ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && <Skeleton className="size-7 rounded-full" />}
      <div
        className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <Skeleton className="h-4 w-80 rounded-md" />
        <Skeleton
          className={`p-3 rounded-lg w-[60%] h-12 ${
            isUser
              ? "bg-gradient-to-br from-pink-400 to-red-500 text-white rounded-tr-none"
              : "bg-gray-300 text-black rounded-tl-none"
          }`}
        />
      </div>
      {isUser && <Skeleton className="size-7 rounded-full" />}
    </div>
  );
};
