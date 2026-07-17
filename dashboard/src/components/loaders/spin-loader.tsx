import { Loader } from "lucide-react";
import { cn } from "@/lib/cn";

interface SpinLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  iconClassName?: string;
  icon?: any;
}

export function SpinLoader({ size = "md", className, iconClassName, icon: Icon = Loader }: SpinLoaderProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Icon
        size={sizeMap[size]}
        className={cn("animate-spin", iconClassName)}
      />
    </div>
  );
}
