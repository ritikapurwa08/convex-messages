import { Id } from "@convex/_generated/dataModel";
import { Link } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";

interface ChatDataType {
  unreadMessageCount: number;
  _id: Id<"chats">;
  _creationTime: number;
  lastMessage?: string | undefined;
  chatName: string;
  chatType: "group" | "personal";
  chatUsers: Id<"users">[];
  chatImage: string;
}

interface ChatListProps {
  chat: ChatDataType[] | null | undefined;
}

const ChatList = ({ chat }: ChatListProps) => {
  let stop = "stop";
  if (chat === undefined || stop === "stops") {
    return (
      <div className="flex flex-col space-y-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex flex-row justify-between"
            id="image-name"
          >
            <div id="name-image" className="flex flex-row items-center ">
              <Skeleton className="size-12 mr-2 rounded-full " />
              <Skeleton id="name" className="w-32 h-6" />
            </div>
            <div
              id="add-button"
              className="ml-4 flex justify-center items-center"
            >
              <Skeleton id="add-button" className="w-24 h-9" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!chat || chat.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <h1 className="text-lg font-semibold text-gray-500">No chats found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {chat.map((chatItem) => (
        <Link
          to={`/message/${chatItem._id}`}
          key={chatItem._id}
          className="flex items-center p-4  rounded-xl shadow-md hover:bg-gray-700 transition"
        >
          {/* Chat Avatar */}
          <img
            src={chatItem.chatImage || "/default-chat.png"}
            alt={chatItem.chatName}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />

          {/* Chat Info */}
          <div className="flex-1">
            <h1 className="text-white font-semibold">{chatItem.chatName}</h1>
            <p className="text-sm text-gray-400">
              {chatItem.lastMessage ? chatItem.lastMessage : "No messages yet"}
            </p>
            <p>{chatItem.unreadMessageCount}</p>
          </div>

          {/* Chat Type Badge */}
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">
            {chatItem.chatType.toUpperCase()}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default ChatList;
