"use client";

import { forwardRef, useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type ComponentPropsWithoutRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type SearchInputProps = Readonly<{
  containerClassName?: string;
  onClear?: () => void;
} & Omit<ComponentPropsWithoutRef<"input">, "size" | "type" | "onChange">> & {
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, id, disabled, value, defaultValue = "", placeholder = "Search…", onChange, onClear, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const localRef = useRef<HTMLInputElement | null>(null);

    const isControlled = value !== undefined;
    const [internal, setInternal] = useState(String(defaultValue));
    const current = isControlled ? String(value) : internal;
    const hasValue = current.length > 0;

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      if (!isControlled) setInternal(next);
      onChange?.(next, event);
    }, [isControlled, onChange]);

    const handleClear = useCallback(() => {
      if (!isControlled) setInternal("");
      onClear?.();
      localRef.current?.focus();
    }, [isControlled, onClear]);

    const setRefs = useCallback((node: HTMLInputElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }, [ref]);

    return (
      <div className={cn("w-full max-w-sm font-sans", containerClassName)}>
        <div className="relative">
          <Search size={14} aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" style={{ color: "var(--ink-muted)" }} />
          <input
            ref={setRefs}
            id={inputId}
            type="search"
            disabled={disabled}
            value={current}
            placeholder={placeholder}
            onChange={handleChange}
            className={cn(
              "w-full rounded-lg py-2 pl-9 pr-8 text-sm outline-none transition-colors duration-200",
              "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
              className
            )}
            style={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-subtle)",
              color: "var(--ink)",
            }}
            {...props}
          />
          {hasValue && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md transition-colors"
              style={{ color: "var(--ink-muted)" }}
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          ) : null}
        </div>
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
