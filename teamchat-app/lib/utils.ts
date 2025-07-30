import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "@/hooks/use-toast"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to show auto-dismissing toast with custom styling
export function showToast(description: string, title?: string, variant: "default" | "destructive" | "success" = "default") {
  // Get appropriate icon and styling based on variant
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✅'; // Success checkmark
      case 'destructive':
        return '❌'; // Error X
      default:
        return 'ℹ️'; // Info icon
    }
  }

  const icon = getIcon();
  const finalDescription = `${icon} ${description}`;

  const toastRef = toast({
    title,
    description: finalDescription,
    variant: variant === "success" ? "default" : (variant as "default" | "destructive"),
    duration: 3000, // Auto dismiss after 3 seconds
    className: variant === "success"
      ? "border-green-500/50 bg-gradient-to-r from-green-500/95 to-green-600/95 text-white shadow-xl backdrop-blur-sm"
      : variant === "destructive"
        ? "border-red-500/50 bg-gradient-to-r from-red-500/95 to-red-600/95 text-white shadow-xl backdrop-blur-sm"
        : "border-blue-500/50 bg-gradient-to-r from-blue-500/95 to-blue-600/95 text-white shadow-xl backdrop-blur-sm",
  })

  return toastRef
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days} ngày trước`
  if (hours > 0) return `${hours} giờ trước`
  if (minutes > 0) return `${minutes} phút trước`
  return "Vừa xong"
}
