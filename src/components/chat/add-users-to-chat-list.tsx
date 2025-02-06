import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@convex/_generated/dataModel";
import { useGetAllUsers } from "@/actions/query/users";
import { useState } from "react";
import { cn } from "@/lib/utils";
import SendUserToChat from "../message/send-user-to-chat-button";
import { CreateMessageButton } from "./create-chat-button";

const AddUsersToChatList = ({
  currentUserId,
  chatType,
  setIsOpen, // Receive setIsOpen
}: {
  currentUserId: Id<"users"> | undefined;
  chatType: "group" | "personal";
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const users = useGetAllUsers();
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]); // For Group Chat

  const isLoading = users === undefined;

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

  console.log(selectedUsers);

  return (
    <div className="flex flex-col relative space-y-2">
      <div className="pb-10 flex flex-col space-y-2">
        {users.map((user) => (
          <div
            className={cn(
              "flex border p-2 flex-row justify-between items-center w-full",
              user._id === currentUserId && "hidden"
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
                <SendUserToChat
                  chatType={chatType}
                  user1Id={currentUserId}
                  user2Id={user._id}
                  setIsOpen={setIsOpen}
                />
              ) : (
                <Checkbox
                  checked={selectedUsers.includes(user._id)}
                  onCheckedChange={() => handleUserSelect(user._id)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      {chatType === "group" && (
        <div className=" w-11/12 transform left-1/2 pb-5 -translate-x-1/2 bottom-0 fixed">
          <CreateMessageButton
            setIsOpen={setIsOpen}
            userIds={selectedUsers}
            chatType="group"
          />
        </div>
      )}
    </div>
  );
};

export default AddUsersToChatList;
