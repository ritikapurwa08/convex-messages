import { useCreateChat } from "@/actions/mutations/messages";
import { useGetCurrentUser } from "@/actions/query/users";
import SubmitButton from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { GroupIcon, LoaderIcon, MessageCirclePlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreateChatProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userIds: Id<"users">[];
  chatType: "group" | "personal";
}

export const CreateMessageButton = ({
  setIsOpen,
  userIds,
  chatType,
}: CreateChatProps) => {
  const user = useGetCurrentUser();
  const userId = user?._id;
  const { mutate: createChat, isPending: creatingChat } = useCreateChat();
  const navigate = useNavigate();

  const handleCreateChat = (event: React.FormEvent) => {
    event.preventDefault();

    if (!userId || userIds.length === 0) {
      console.error("Missing user IDs.");
      return;
    }

    const uniqueUserIds = Array.from(new Set([userId, ...userIds]));

    if (chatType === "personal" && uniqueUserIds.length !== 2) {
      console.error("Personal chat must have exactly 2 users.");
      return;
    }

    if (chatType === "group" && uniqueUserIds.length < 2) {
      console.error("Group chat must have at least 2 users.");
      return;
    }

    createChat(
      {
        chatImage: "", // You might want to handle chat images later
        chatUsers: uniqueUserIds,
      },
      {
        onSuccess(data) {
          navigate(`/message/${data}`);
          setIsOpen(false);
        },
        onError(error) {
          console.error("Error creating chat:", error);
          setIsOpen(false);
        },
      }
    );
  };

  return (
    <form onSubmit={handleCreateChat}>
      <SubmitButton
        className={cn(
          "",
          chatType === "group" && "bg-pink-400 hover:bg-pink-500 w-full"
        )}
        variant="outline"
        isLoading={creatingChat}
      >
        {creatingChat ? (
          <span>
            <LoaderIcon className="animate-spin mr-2" />
            Creating...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            {chatType === "personal" ? (
              <MessageCirclePlusIcon className="mr-2" />
            ) : (
              <GroupIcon className="mr-2" />
            )}
            {chatType === "personal" ? "Message" : "Create Group"}
          </span>
        )}
      </SubmitButton>
    </form>
  );
};
