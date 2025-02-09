import { useGetCurrentUser } from "@/actions/query/users";
import SendMessage from "./send-message";
import { useState, useRef, useEffect } from "react";
import { MessageList } from "./message-list";
import { Id } from "@convex/_generated/dataModel";
import { useGetMessages } from "@/actions/query/messages/message-query";
import MessageHeader from "./message-header";

const Messages = ({ chatId }: { chatId: Id<"userChats"> }) => {
  const user = useGetCurrentUser();
  const userId = user?._id;
  const messages = useGetMessages({ chatId });
  const [message, setExistingMsg] = useState<string>("");
  const messageListRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to safely scroll to bottom
  const scrollToBottom = () => {
    if (messageListRef.current) {
      const scrollHeight = messageListRef.current.scrollHeight;
      const height = messageListRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      messageListRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  // Handle viewport changes with debouncing
  const handleViewportChange = () => {
    if (window.visualViewport) {
      const newHeight = window.visualViewport.height;
      setViewportHeight(newHeight);

      // Prevent unwanted scroll adjustments during normal scrolling
      const isKeyboardVisible = window.innerHeight - newHeight > 100;
      if (isKeyboardVisible) {
        requestAnimationFrame(scrollToBottom);
      }

      // Update container height and prevent black space
      if (containerRef.current) {
        containerRef.current.style.height = `${newHeight}px`;
        containerRef.current.style.minHeight = `${newHeight}px`;
      }
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      requestAnimationFrame(scrollToBottom);
    }
  }, [messages]);

  // Set up viewport listeners with cleanup
  useEffect(() => {
    const initialHeight = window.visualViewport?.height || window.innerHeight;
    setViewportHeight(initialHeight);

    if (window.visualViewport) {
      const viewport = window.visualViewport;
      viewport.addEventListener("resize", handleViewportChange);
      viewport.addEventListener("scroll", handleViewportChange);

      // Initial container setup
      if (containerRef.current) {
        containerRef.current.style.height = `${initialHeight}px`;
        containerRef.current.style.minHeight = `${initialHeight}px`;
      }

      return () => {
        viewport.removeEventListener("resize", handleViewportChange);
        viewport.removeEventListener("scroll", handleViewportChange);
      };
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col relative w-full bg-background overflow-hidden"
      style={{
        height: `${viewportHeight}px`,
        maxHeight: "100dvh",
      }}
    >
      <MessageHeader chatId={chatId} />

      <main
        ref={messageListRef}
        className="flex-1 w-full overflow-y-auto custom-scrollbar overscroll-none"
      >
        <div className="max-w-4xl mx-auto py-5 px-4">
          <MessageList chatId={chatId} userId={userId} messages={messages} />
        </div>
      </main>

      <footer className="w-full relative border-t bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <SendMessage
            existingMessage={message}
            setExistingMessage={setExistingMsg}
            chatId={chatId}
            senderId={user?._id}
            onKeyboardStatusChange={() => scrollToBottom()}
          />
        </div>
      </footer>
    </div>
  );
};

export default Messages;
