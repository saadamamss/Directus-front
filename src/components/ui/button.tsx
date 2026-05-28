"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variant === "default" && "bg-primary text-white hover:bg-[#e04342]",
          variant === "outline" && "border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]",
          variant === "ghost" && "text-[#475569] hover:bg-[#F8FAFC]",
          size === "sm" && "h-8 px-3",
          size === "md" && "h-10 px-4 py-2",
          size === "lg" && "h-12 px-6",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
