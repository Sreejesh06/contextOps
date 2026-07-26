"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SoftPillButtonVariant = "light" | "dark";
export type SoftPillButtonSize = "sm" | "md" | "lg";

export type SoftPillButtonProps = Readonly<
  {
    children: ReactNode;
    variant?: SoftPillButtonVariant;
    size?: SoftPillButtonSize;
  } & ComponentPropsWithoutRef<"button">
>;

const SIZE: Record<SoftPillButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-xs font-bold",
  md: "h-10 gap-2 rounded-lg px-4 text-sm font-bold",
  lg: "h-12 gap-2 rounded-xl px-5 text-sm font-bold",
};

export const SoftPillButton = forwardRef<HTMLButtonElement, SoftPillButtonProps>(
  ({ className, children, variant = "dark", size = "sm", type = "button", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center select-none",
          "transition-[background-color,box-shadow,color,transform] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "active:scale-95",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
          SIZE[size],
          className,
        )}
        style={{
          background: variant === "dark" ? "var(--ink)" : "var(--bg-sunken)",
          color: variant === "dark" ? "var(--bg-base)" : "var(--ink)",
          border: variant === "light" ? "1px solid var(--border-subtle)" : "none",
          boxShadow: variant === "dark" 
            ? "0 2px 4px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.25)" 
            : "0 2px 4px rgba(0,0,0,0.06)",
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);

SoftPillButton.displayName = "SoftPillButton";
