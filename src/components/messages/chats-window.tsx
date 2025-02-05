import { useGetCurrentUser, useGetUserChats } from "@/actions/query/users";
import ChatList from "./chat-list";
import CreatePersonalChatButton from "./create-personal-chat";
import UserLogOutButton from "../users/user-auth/user-logout-button";

const ChatWindow = () => {
  const user = useGetCurrentUser();
  const userId = user?._id;
  const chats = useGetUserChats({ userId });

  return (
    <div className="flex flex-col max-w-7xl mx-auto">
      <div
        id="chat-window-header"
        className="p-2 flex flex-row justify-around mx-auto max-w-7xl "
      >
        <h1 className="text-2xl font-bold">Chats {user?.name}</h1>
      </div>
      <div className="flex flex-row w-full justify-between">
        <CreatePersonalChatButton currentUserId={userId} />
        <div className="w-fit">
          <UserLogOutButton />
        </div>
      </div>
      <div>
        <ChatList chat={chats} />
      </div>
    </div>
  );
};

export default ChatWindow;
