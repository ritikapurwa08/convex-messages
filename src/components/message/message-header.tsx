import { useGetuserChatByUserId } from "@/actions/query/messages/message-query";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

const MessageHeader = ({
  userId,
  chatId,
}: {
  userId: Id<"users"> | undefined;
  chatId: Id<"chats"> | undefined;
}) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const currentChat = useGetuserChatByUserId({ userId, chatId });

  if (currentChat === undefined) return <Skeleton className="w-full h-12" />;
  if (currentChat === null) return <div>Chat not found</div>;

  const { image, name } = currentChat;

  const handleBack = () => {
    navigate(-1); // Navigate back one page
  };

  return (
    <header className="flex-none p-4 border-b flex items-center">
      {" "}
      {/* Flex for alignment */}
      <Button variant="ghost" type="button" onClick={handleBack}>
        {" "}
        {/* Use onClick */}
        <ArrowLeft className="size-5 mr-2" />
        <span>Back</span> {/* Simple "Back" text */}
      </Button>
      <div className="ml-4 flex items-center">
        {" "}
        {/* Container for name and image */}
        {image ? (
          <img
            className="size-8 mr-2 rounded-full object-cover" // Increased size
            src={image}
            alt={name} // Added alt text
          />
        ) : (
          <Skeleton className="size-8 mr-2 rounded-full" /> // Skeleton for image
        )}
        <span className="font-semibold text-lg">
          {" "}
          {/* Larger, bolder name */}
          {name ? (
            name
          ) : (
            <Skeleton className="h-6 w-32" /> // Skeleton for name
          )}
        </span>
      </div>
    </header>
  );
};

export default MessageHeader;
