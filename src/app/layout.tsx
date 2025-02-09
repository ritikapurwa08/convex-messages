import { ChatRoutePage } from "@/components/chat/chat-route-page";
import UserAuthPage from "@/components/users/user-auth/user-auth-page";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

export const RootLayout = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Routes>
      <Route path="/sign-in" element={<UserAuthPage />} />
      <Route path="/chat/:chatId" element={<ChatRoutePage />} />   {" "}
    </Routes>
  );
};
