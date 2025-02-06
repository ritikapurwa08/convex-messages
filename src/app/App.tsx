import ChatWindow from "@/components/chat/chats-window";
import Messages from "@/components/message/messages";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Id } from "@convex/_generated/dataModel"; // Import Id
import UserAuthPage from "@/components/users/user-auth/user-auth-page";
import { cn } from "@/lib/utils";

const App = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(
    null
  ); // State for selected chat
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/sign-in");
    } else if (
      isAuthenticated &&
      !isLoading &&
      location.pathname === "/sign-in"
    ) {
      navigate("/");
    }
    // Set selected chat ID from URL if it exists
    const chatIdFromUrl = location.pathname.startsWith("/message/")
      ? (location.pathname.substring("/message/".length) as Id<"chats">)
      : null;
    setSelectedChatId(chatIdFromUrl); // Update selectedChatId
  }, [navigate, location, isAuthenticated, isLoading]);

  const handleChatSelect = (chatId: Id<"chats">) => {
    setSelectedChatId(chatId);
    navigate(`/message/${chatId}`); // Update URL when a chat is selected
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/sign-in" element={<UserAuthPage />} />
      </Routes>
      <div
        className={cn(
          "flex h-screen bg-background",
          !isAuthenticated && "hidden"
        )}
      >
        <aside
          className={`w-full md:w-80 lg:w-1/4 transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } bg-gray-800`}
        >
          <ChatWindow
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChatId}
            toggleSidebar={toggleSidebar}
          />
        </aside>

        <main className="flex-1 overflow-y-auto min-w-0 lg:flex">
          <div className="lg:w-3/4 overflow-y-auto">
            {selectedChatId && <Messages chatId={selectedChatId} />}{" "}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
