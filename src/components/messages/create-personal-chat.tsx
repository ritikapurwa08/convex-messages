import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { isAlreadyHaveChat, useCreateChat } from "@/actions/mutations/messages";
import { useGetAllUsers, useGetCurrentUser } from "@/actions/query/users";
import { Id } from "@convex/_generated/dataModel";
import SubmitButton from "../ui/submit-button";
import {
  LoaderIcon,
  MessageCirclePlusIcon,
  MessageSquareIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";

const CreatePersonalChatButton = ({
  currentUserId,
}: {
  currentUserId: Id<"users"> | undefined;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageCirclePlusIcon />
          Create Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Create a Personal Chat</DialogTitle>
          <DialogDescription>Select a user to start a chat.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto min-h-[44vh] max-h-[44vh]">
          <UserList currentUserId={currentUserId} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePersonalChatButton;

interface CreateChatProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userIds: Id<"users">[];
}

const CreateMessageButton = ({ setIsOpen, userIds }: CreateChatProps) => {
  const user = useGetCurrentUser();
  const userId = user?._id;
  const { mutate: createChat, isPending: creatingChat } = useCreateChat();
  const navigate = useNavigate();

  const handleCreateChat = () => {
    if (userId && userIds.length > 0) {
      const uniqueUserIds = Array.from(new Set([userId, ...userIds])); // Ensure unique users

      if (uniqueUserIds.length !== 2) {
        console.error("Unexpected user count:", uniqueUserIds);
        return;
      }

      createChat(
        {
          chatImage: "",
          chatUsers: uniqueUserIds, // Ensure only 2 users are in the array
        },
        {
          onSuccess(data) {
            navigate(`/message/${data}`);
            setIsOpen(false);
          },
          onError() {
            setIsOpen(false);
          },
        }
      );
    }
  };
  return (
    <form onSubmit={handleCreateChat}>
      <SubmitButton variant="outline" isLoading={creatingChat}>
        {creatingChat ? (
          <span>
            <LoaderIcon className="animate-spin mr-2" />
            Createting...
          </span>
        ) : (
          <span className="flex flex-row items-center justify-center ">
            <MessageCirclePlusIcon className="mr-2" />
            Message
          </span>
        )}
      </SubmitButton>
    </form>
  );
};

const SendUserToChat = ({
  user1Id,
  user2Id,
  setIsOpen,
}: {
  user1Id: Id<"users"> | undefined;
  user2Id: Id<"users"> | undefined;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const isChattingAlready = isAlreadyHaveChat({ user1Id, user2Id });
  if (isChattingAlready === undefined) {
    return (
      <div>
        <Button variant="outline" size="default">
          <LoaderIcon className="animate-spin mr-2" />
        </Button>
      </div>
    );
  }

  if (user1Id === user2Id) {
    return null;
  }
  if (isChattingAlready?.exists) {
    return (
      <Button
        onClick={() => navigate(`/message/${isChattingAlready.chatId}`)}
        variant="outline"
        size="default"
      >
        <MessageSquareIcon />
        Chat
      </Button>
    );
  }
  if (user1Id && user2Id) {
    return (
      <CreateMessageButton setIsOpen={setIsOpen} userIds={[user1Id, user2Id]} />
    );
  }
};

const UserList = ({
  currentUserId,
}: {
  currentUserId: Id<"users"> | undefined;
}) => {
  const users = useGetAllUsers();
  let stop = "stopa";
  if (users === undefined || stop === "stop") {
    return (
      <div className="flex flex-col space-y-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex flex-row justify-between"
            id="image-name"
          >
            <div id="name-image" className="flex flex-row items-center ">
              <Skeleton className="size-12 mr-2 rounded-full " />
              <Skeleton id="name" className="w-32 h-6" />
            </div>
            <div
              id="add-button"
              className="ml-4 flex justify-center items-center"
            >
              <Skeleton id="add-button" className="w-24 h-9" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {users.map((user) => (
        <div
          className="flex border p-2 flex-row justify-between items-center w-full"
          key={user._id}
        >
          <div className="size-12 flex flex-row items-center">
            <img
              src={user.customImage}
              alt=""
              className="rounded-full object-cover mr-2 border p-0.5"
            />
            <h1>{user.name}</h1>
          </div>
          <div>
            <SendUserToChat
              user1Id={currentUserId}
              user2Id={user._id}
              setIsOpen={() => {}}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
