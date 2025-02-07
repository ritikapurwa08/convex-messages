import { useGetCurrentUser, useGetUserChats } from "@/actions/query/users";
import ChatList from "./chat-list";
import { Id } from "@convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UserDetails from "../users/user-auth/user-details";
import CreateChatDialog from "./create-chat";

interface ChatWindowProps {
  onChatSelect: (chatId: Id<"userChats">) => void; // Callback for chat selection
  selectedChatId: Id<"userChats"> | null; // Currently selected chat
  toggleSidebar: () => void;
}

const ChatWindow = ({ onChatSelect, selectedChatId }: ChatWindowProps) => {
  const user = useGetCurrentUser();
  const userId = user?._id;
  const chats = useGetUserChats({ userId });
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChatSelection = (chatId: Id<"userChats">) => {
    if (isMobile) {
      navigate(`/chat/${chatId}`); // Navigate to chat route on mobile
    } else {
      onChatSelect(chatId); // Use callback for sidebar on larger screens
    }
  };

  if (!userId) {
    return <div>User not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex flex-row justify-between px-4 pt-4"></div>
        </div>
      </div>
      <div className="flex-1 grow max-h-[90vh] min-h-fit relative h-fit  custom-scrollbar overflow-y-auto">
        <h1 className="text-white text-center font-bold text-xl">Chats</h1>
        <div className="flex justify-center p-2 flex-col md:flex-row">
          <CreateChatDialog chatType="personal" />
          <CreateChatDialog chatType="group" />
        </div>

        <ChatList
          chat={chats}
          onChatSelect={handleChatSelection} // Use the modified handler
          selectedChatId={selectedChatId}
        />

        <div className="sticky pb-2 px-4 bottom-0">
          <UserDetails />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
