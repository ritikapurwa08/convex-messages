import { isAlreadyHaveChat } from "@/actions/mutations/messages";
import { Id } from "@convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { LoaderIcon, MessageSquareIcon } from "lucide-react";
import { CreateMessageButton } from "../chat/create-chat-button";

const SendUserToChat = ({
  user1Id,
  user2Id,
  setIsOpen,
  chatType, // Add chatType prop
}: {
  user1Id: Id<"users"> | undefined;
  user2Id: Id<"users"> | undefined;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatType: "group" | "personal"; // Add chatType prop
}) => {
  const navigate = useNavigate();
  const isChattingAlready = isAlreadyHaveChat({ user1Id, user2Id });

  if (isChattingAlready === undefined) {
    return <LoaderIcon className="animate-spin" />; // Loading state
  }

  if (user1Id === user2Id || !user1Id || !user2Id) {
    return null; // Don't render anything if IDs are the same or missing
  }

  if (chatType === "personal" && isChattingAlready?.exists) {
    return (
      <Button
        onClick={() => navigate(`/message/${isChattingAlready.chatId}`)}
        variant="outline"
      >
        <MessageSquareIcon className="mr-2" />
        Chat
      </Button>
    );
  }

  return (
    <CreateMessageButton
      setIsOpen={setIsOpen}
      userIds={[user1Id, user2Id]}
      chatType={chatType} // Pass chatType to CreateMessageButton
    />
  );
};

export default SendUserToChat;
