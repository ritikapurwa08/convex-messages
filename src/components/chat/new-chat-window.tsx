import { useGetCurrentUser, useGetUserChats } from "@/actions/query/users";
import ChatList from "./chat-list";
import { Id } from "@convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UserDetails from "../users/user-auth/user-details";
import CreateChatDialog from "./create-chat";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { MenuIcon, Search as SearchIcon } from "lucide-react";
import { Button } from "../ui/button";

interface ChatWindowContentProps {
  onChatSelect: (chatId: Id<"userChats">) => void;
  selectedChatId: Id<"userChats"> | null;
  onOpenChange: (open: boolean) => void;
}

const ChatWindowContent = ({
  onChatSelect,
  selectedChatId,
  onOpenChange,
}: ChatWindowContentProps) => {
  const user = useGetCurrentUser();
  const userId = user?._id;
  const allChats = useGetUserChats({ userId });
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState(allChats);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (allChats) {
      const filtered = allChats.filter((chat) =>
        chat.chatName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats([]);
    }
  }, [searchQuery, allChats]);

  const handleChatSelection = (chatId: Id<"userChats">) => {
    if (isMobile) {
      navigate(`/chat/${chatId}`);
      onOpenChange(false);
    } else {
      onChatSelect(chatId);
    }
  };

  if (!userId) {
    return <div>User not found</div>;
  }

  return (
    <div className="p-0 flex flex-col h-full bg-background">
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex flex-col w-full">
          <div className="flex flex-row justify-between items-center px-2 pt-2">
            <h1 className="text-white text-center font-bold text-xl">Chats</h1>
          </div>
          <div className="p-2">
            <Input
              type="search"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md bg-secondary border-none text-white focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex justify-start p-2 space-x-2">
            <CreateChatDialog chatType="personal" />
            <CreateChatDialog chatType="group" />
          </div>
        </div>
      </div>
      <div className="">
        <ChatList
          chat={filteredChats}
          onChatSelect={handleChatSelection}
          selectedChatId={selectedChatId}
        />
        <div className="sticky pb-2 px-4 bottom-0">
          <UserDetails />
        </div>
      </div>
    </div>
  );
};

const StandaloneChatWindow = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentSelectedChatId, setCurrentSelectedChatId] =
    useState<Id<"userChats"> | null>(null);

  const handleChatSelectStandalone = (chatId: Id<"userChats">) => {
    setCurrentSelectedChatId(chatId);
    setIsSheetOpen(false); // Close sheet after chat selection even on desktop for standalone version
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0 flex w-full flex-col h-full bg-background">
        <ChatWindowContent
          onChatSelect={handleChatSelectStandalone} // Use standalone chat select handler
          selectedChatId={currentSelectedChatId} // Pass the internally managed selectedChatId
          onOpenChange={setIsSheetOpen} // Pass setIsSheetOpen to ChatWindowContent
        />
      </SheetContent>
    </Sheet>
  );
};

export default StandaloneChatWindow;
