import { Id } from "@convex/_generated/dataModel";
import { Link } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
//import { avtarImages } from "@/web-avatars/_avatars"; // If you still need this

interface ChatDataType {
  chatId: Id<"chats">;
  chatImage: string;
  chatName: string;
  chatType: "group" | "personal" | undefined;
  lastMessage: string | undefined;
  unreadMessageCount: number;
}

interface ChatListProps {
  chat: ChatDataType[] | undefined;
  onChatSelect: (chatId: Id<"chats">) => void; // Add the callback prop
  selectedChatId: Id<"chats"> | null; // Add the selected chat ID prop
}

const ChatList = ({ chat, onChatSelect, selectedChatId }: ChatListProps) => {
  const isLoading = chat === undefined; // More descriptive variable name

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {" "}
        {/* Consistent padding */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center p-4 rounded-xl bg-gray-800/50 animate-pulse" // Darker skeleton background
          >
            <Skeleton className="w-12 h-12 rounded-full mr-4" />
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-1" /> {/* Name skeleton */}
              <Skeleton className="h-4 w-48" /> {/* Message skeleton */}
            </div>
            <Skeleton className="w-16 h-8 rounded-full" />{" "}
            {/* Badge skeleton */}
          </div>
        ))}
      </div>
    );
  }

  if (!chat || chat.length === 0) {
    return (
      <div className="flex justify-center items-center h-32 p-4">
        {" "}
        {/* Padding */}
        <h1 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          No chats found
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {chat.map((chatItem) => (
        <div
          key={chatItem.chatId}
          className={cn(
            "flex items-center p-4 rounded-xl transition duration-300",
            chatItem.chatId === selectedChatId
              ? "bg-gray-700"
              : "bg-gray-800 hover:bg-gray-700" // Highlight selected chat
          )}
          onClick={() => onChatSelect(chatItem.chatId)} // Call the callback on click
        >
          <div
            key={chatItem.chatId}
            className="flex items-center p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition duration-300" // Darker background, transitions
          >
            <img
              src={chatItem.chatImage || "/default-chat.png"}
              alt={chatItem.chatName}
              className="w-12 h-12 rounded-full object-cover mr-4 shadow-sm" // Added shadow
            />

            <div className="flex-1">
              <h1 className="text-white font-semibold">{chatItem.chatName}</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 line-clamp-1">
                {" "}
                {/* line-clamp */}
                {chatItem.lastMessage
                  ? chatItem.lastMessage
                  : "No messages yet"}
              </p>
            </div>

            {/* Unread message count */}
            {chatItem.unreadMessageCount > 0 && (
              <div className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-full ml-2">
                {chatItem.unreadMessageCount}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
