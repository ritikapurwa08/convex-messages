import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { LoaderIcon, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const UserLogOutButton = () => {
  const { signOut } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const handleLogout = () => {
    setIsLoading(true);
    signOut()
      .then(() => {
        navigate("/sign-in");
        toast({
          title: "Logout successful",
          description: "You have been logged out successfully.",
          duration: 3000,
        });
      })
      .catch(() => {
        toast({
          title: "Logout failed",
          description: "An error occurred while logging out.",
          duration: 3000,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="destructive" // You can change this to "secondary", "ghost", etc.
      size="icon"
    >
      {isLoading ? (
        <>
          <LoaderIcon className=" h-4 w-4 animate-spin" />
        </>
      ) : (
        <>
          <LogOut className=" h-4 w-4" />
        </>
      )}
    </Button>
  );
};

export default UserLogOutButton;
