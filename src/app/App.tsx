import ChatWindow from "@/components/messages/chats-window";
import Messages from "@/components/messages/messages";
import { ThemeProvider } from "@/components/ui/theme-provider";
import UserAuthPage from "@/components/users/user-auth/user-auth-page";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

const App = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();
  const pathName = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/sign-in");
    } else if (
      isAuthenticated &&
      !isLoading &&
      pathName.pathname === "/sign-in"
    ) {
      navigate("/");
    }
  }, [navigate, pathName, isAuthenticated, isLoading]);
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<ChatWindow />} />
        <Route path="/message/:chatId" element={<Messages />} />
        <Route path="/sign-in" element={<UserAuthPage />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
