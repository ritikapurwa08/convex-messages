import { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Id } from "@convex/_generated/dataModel";
import { LucideIcon, User2Icon } from "lucide-react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface AvatarImageType {
  id: number;
  name: string;
  image: string;
}

interface AvatarSelectDialogProps<T extends FieldValues> {
  avatars: AvatarImageType[];
  userId: Id<"users"> | undefined;
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  icon?: LucideIcon;
  error?: string;
  iconClassName?: string;
  labelClassName?: string;
  selectedAvatar: AvatarImageType | null;
  setSelectedAvatar: React.Dispatch<
    React.SetStateAction<AvatarImageType | null>
  >;
}

const AvatarSelectDialog = <T extends FieldValues>({
  avatars,
  control,
  name,
  label,
  error,
  labelClassName,
  selectedAvatar,
  setSelectedAvatar,
}: AvatarSelectDialogProps<T>) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    field,
    fieldState: { error: fieldError },
  } = useController({ name, control });

  // Use your custom mutation hook

  // Debounce the search input by 300ms
  const [debouncedSearch] = useDebounce(search, 300);

  // Filter avatars based on the debounced search input
  const filteredAvatars = useMemo(() => {
    return avatars.filter((avatar) =>
      avatar.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [avatars, debouncedSearch]);

  const handleSelectAvatar = async (avatar: AvatarImageType) => {
    setSelectedAvatar(avatar);
    field.onChange(avatar.image); // Update form value

    // Call the updateUserAvatar mutation to update the database

    setOpen(false);
    setSearch(""); // Reset search after selection
  };

  return (
    <FormItem className="relative flex flex-col gap-y-0.5">
      <FormLabel className={cn("text-pink-400", labelClassName)}>
        {label}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="w-full">
                {selectedAvatar ? (
                  <Button
                    variant="outline"
                    className="size-20 p-0.5 m-0.5 rounded-full justify-center items-center"
                  >
                    <img
                      src={selectedAvatar.image}
                      className="size-full rounded-full object-cover"
                      alt=""
                    />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="default"
                    className="flex size-20 rounded-full justify-center items-center"
                  >
                    <User2Icon className="size-5" />
                  </Button>
                )}
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Select an Avatar</DialogTitle>
              <DialogDescription>
                Search and pick your favorite profile image.
              </DialogDescription>
              <div className="my-4">
                <Input
                  placeholder="Search avatars..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 overflow-y-auto max-h-[50vh] min-h-[50vh] space-x-2">
                {filteredAvatars.length > 0 ? (
                  filteredAvatars.map((avatar) => (
                    <Button
                      key={avatar.id}
                      variant="ghost"
                      onClick={() => handleSelectAvatar(avatar)}
                      className="flex flex-col size-24 items-center p-1"
                    >
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <span className="text-xs mt-1">{avatar.name}</span>
                    </Button>
                  ))
                ) : (
                  <p className="col-span-3 text-center text-sm text-gray-500">
                    No avatars found.
                  </p>
                )}
              </div>
              <DialogClose asChild>
                <Button variant="outline" className="mt-4">
                  Close
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      </FormControl>

      {/* Error Messages */}
      {(error || fieldError?.message) && (
        <FormMessage className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 animate-slideDown">
          {error || fieldError?.message}
        </FormMessage>
      )}
    </FormItem>
  );
};

export default AvatarSelectDialog;
