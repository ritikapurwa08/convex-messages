import { LoaderIcon, LucideIcon, SendIcon } from "lucide-react";
import { IconType } from "react-icons";
import {
  Control,
  FieldPath,
  FieldValues,
  PathValue,
  useController,
} from "react-hook-form";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import SubmitButton from "./submit-button";

interface CustomInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  sendingMsg: boolean;
  description?: string;
  placeholder?: string;
  icon?: IconType | LucideIcon;
  disabled?: boolean;
  className?: string;
  error?: string;
  iconSrc?: string;
  defaultValue?: PathValue<T, FieldPath<T>>;
  iconClassName?: string;
  labelClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export default function CustomMessageInput<T extends FieldValues>({
  name,
  className,
  error,
  disabled,
  control,
  onChange,
  defaultValue,
  sendingMsg,
}: Readonly<CustomInputProps<T>>) {
  const {
    field,
    fieldState: { error: fieldError },
  } = useController({ name, control, defaultValue });

  return (
    <FormItem className=" w-full">
      {(error || fieldError?.message) && (
        <FormMessage className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 animate-slideDown">
          {error || fieldError?.message}
        </FormMessage>
      )}
      <FormControl className=" ">
        <div className="relative w-full min-w-full">
          <Input
            id={`${name}-input`}
            {...field}
            disabled={disabled}
            className={cn(
              " max-w-5xl w-full min-w-full   ",

              className
            )}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e);
            }}
          />

          <SubmitButton
            className="absolute top-0  right-0"
            variant="outline"
            size="icon"
            isLoading={sendingMsg}
          >
            {sendingMsg ? (
              <span>
                <LoaderIcon className="animate-spin" />
              </span>
            ) : (
              <span>
                <SendIcon />
              </span>
            )}
          </SubmitButton>
        </div>
      </FormControl>
    </FormItem>
  );
}
