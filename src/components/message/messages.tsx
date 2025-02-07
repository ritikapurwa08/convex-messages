import { useGetCurrentUser } from "@/actions/query/users";
import SendMessage from "./send-message";
import { useState, useEffect, useRef } from "react"; // Import useRef
import { MessageList } from "./message-list";
import { Id } from "@convex/_generated/dataModel";

import { useGetMessages } from "@/actions/query/messages/message-query";
import MessageHeader from "./message-header";

const Messages = ({ chatId }: { chatId: Id<"userChats"> }) => {
  const user = useGetCurrentUser();

  const userId = user?._id;
  const messages = useGetMessages({ chatId });
  const [message, setExistingMsg] = useState<string>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [, setWindowHeight] = useState(window.innerHeight); // Track window height
  const messageListRef = useRef<HTMLDivElement>(null); // Create a ref

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight); // Update window height on resize
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleKeyboardStatusChange = (isVisible: boolean) => {
    setIsKeyboardVisible(isVisible);
  };

  const handleScroll = () => {
    if (isKeyboardVisible) {
      document.activeElement instanceof HTMLElement &&
        document.activeElement.blur();
      setIsKeyboardVisible(false); // Optionally update keyboard visibility state
    }
  };

  // Calculate dynamic max-h for message list

  return (
    <div className="flex flex-col h-full max-h-[110dvh] relative w-full bg-background">
      <main
        ref={messageListRef} // Attach the ref to the main element
        onScroll={handleScroll} // Add onScroll handler
        className="flex-1 w-full overflow-y-auto custom-scrollbar"
      >
        <MessageHeader chatId={chatId} />

        <div className="max-w-4xl mx-auto py-5 px-4">
          <MessageList chatId={chatId} userId={userId} messages={messages} />
        </div>
      </main>
      <footer className="w-full sticky bottom-0 border-t bg-background p-4">
        <div className="max-w-4xl mx-auto">
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
