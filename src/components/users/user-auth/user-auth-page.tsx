import { useEffect, useState } from "react";
import UserSignIn from "./user-sign-in";
import UserSignUp from "./user-sign-up";
import { useGetCurrentUser, useGetUserChats } from "@/actions/query/users";
import { useNavigate } from "react-router-dom";

const UserAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const user = useGetCurrentUser();
  const userId = user?._id;
  const userChats = useGetUserChats({ userId });
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userId && userChats) {
      navigate(`/chat/${userChats[0]._id}`);
    }
  }, [user, userId, userChats, navigate]);
  return (
    <main className="flex flex-col space-y-3 max-w-xl mx-auto h-full py-10 min-h-[calc(80vh-64px)]">
      <section className="h-full px-6 lg:px-10 ">
        {isLogin ? (
          <UserSignIn setIsLogin={setIsLogin} isLogin={isLogin} />
        ) : (
          <UserSignUp setIsLogin={setIsLogin} isLogin={isLogin} />
        )}
      </section>
    </main>
  );
};

export default UserAuthPage;
