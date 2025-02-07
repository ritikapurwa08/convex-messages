import React from "react"; // Import React
import { useGetMessageReaction } from "@/actions/query/messages/message-query";
import { Id } from "@convex/_generated/dataModel";
import { LoaderIcon } from "lucide-react";

// Expected type of userMessageReaction is Record<Id<"users">, string> | null | undefined
// (or Record<Id<"users">, string> | {} | undefined if considering empty record as {})

const ShowMessageEmojiComponent = ({
  messageId,
}: {
  messageId: Id<"messages">;
}) => {
  // Renamed component
  const userMessageReaction = useGetMessageReaction({
    messageId: messageId,
  });

  if (userMessageReaction === undefined) {
    return (
      <span className="size-8">
        <LoaderIcon className="animate-spin" />
      </span>
    );
  }

  if (!userMessageReaction || Object.keys(userMessageReaction).length === 0) {
    return null; // No reactions to display
  }

  return (
    <div className="flex items-center">
      {Object.values(userMessageReaction).map((reactionPath, index) => (
        <span
          key={`${messageId}-${index}`}
          className="relative -ml-2 first:ml-0"
        >
          <img
            className="size-6 overflow-hidden rounded-full object-cover border-2 border-transparent bg-transparent"
            src={reactionPath}
            alt="Reaction"
            width={32}
            height={32}
          />
        </span>
      ))}
    </div>
  );
};

const ShowMessageEmoji = React.memo(ShowMessageEmojiComponent); // Memoize the component

export default ShowMessageEmoji;
