import React, { useEffect } from "react";
import { useGetUserMessages } from "@/actions/mutations/messages";
import { useGetCurrentUser } from "@/actions/query/users";
import { Link, useParams } from "react-router-dom";
import SendMessage from "./send-message";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { MessageList } from "./message-list";
import { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const Messages = () => {
  const { chatId } = useParams<{ chatId: Id<"chats"> }>();
  const user = useGetCurrentUser();
  const userId = user?._id;
  const messages = useGetUserMessages({ chatId });
  const [message, setExistingMsg] = useState<string>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // Track keyboard visibility

  const handleKeyboardStatusChange = (isVisible: boolean) => {
    setIsKeyboardVisible(isVisible);
  };

  console.log(isKeyboardVisible);

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col bg-background",
        !isKeyboardVisible && "overflow-hidden"
      )}
    >
      <header className="flex-none p-4 border-b">
        <Button variant="outline" type="button">
          <Link className="flex items-center" to="/">
            <ArrowLeft className="size-5 mr-2" />
            <span>chatName</span>
          </Link>
        </Button>
      </header>

      <main className="flex-1 custom-scrollbar overflow-y-auto">
        <MessageList chatId={chatId} userId={userId} messages={messages} />
      </main>

      <footer className="flex-none p-4 border-t bg-background">
        <div
          className={cn("max-w-3xl mx-auto w-full", isKeyboardVisible && "")}
        >
          <SendMessage
            existingMessage={message}
            setExistingMessage={setExistingMsg}
            chatId={chatId}
            senderId={user?._id}
            onKeyboardStatusChange={handleKeyboardStatusChange} // Pass the callback
          />
        </div>
      </footer>
    </div>
  );
};

export default Messages;
