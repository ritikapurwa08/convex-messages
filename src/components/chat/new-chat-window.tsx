import { useGetCurrentUser, useGetUserChats } from "@/actions/query/users";
import ChatList from "./chat-list";
import { Id } from "@convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UserDetails from "../users/user-auth/user-details";
import CreateChatDialog from "./create-chat";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { MenuIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

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
  const allChats:
    | Array<{
        _id: Id<"userChats">;
        _creationTime: number;
        lastMessage?: string | undefined;
        unreadMessageCount?: Record<Id<"users">, number> | undefined;
        chatType: "group" | "personal";
        chatName: string;
        chatImage: string;
        chatUsers: Id<"users">[];
      }>
    | undefined = useGetUserChats({ userId });
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState(allChats);

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

  // Added selectedChatId and navigate as dependencies

  const handleChatSelection = (chatId: Id<"userChats">) => {
    navigate(`/chat/${chatId}`);
    onOpenChange(false);
    onChatSelect(chatId);
  };

  if (filteredChats === undefined) {
    return (
      <div className="p-0 flex flex-col h-full bg-background">
        <div className="border-b p-4 flex justify-between items-center">
          <div className="flex flex-col w-full">
            <div className="flex flex-row justify-between items-center px-2 pt-2">
              <Skeleton className="h-8 w-32 rounded-md" />{" "}
              {/* Skeleton for "Chats" heading */}
            </div>
            <div className="p-2">
              <Input
                type="search"
                placeholder="Search chats..."
                disabled
                className="w-full rounded-md bg-secondary border-none text-white focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="flex justify-start p-2 space-x-2"></div>
          </div>
        </div>
        <div className=" flex-1 grow max-h-[90vh] min-h-fit relative h-fit custom-scrollbar overflow-y-auto p-4">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
        <div className="sticky pb-2 px-4 bottom-0">
          <Skeleton className="h-10 w-full rounded-md" />{" "}
          {/* Skeleton for UserDetails */}
        </div>
      </div>
    );
  }

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
      <div className="flex-1 grow pt-6">
        <ChatList
          chat={filteredChats}
          onChatSelect={handleChatSelection}
          selectedChatId={selectedChatId}
        />

        <div className="sticky pb-2 px-4 bottom-0">
          <UserDetails />
        </div>
        <div className="flex px-8">
          <Button
            className="w-full "
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
interface StandaloneChatWindowProps {
  onChatSelect?: (chatId: Id<"userChats">) => void;
  isSheetOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
const StandaloneChatWindow = ({ onChatSelect }: StandaloneChatWindowProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentSelectedChatId, setCurrentSelectedChatId] =
    useState<Id<"userChats"> | null>(null);

  const handleChatSelectStandalone = (chatId: Id<"userChats">) => {
    setCurrentSelectedChatId(chatId);
    setIsSheetOpen(false);
    onChatSelect?.(chatId); // Call the parent's onChatSelect if provided
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="" variant="ghost" size="icon">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0 flex w-full flex-col h-full bg-background">
        <ChatWindowContent
          onChatSelect={handleChatSelectStandalone}
          selectedChatId={currentSelectedChatId}
          onOpenChange={setIsSheetOpen}
        />
      </SheetContent>
    </Sheet>
  );
};

export default StandaloneChatWindow;
