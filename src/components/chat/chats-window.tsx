import { useGetUserChats } from "@/actions/query/messages/message-query";
import { useGetCurrentUser } from "@/actions/query/users";
import ChatList from "./chat-list";
import { Id } from "@convex/_generated/dataModel";
import { Outlet } from "react-router-dom";
import { Button } from "../ui/button";
import { MenuIcon } from "lucide-react";
import CreateChatDialog from "./create-chat";
import UserLogOutButton from "../users/user-auth/user-logout-button";

interface ChatWindowProps {
  onChatSelect: (chatId: Id<"chats">) => void; // Callback for chat selection
  selectedChatId: Id<"chats"> | null; // Currently selected chat
  toggleSidebar: () => void;
}

const ChatWindow = ({
  toggleSidebar,
  onChatSelect,
  selectedChatId,
}: ChatWindowProps) => {
  const user = useGetCurrentUser();
  const userId = user?._id;
  const chat = useGetUserChats({ userId });

  if (!userId) {
    return <div>User not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-white font-bold text-xl">Chats</h1>
          <div className="flex flex-row justify-between px-4 pt-4">
            <CreateChatDialog chatType="personal" currentUserId={userId} />
            <CreateChatDialog chatType="group" currentUserId={userId} />
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden text-white"
        >
          <MenuIcon />
        </Button>
      </div>
      <div className="flex-1 relative  custom-scrollbar overflow-y-auto">
        <ChatList
          chat={chat}
          onChatSelect={onChatSelect}
          selectedChatId={selectedChatId}
        />
        <ChatList
          chat={chat}
          onChatSelect={onChatSelect}
          selectedChatId={selectedChatId}
        />
        <ChatList
          chat={chat}
          onChatSelect={onChatSelect}
          selectedChatId={selectedChatId}
        />
        <ChatList
          chat={chat}
          onChatSelect={onChatSelect}
          selectedChatId={selectedChatId}
        />
        <ChatList
          chat={chat}
          onChatSelect={onChatSelect}
          selectedChatId={selectedChatId}
        />
        <div className="sticky pb-2 px-4 bottom-0">
          <UserLogOutButton />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
