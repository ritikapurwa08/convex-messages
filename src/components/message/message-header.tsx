import { useGetChatById } from "@/actions/query/messages/message-query";
import { Doc, Id } from "@convex/_generated/dataModel";
import { Skeleton } from "../ui/skeleton";
import StandaloneChatWindow from "../chat/new-chat-window";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const MessageHeader = ({ chatId }: { chatId: Id<"userChats"> }) => {
  const currentUserChat: Doc<"userChats"> | undefined = useGetChatById({
    chatId,
  });
  const navigate = useNavigate();

  const handleChatChange = (newChatId: Id<"userChats">) => {
    navigate(`/chat/${newChatId}`);
  };

  const { _creationTime, _id, chatImage, chatName } = currentUserChat || {};
  const formattedDate = _creationTime
    ? format(new Date(_creationTime), "MMM dd, yyyy") // Example format: "Feb 07, 2025"
    : null;
  return (
    <div
      key={_id}
      className="px-4 mx-auto w-full border-b p-4 sticky top-0 z-50 bg-black "
    >
      <div className="flex max-w-5xl mx-auto flex-row justify-start items-center">
        <StandaloneChatWindow onChatSelect={handleChatChange} />
        <div className="flex ml-2 flex-row justify-center">
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
        <div className="flex flex-col">
          {chatName ? (
            <span className="capitalize text-xs">{chatName}</span>
          ) : (
            <span>
              <Skeleton className="w-32" />
            </span>
          )}
          {formattedDate ? (
            <span className="text-xs text-gray-400">{formattedDate}</span>
          ) : (
            <span>
              <Skeleton className="w-24" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;
