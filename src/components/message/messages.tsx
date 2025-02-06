import { useGetUserMessages } from "@/actions/mutations/messages";
import { useGetCurrentUser } from "@/actions/query/users";
import SendMessage from "./send-message";
import { useState } from "react";
import { MessageList } from "./message-list";
import { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import MessageHeader from "./message-header";

const Messages = ({ chatId }: { chatId: Id<"chats"> }) => {
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
    <div className="flex flex-col h-full bg-background">
      {" "}
      {/* h-full is key */}
      <MessageHeader chatId={chatId} userId={userId} /> {/* Header remains */}
      <main className="flex-1 custom-scrollbar overflow-y-auto">
        {" "}
        {/* Scrollable content */}
        <MessageList chatId={chatId} userId={userId} messages={messages} />
      </main>
      <footer className="flex-none p-4 border-t bg-background">
        {" "}
        {/* Footer remains */}
        <div
          className={cn("max-w-3xl mx-auto w-full", isKeyboardVisible && "")}
        >
          <SendMessage
            existingMessage={message}
            setExistingMessage={setExistingMsg}
            chatId={chatId}
            senderId={user?._id}
            onKeyboardStatusChange={handleKeyboardStatusChange}
          />
        </div>
      </footer>
    </div>
  );
};

export default Messages;
