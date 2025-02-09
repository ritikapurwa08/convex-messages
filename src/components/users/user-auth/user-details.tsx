import { useGetCurrentUser } from "@/actions/query/users";
import { Skeleton } from "@/components/ui/skeleton";
import UserLogOutButton from "./user-logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserDetails = () => {
  const user = useGetCurrentUser();
  const isLoading = user === undefined;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>; // Or handle no user case as needed
  }

  return (
    <div className="p-4 flex flex-row space-y-4">
      <div className="flex items-center justify-between w-full space-x-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.customImage} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground dark:text-card-foreground">
            {user.name}
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {user.email}
          </p>
        </div>
        <UserLogOutButton />
      </div>
    </div>
  );
};

export default UserDetails;
