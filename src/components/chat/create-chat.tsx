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

import { GroupIcon, MessageCirclePlusIcon } from "lucide-react";
import AddUsersToChatList from "./add-users-to-chat-list";

const CreateChatDialog = ({ chatType }: { chatType: "group" | "personal" }) => {
  const [open, setOpen] = useState(false);
  return (
    <main className="">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="hover:bg-black/20" variant="ghost">
            {chatType === "personal" ? (
              <span className="flex flex-row items-center justify-center">
                <MessageCirclePlusIcon className="mr-2" />
                Create Chat
              </span>
            ) : (
              <span className="flex flex-row items-center justify-center">
                <GroupIcon className="mr-2" />
                Create Group
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>
              {chatType === "personal"
                ? "Create a Personal Chat"
                : "Create a Group Chat"}
            </DialogTitle>
            <DialogDescription>
              {chatType === "personal"
                ? "Select a user to start a chat."
                : "Select users to add to the group chat."}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto min-h-[44vh] custom-scrollbar max-h-[44vh]">
            <AddUsersToChatList setIsOpen={setOpen} chatType={chatType} />
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default CreateChatDialog;
