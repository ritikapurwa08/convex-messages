import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";
import {
  Control,
  FieldPath,
  FieldValues,
  PathValue,
  useController,
} from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CustomInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
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

export default function CustomInput<T extends FieldValues>({
  name,
  className,
  error,
  icon: Icon,
  disabled,
  label,
  control,
  onChange,
  iconSrc,
  defaultValue,
}: Readonly<CustomInputProps<T>>) {
  const {
    field,
    fieldState: { error: fieldError },
  } = useController({ name, control, defaultValue });

  return (
    <FormItem className="relative flex flex-col gap-y-0.5">
      <FormLabel className="text-pink-400">{label}</FormLabel>
      <FormControl>
        <div className="relative">
          {(Icon || iconSrc) && (
            <div className="absolute left-3 top-1/2 pl-2 -translate-y-1/2">
              {Icon && <Icon className="text-pink-400" size={20} />}
              {iconSrc && (
                <img src={iconSrc} height={20} width={20} alt="Field icon" />
              )}
            </div>
          )}
          <Input
            id={`${name}-input`}
            {...field}
            disabled={disabled}
            placeholder={label}
            className={cn(
              " border-pink-500 input focus:border-none transition-all duration-300 ease-in-out focus-visible:ring-pink-500 focus-visible:ring-1  autofill-bg-transparent ",

              Icon || iconSrc ? "pl-10" : "pl-2",
              className
            )}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e);
            }}
          />
        </div>
      </FormControl>
      {(error || fieldError?.message) && (
        <FormMessage className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 animate-slideDown">
          {error || fieldError?.message}
        </FormMessage>
      )}
    </FormItem>
  );
}
