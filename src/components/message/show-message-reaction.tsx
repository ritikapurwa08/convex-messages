// Corrected import name to getMessageReactions
import { useGetMessageReaction } from "@/actions/query/messages/message-query";
import { Id } from "@convex/_generated/dataModel";
import { LoaderIcon } from "lucide-react";
// Import Image component

// Expected type of userMessageReaction is Record<Id<"users">, string> | null | undefined
// (or Record<Id<"users">, string> | {} | undefined if considering empty record as {})

const ShowMessageEmoji = ({ messageId }: { messageId: Id<"messages"> }) => {
  const userMessageReaction = useGetMessageReaction({
    // Corrected hook name to useGetMessageReactions
    messageId: messageId,
  });

  if (userMessageReaction === undefined) {
    return (
      <span className="size-8">
        <LoaderIcon className="animate-spin" />{" "}
        {/* Added animation to LoaderIcon for better UX */}
      </span>
    );
  }

  if (!userMessageReaction || Object.keys(userMessageReaction).length === 0) {
    // Check if reaction is null or empty object
    return null; // No reactions to display
  }

  return (
    <div className="flex items-center">
      {" "}
      {/* Added flex for horizontal alignment of reactions */}
      {Object.values(userMessageReaction).map(
        (
          reactionPath,
          index // Iterate over record values (reaction paths)
        ) => (
          <span
            key={`${messageId}-${index}`}
            className="relative -ml-2 first:ml-0"
          >
            {" "}
            {/* Added key and slight negative margin for overlapping */}
            <img
              className="size-6 overflow-hidden rounded-full object-cover border-2 border-transparent bg-transparent" // Added white border and background for better visual separation
              src={reactionPath}
              alt="Reaction"
              width={32} // Explicit width and height for Image component
              height={32}
              // Optional: If reactions are important for initial render
            />
          </span>
        )
      )}
    </div>
  );
};

export default ShowMessageEmoji;
