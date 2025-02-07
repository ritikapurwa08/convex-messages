import { Id } from "@convex/_generated/dataModel";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetCurrentUser } from "@/actions/query/users";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface ChatDataType {
  _id: Id<"userChats">;
  _creationTime: number;
  lastMessage?: string | undefined;
  unreadMessageCount?: Record<Id<"users">, number> | undefined;
  chatType: "group" | "personal";
  chatName: string;
  chatImage: string;
  chatUsers: Id<"users">[];
}

interface ChatListProps {
  chat: ChatDataType[] | undefined;
  onChatSelect: (chatId: Id<"userChats">) => void;
  selectedChatId: Id<"userChats"> | null;
}

const ChatList = ({ chat, onChatSelect, selectedChatId }: ChatListProps) => {
  const user = useGetCurrentUser();
  const userId = user?._id;
  const isLoading = chat === undefined;
  const navigate = useNavigate(); // Initialize useNavigate

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center p-4 rounded-xl bg-secondary dark:bg-secondary-foreground animate-pulse"
          >
            <Skeleton className="w-12 h-12 rounded-full mr-4" />
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="w-16 h-8 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!chat || !user || !userId || chat.length === 0) {
    return (
      <div className="flex justify-center items-center h-32 p-4">
        <h1 className="text-lg font-semibold text-muted-foreground dark:text-muted">
          No chats found
        </h1>
      </div>
    );
  }

  const handleChatClick = (chatItem: ChatDataType) => {
    onChatSelect(chatItem._id);
  };

  return (
    <div className="space-y-4 max-h-[50vh] md:max-h-[55vh] custom-scrollbar  min-h-[50vh] md:min-h-[20vh] overflow-y-auto px-4">
      {chat.map((chatItem) => (
        <div
          key={chatItem._id}
          className={cn(
            "flex items-center p-4 rounded-xl transition duration-300 cursor-pointer", // Added cursor-pointer
            chatItem._id === selectedChatId
              ? "bg-accent"
              : "bg-secondary hover:bg-muted "
          )}
          onClick={() => handleChatClick(chatItem)} // Call handleChatClick
        >
          <div
            key={`inner-${chatItem._id}`}
            className={cn(
              "flex items-center px-2 rounded-xl transition duration-300",
              "bg-secondary hover:bg-muted "
            )}
          >
            <img
              src={chatItem.chatImage || "/default-chat.png"}
              alt={chatItem.chatName}
              className="w-12 h-12 rounded-full object-cover mr-4 shadow-sm"
            />

            <div className="flex-1">
              <h1 className="text-foreground dark:text-card-foreground font-semibold">
                {chatItem.chatName}
              </h1>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {chatItem.lastMessage
                  ? chatItem.lastMessage
                  : "No messages yet"}
              </p>
            </div>
            {chatItem.unreadMessageCount &&
              userId &&
              chatItem.unreadMessageCount[userId] !== undefined && (
                <div>
                  {chatItem.unreadMessageCount[userId]! > 0 && (
                    <div className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center">
                      {chatItem.unreadMessageCount[userId]!}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
