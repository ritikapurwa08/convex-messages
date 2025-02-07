import { useGetCurrentUser } from "@/actions/query/users";
import ChatWindow from "@/components/chat/chats-window";
import CreateChatDialog from "@/components/chat/create-chat";
import Messages from "@/components/message/messages";
import UserAuthPage from "@/components/users/user-auth/user-auth-page";
import UserLogOutButton from "@/components/users/user-auth/user-logout-button";
import { useAuthActions } from "@convex-dev/auth/react";
import { Id } from "@convex/_generated/dataModel";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom"; // Import useParams

const RootLayout = () => {
  const {} = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [path, setPath] = useState<string>("");
  const pathName = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for loading to finish first
    if (!isLoading) {
      if (!isAuthenticated) {
        // If not authenticated after loading, redirect to sign-in
        setPath("/sign-in");
        navigate(path);
      } else if (pathName.pathname === "/sign-in") {
        // If authenticated and on sign-in page, redirect to home
        setPath("/");
        navigate(path);
      }
      // Else: If authenticated and not on sign-in page, stay on current page
    }
  }, [isAuthenticated, isLoading, pathName.pathname, path, navigate]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-in" element={<UserAuthPage />} />
        <Route path="/chat/:chatId" element={<ChatRoutePage />} />{" "}
        {/* New chat route */}
      </Routes>
    </div>
  );
};

export default RootLayout;

const Homepage = () => {
  const [selectedChatId, setSelectedChatId] = useState<Id<"userChats"> | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Example state for sidebar toggle

  const handleChatSelect = (chatId: Id<"userChats">) => {
    setSelectedChatId(chatId);
    // setIsSidebarOpen(false); // Example: Close sidebar on mobile chat select
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen  max-h-[99vh]">
      <div className="w-1/4  h-full bg-gray-800 text-white">
        <ChatWindow
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId}
          toggleSidebar={toggleSidebar}
        />
      </div>
      <div className="flex-1  bg-gray-700 text-white">
        {selectedChatId && <ChatDisplay chatId={selectedChatId} />}
        {!selectedChatId && <div className="p-4">Select a chat to view</div>}
      </div>
    </div>
  );
};

const ChatRoutePage = () => {
  const { chatId } = useParams<{ chatId: Id<"userChats"> }>(); // Get chatId from route params

  if (!chatId) {
    return <div>Error: Chat ID not provided in URL</div>;
  }

  return (
    <div className="h-screen bg-gray-700 text-white">
      <ChatDisplay chatId={chatId} /> {/* Render ChatDisplay for the route */}
    </div>
  );
};

const ChatDisplay = ({ chatId }: { chatId: Id<"userChats"> }) => {
  return <Messages chatId={chatId} />;
};
