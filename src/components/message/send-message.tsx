import { Id } from "@convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "../ui/form";
import { useEffect, useState } from "react";
import CustomMessageInput from "../ui/custom-message-input";
import { useSendMessage } from "@/actions/mutations/messages/message-mution";

interface SendMessageProps {
  chatId: Id<"userChats"> | undefined;
  senderId: Id<"users"> | undefined;
  existingMessage?: string;
  setExistingMessage?: (msg: string) => void;
}

interface SendMessageProps {
  chatId: Id<"userChats"> | undefined;
  senderId: Id<"users"> | undefined;
  existingMessage?: string;
  setExistingMessage?: (msg: string) => void;
  onKeyboardStatusChange?: (isKeyboardVisible: boolean) => void; // Add this prop to receive keyboard status
}

const SendMessage = ({
  chatId,
  senderId,
  existingMessage,
  onKeyboardStatusChange, // Destructure the prop
}: SendMessageProps) => {
  const { mutate: sendMsg, isPending: sendingMsg } = useSendMessage();
  const [error, setError] = useState<string | undefined>(undefined);

  const isKeyboardVisible = useKeyboardVisibility(); // Get the keyboard visibility status

  // Call the parent callback whenever the keyboard status changes
  useEffect(() => {
    if (onKeyboardStatusChange) {
      onKeyboardStatusChange(isKeyboardVisible);
    }
  }, [isKeyboardVisible, onKeyboardStatusChange]);

  const handleSendMessage = () => {
    setError(undefined);
    if (chatId && senderId) {
      sendMsg(
        { chatId, senderId, message: form.getValues("message") },
        {
          onSuccess() {
            form.reset();
          },
          onError(error) {
            setError(error.message);
          },
        }
      );
    }
  };

  const form = useForm<{ message: string }>({
    resolver: zodResolver(
      z.object({
        message: z.string().min(1, { message: "Message is required" }),
      })
    ),
    defaultValues: {
      message: existingMessage || "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSendMessage)}
        className="flex w-full gap-2"
      >
        {error && <p className="text-red-500">{error}</p>}
        <CustomMessageInput
          control={form.control}
          name="message"
          sendingMsg={sendingMsg}
          placeholder="Message"
        />
      </form>
    </Form>
  );
};

export default SendMessage;

const useKeyboardVisibility = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const onFocus = () => setIsKeyboardVisible(true);
    const onBlur = () => setIsKeyboardVisible(false);

    window.addEventListener("focusin", onFocus);
    window.addEventListener("focusout", onBlur);

    return () => {
      window.removeEventListener("focusin", onFocus);
      window.removeEventListener("focusout", onBlur);
    };
  }, []);

  return isKeyboardVisible;
};
