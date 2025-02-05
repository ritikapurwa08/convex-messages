import React from "react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface CustomPasswordInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  icon?: LucideIcon;
  showPassword?: boolean;
  setShowPassword?: (showPassword: boolean) => void;
  iconClassName?: string;
  labelClassName?: string;
}

const CustomPasswordInput = <T extends FieldValues>({
  control,
  name,
  label,
  disabled,
  className,
  error,
  onChange,
  showPassword,
  icon: Icon,
  placeholder,
}: CustomPasswordInputProps<T>) => {
  const {
    field,
    fieldState: { error: fieldError },
  } = useController({ name, control });

  return (
    <FormItem className="relative flex flex-col gap-y-0.5">
      <FormControl className="m-0 p-0">
        <div className="">
          <div id="label-container">
            <div id="label-input-container">
              <FormLabel htmlFor={`${name}-input`} className="text-pink-400">
                {label}
              </FormLabel>
            </div>

            <div id="icon-input-container" className="relative">
              <div id="icon-container">
                {Icon && (
                  <div className="absolute flex justify-center items-center top-1/2 transform -translate-y-1/2 w-10">
                    <Icon className={cn("text-pink-400/60 size-5")} />
                  </div>
                )}
              </div>

              <div id="input-container">
                <Input
                  id={`${name}-input`}
                  type={showPassword ? "text" : "password"}
                  placeholder={placeholder}
                  {...field}
                  disabled={disabled}
                  className={cn(
                    " border-pink-500 focus:border-none transition-all duration-300 ease-in-out focus-visible:ring-pink-500 focus-visible:ring-1  autofill-bg-transparent ",

                    Icon ? "pl-10" : "pl-2",
                    className
                  )}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange?.(e);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </FormControl>

      <FormMessage className="m-0 -mb-4 p-0 text-xs text-red-600">
        {(error || fieldError?.message) && (
          <span>{error || fieldError?.message}</span>
        )}
      </FormMessage>
    </FormItem>
  );
};

export default CustomPasswordInput;
