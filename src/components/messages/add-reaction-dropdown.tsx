import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";

import { SmileIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAddUserReaction } from "@/actions/mutations/messages";
import { useGetMessageReaction } from "@/actions/query/messages/message-query";
interface MessageReactionProps {
  messageId: Id<"messages">;
  userId: Id<"users"> | undefined;
}

const reactionEmojis = {
  like: { emoji: "👍", label: "Like" },
  love: { emoji: "❤️", label: "Love" },
  haha: { emoji: "😄", label: "Haha" },
  sad: { emoji: "😢", label: "Sad" },
  angry: { emoji: "😠", label: "Angry" },
  wow: { emoji: "😮", label: "Wow" },
} as const;

const AddMessageReaction = ({ messageId, userId }: MessageReactionProps) => {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const { mutate: addReaction } = useAddUserReaction();
  const userMessageReaction = useGetMessageReaction({ messageId });

  const handleReactionClick = (
    reaction: "like" | "love" | "haha" | "sad" | "angry" | "wow"
  ) => {
    if (selectedReaction === reaction) {
      setSelectedReaction(null);
    } else {
      setSelectedReaction(reaction);
      if (userId) {
        addReaction({ messageId, userId, reaction });
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Display existing reactions */}
      <div className="flex -space-x-1">
        {userMessageReaction?.map((reaction, index) => (
          <div
            key={`${reaction.userId}-${index}`}
            className="inline-flex items-center justify-center size-6  rounded-full shadow-sm border"
          >
            {reactionEmojis[reaction.reaction].emoji}
          </div>
        ))}
      </div>

      {/* Reaction picker dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="hover:bg-black/20 p-2 rounded-full">
          {userMessageReaction?.length ? (
            <div className="w-5 h-5 flex items-center justify-center">
              {reactionEmojis[userMessageReaction[0].reaction].emoji}
            </div>
          ) : (
            <SmileIcon className="w-5 h-5 text-muted-foreground" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="right"
          className="grid grid-cols-6 "
        >
          {Object.entries(reactionEmojis).map(([key, { emoji }]) => (
            <DropdownMenuItem
              key={key}
              onClick={() =>
                handleReactionClick(key as keyof typeof reactionEmojis)
              }
              className="flex flex-col items-center justify-center p-2 hover:bg-black/20 cursor-pointer"
            >
              <span className="text-xl">{emoji}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AddMessageReaction;
