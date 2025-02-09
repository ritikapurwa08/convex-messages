import { Id } from "@convex/_generated/dataModel";
import { useParams } from "react-router-dom";
import Messages from "../message/messages";

export const ChatRoutePage = () => {
  const { chatId } = useParams<{ chatId: Id<"userChats"> }>();

  if (!chatId) {
    return <div>Error: Chat ID not provided in URL</div>;
  }

  return <ChatDisplay chatId={chatId} />;
};

const ChatDisplay = ({ chatId }: { chatId: Id<"userChats"> }) => {
  return <Messages chatId={chatId} />;
};
