import {
  useCreateGroupChat,
  useCreatePersonalChat,
} from "@/actions/mutations/messages/message-mution";
import { useIsPersonalChatExist } from "@/actions/query/messages/message-query";
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
  otherPersonUserId: Id<"users">;
}

export const CreateMessageButton = ({
  setIsOpen,
  userIds,
  otherPersonUserId,

  chatType,
}: CreateChatProps) => {
  const user = useGetCurrentUser();
  const userId = user?._id;
  const { mutate: createPersonalChat, isPending: creatingPeronalChat } =
    useCreatePersonalChat();
  const { mutate: createGroupChat, isPending: creatingGroupChat } =
    useCreateGroupChat();
  const personalChatExist = useIsPersonalChatExist({
    user1Id: userId,
    user2Id: otherPersonUserId,
  });
  //  it will return a true and a chat id so we can redirect them to their chat
  const navigate = useNavigate();
  const chatName = user?.name;
  const chatImage = user?.customImage;

  const handleCreateChat = (event: React.FormEvent) => {
    event.preventDefault();
    if (chatType === "personal") {
      if (chatName && chatImage && userId) {
        createPersonalChat({
          otherPersonUserId,
          userId,
        });
      }
    } else if (chatType === "group") {
      if (userIds) {
        createGroupChat({
          chatUsers: userIds,
        });
      }
    }
  };

  return (
    <form onSubmit={handleCreateChat}>
      <SubmitButton
        className={cn(
          "",
          chatType === "group" && "bg-pink-400 hover:bg-pink-500 w-full"
        )}
        variant="outline"
        isLoading={creatingPeronalChat}
      >
        {creatingPeronalChat ? (
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
