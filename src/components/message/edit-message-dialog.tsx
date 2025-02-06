import { MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogDescription,
} from "../ui/alert-dialog";

const EditMessageDialog = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <MoreHorizontal />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to edit this message?
          </AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditMessageDialog;
