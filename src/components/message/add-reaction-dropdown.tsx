import React, { useState, ChangeEvent } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
// Assuming you renamed addUserReaction to setReaction
import { Id } from "@convex/_generated/dataModel";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SmileIcon } from "lucide-react";

import emojis, { EmojisInterface } from "@/emojis";
import { useAddUserReaction } from "@/actions/mutations/messages/message-mution";

interface AddReactionDropdownProps {
  messageId: Id<"messages">;
}

const AddReactionDropdown: React.FC<AddReactionDropdownProps> = ({
  messageId,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const { mutate: setReactionMutation, isPending: addingReaction } =
    useAddUserReaction(); // Renamed mutate function

  const handleAddReaction = (emoji: EmojisInterface) => {
    setReactionMutation(
      {
        // Renamed mutation call
        messageId,
        reactionPath: emoji.image, // Use emoji.image.src for path
      },
      {
        onSuccess() {
          setOpen(false); // Close dropdown on success
          setSearchQuery(""); // Clear search query
        },
        onError(error: Error) {
          console.error("Failed to add reaction:", error);
          // Handle error feedback to the user if needed
        },
      }
    );
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredEmojis = emojis.filter((emoji) =>
    emoji.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="focus-within:border-none focus-visible:ring-0 focus-visible:border-none"
          variant="ghost"
          size="icon"
          aria-label="Add reaction"
        >
          <SmileIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 p-2">
        <div className="pb-2">
          <Input
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="border rounded-md px-2 py-1 text-sm"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400">
          {filteredEmojis.map((emoji) => (
            <DropdownMenuItem
              key={emoji.id}
              disabled={addingReaction}
              onSelect={() => handleAddReaction(emoji)}
              className="cursor-pointer focus:bg-gray-100 rounded-md p-1"
            >
              <img src={emoji.image} alt={emoji.name} width={24} height={24} />
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddReactionDropdown;
