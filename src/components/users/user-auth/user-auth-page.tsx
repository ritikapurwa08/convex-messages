import { useState } from "react";
import UserSignIn from "./user-sign-in";
import UserSignUp from "./user-sign-up";

const UserAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
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
