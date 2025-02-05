"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button"; // Make sure you're importing from the correct path
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const SubmitButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    { className, children, loadingText, isLoading = false, disabled, ...props },
    ref
  ) => {
    return (
      <Button
        className={cn(className)}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? ( // Conditionally render loading state OR children
          <span className="flex flex-row items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {loadingText && <span className="">{loadingText}</span>}
          </span>
        ) : (
          children
        )}
      </Button>
    );
  }
);

SubmitButton.displayName = "SubmitButton";

export default SubmitButton;
