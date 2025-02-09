import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@convex/_generated/dataModel";
import { useGetAllUsers, useGetCurrentUser } from "@/actions/query/users";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useCreateGroupChat,
  useCreatePersonalChat,
} from "@/actions/mutations/messages/message-mution";
import {
  GroupIcon,
  LoaderIcon,
  MessageCircleHeart,
  MessageCirclePlusIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useIsPersonalChatExist } from "@/actions/query/messages/message-query";
import { useToast } from "@/hooks/use-toast";
import SubmitButton from "../ui/submit-button";

const AddUsersToChatList = ({
  chatType,
  setIsOpen, // Receive setIsOpen
}: {
  chatType: "group" | "personal";
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const users = useGetAllUsers();
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]); // For Group Chat
  const isLoading = users === undefined;

  const user = useGetCurrentUser();
  const currentUserId = user?._id;
  const handleUserSelect = (userId: Id<"users">) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col py-4 space-y-2">
        {[...Array(5)].map((_, i) => (
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
    <div className="flex flex-col relative space-y-2">
      <div className="pb-20 flex flex-col space-y-2">
        {users.map((user) => {
          return (
            <div
              className={cn(
                "flex border p-2 flex-row justify-between items-center w-full",
                chatType === "personal" &&
                  user._id === currentUserId &&
                  "hidden"
              )}
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
                {chatType === "personal" ? (
                  <PersonalChatButton
                    setOpen={setIsOpen}
                    user1Id={currentUserId}
                    user2Id={user._id}
                  />
                ) : (
                  <Checkbox
                    checked={selectedUsers.includes(user._id)}
                    onCheckedChange={() => handleUserSelect(user._id)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {chatType === "group" && (
        <div className=" w-11/12 transform left-1/2  -translate-x-1/2 bottom-0 fixed flex flex-col space-y-2">
          <CreateGroupChatButton
            setIsOpen={setIsOpen}
            userIds={selectedUsers}
          />
        </div>
      )}
    </div>
  );
};

export default AddUsersToChatList;

interface PersonalChatCreateButtonProps {
  user1Id: Id<"users"> | undefined;
  user2Id: Id<"users"> | undefined;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PersonalChatButton = ({
  user1Id,
  user2Id,
  setOpen,
}: PersonalChatCreateButtonProps) => {
  const personalChatExist = useIsPersonalChatExist({ user1Id, user2Id });
  const { mutate: createPersonalChat, isPending: creatingPeronalChat } =
    useCreatePersonalChat();
  const { toast } = useToast();
  const navigate = useNavigate();

  const onCreatePersonalChat = () => {
    if (user1Id && user2Id) {
      createPersonalChat(
        {
          userId: user1Id,
          otherPersonUserId: user2Id,
        },
        {
          onSuccess(data) {
            if (data) {
              navigate(`/chat/${data}`);
              toast({
                variant: "default",
                description: "Chat created successfully.",
              });
              setOpen(false);
            }
          },
          onError() {
            toast({
              variant: "destructive",
              description: "Failed to create chat.",
            });
          },
        }
      );
    }
  };

  return (
    <div>
      <div>
        {personalChatExist === undefined ? (
          <Button variant="outline" disabled={true}>
            <LoaderIcon className="animate-spin mr-2 size-4 inline-block" />
            Loading Chat Status...
          </Button>
        ) : personalChatExist?.exists ? (
          <Button
            variant="outline"
            onClick={() => navigate(`/chat/${personalChatExist?.chatId}`)}
          >
            <span className="flex flex-row items-center justify-center">
              <MessageCirclePlusIcon className="mr-2 text-blue-500" />
              Go to Chat
            </span>
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={onCreatePersonalChat}
            disabled={creatingPeronalChat}
          >
            {creatingPeronalChat ? (
              <span>
                <LoaderIcon className="animate-spin mr-2 size-4 inline-block" />
                Creating...
              </span>
            ) : (
              <span className="flex flex-row items-center justify-center">
                <MessageCircleHeart className="mr-2 text-pink-500" />
                Create Chat
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

interface CreateGroupChatButtonProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userIds: Id<"users">[];
}

const CreateGroupChatButton = ({
  setIsOpen,
  userIds,
}: CreateGroupChatButtonProps) => {
  const { mutate: createGroupChat, isPending: creatingGroupChat } =
    useCreateGroupChat();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateChat = (event: React.FormEvent) => {
    event.preventDefault();
    if (userIds.length < 2) {
      toast({
        variant: "destructive",
        description: "Please select at least 2 users for group chat",
      });
      return;
    }

    createGroupChat(
      {
        chatUsers: userIds,
      },
      {
        onSuccess: (chatId) => {
          if (chatId) {
            navigate(`/chat/${chatId}`);
            setIsOpen(false);
            toast({
              variant: "default",
              description: "Group chat created successfully.",
            });
          }
        },
        onError: () => {
          toast({
            variant: "destructive",
            description: "Failed to create group chat.",
          });
        },
      }
    );
  };

  return (
    <form onSubmit={handleCreateChat} className="pb-5">
      <SubmitButton
        className={cn("w-full", "bg-pink-400 hover:bg-pink-500 w-full")}
        variant="outline"
        isLoading={creatingGroupChat}
        disabled={userIds.length < 2}
      >
        {creatingGroupChat ? (
          <span>
            <LoaderIcon className="animate-spin mr-2" />
            Creating Group...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <GroupIcon className="mr-2" />
            Create Group Chat
          </span>
        )}
      </SubmitButton>
    </form>
  );
};
