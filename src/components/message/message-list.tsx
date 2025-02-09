import { Id } from "@convex/_generated/dataModel";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { MessageSquareIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import AddMessageReaction from "./add-reaction-dropdown";
import ShowMessageEmoji from "./show-message-reaction";
import { format } from "date-fns"; // Import date-fns format function
import { useMarkAsRead } from "@/actions/mutations/messages/message-mution";

interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  message: string;
  reactionPath?: Record<Id<"users">, string> | undefined;
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
  chatId: Id<"userChats"> | undefined;
}

const messageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const bubbleGradients = [
  "bg-gradient-to-br from-blue-400 to-purple-500",
  "bg-gradient-to-br from-green-400 to-teal-500",
  "bg-gradient-to-br from-yellow-400 to-orange-500",
  "bg-gradient-to-br from-pink-400 to-red-500",
  "bg-gradient-to-br from-cyan-400 to-blue-500",
];

export const MessageList = ({ messages, userId, chatId }: MessageListProps) => {
  let stop = "stops";
  const [gradientIndex, setGradientIndex] = useState(0);
  const { mutate: markAsRead } = useMarkAsRead();

  useEffect(() => {
    if (chatId && userId) {
      markAsRead({ chatId, userId });
    }
  }, [messages, chatId, userId, markAsRead]);
  useEffect(() => {
    if (chatId) {
      // Simple way to cycle through gradients, can be improved for persistence
      setGradientIndex((prevIndex) => (prevIndex + 1) % bubbleGradients.length);
    }
  }, [chatId]);

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
      <div className="text-center  min-h-full h-[60vh] w-full flex justify-center items-center flex-col text-gray-500">
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

  return (
    <div className={cn("pb-12 flex flex-col w-full  px-0.5 md:px-4 mx-auto")}>
      {messages.map((message, index) => {
        const isOwner = message.senderId === userId;
        const bubbleGradientClass = isOwner
          ? bubbleGradients[gradientIndex % bubbleGradients.length]
          : "bg-gray-200 text-black";

        return (
          <motion.div
            key={index}
            variants={messageVariants}
            initial="initial"
            animate="animate"
            className={cn(
              "w-full flex",
              isOwner ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "relative flex  space-x-1 max-w-[75%] sm:max-w-[60%] md:max-w-[50%]",
                isOwner ? "flex-row" : "flex-row-reverse",
                message.reactionPath ? "pb-6" : "pb-6"
              )}
            >
              <div id="add-reaction" className="h-full  items-center flex">
                {isOwner && <AddMessageReaction messageId={message._id} />}
              </div>
              <div id="add-reaction" className="h-full  items-center flex">
                {!isOwner && <AddMessageReaction messageId={message._id} />}
              </div>
              <div
                className={cn(
                  "p-3 rounded-xl h-auto   relative",
                  bubbleGradientClass,
                  isOwner ? "rounded-br-none" : "rounded-bl-none"
                )}
              >
                <div className="break-words whitespace-pre-line">
                  {message.message}
                </div>
                <div className="flex w-full justify-between items-end  ">
                  <span
                    className={cn(
                      "text-xs absolute  -bottom-4  text-muted-foreground",
                      isOwner ? "right-2" : "left-2"
                    )}
                  >
                    {format(message._creationTime, "HH:mm")}
                  </span>
                  {message.reactionPath && (
                    <div
                      className={cn(
                        "absolute w-full   flex -bottom-5 ",
                        isOwner ? "justify-start" : "justify-end"
                      )}
                    >
                      <ShowMessageEmoji messageId={message._id} />
                    </div>
                  )}
                </div>
              </div>

              {isOwner && (
                <div className=" w-10 min-w-10 flex items-end pb-4 ">
                  <img
                    src={message.sender.customImage}
                    className="size-8 rounded-full mr-2 -mb-2"
                    alt={message.sender.name}
                  />
                </div>
              )}
              {!isOwner && (
                <div className=" w-10 min-w-10 flex items-end pb-4 ">
                  <img
                    src={message.sender.customImage}
                    className="size-8 rounded-full mr-2 -mb-2"
                    alt={message.sender.name}
                  />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
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
