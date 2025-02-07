import { useGetChatById } from "@/actions/query/messages/message-query";
import { Doc, Id } from "@convex/_generated/dataModel";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { MenuIcon } from "lucide-react";
import ChatWindow from "../chat/chats-window";
import ChatWindowNew from "../chat/new-chat-window";
import StandaloneChatWindow from "../chat/new-chat-window";

const MessageHeader = ({ chatId }: { chatId: Id<"userChats"> }) => {
  const currentUserChat: Doc<"userChats"> | undefined = useGetChatById({
    chatId,
  });

  const { _creationTime, _id, chatImage, chatName, chatType } =
    currentUserChat || {};

  return (
    <div className="px-4 border-b p-4 sticky top-0 z-50 bg-black ">
      <div className="flex flex-row justify-start items-center">
        <StandaloneChatWindow />
        <div className="flex flex-row justify-center">
          {chatImage ? (
            <img
              src={chatImage}
              className="size-8 mr-2 rounded-full overflow-hidden object-cover"
              alt=""
            />
          ) : (
            <span>
              <Skeleton />
            </span>
          )}
        </div>
        <div>
          {chatName ? (
            <span>{chatName}</span>
          ) : (
            <span>
              <Skeleton className="w-32" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;
