import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-gentle",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-gentle",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-gentle",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-gentle",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Autism-friendly variants
        calm: "bg-calm-blue text-primary-foreground hover:scale-105 shadow-soft transition-all duration-300",
        gentle: "bg-soft-lilac text-secondary-foreground hover:bg-gentle-purple hover:scale-105 shadow-gentle transition-all duration-300",
        large: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft text-lg py-6 px-8 rounded-xl min-h-[60px]",
        icon: "bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-2xl p-6 min-h-[80px] min-w-[80px] flex-col gap-2"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
        "icon-lg": "h-14 w-14 text-lg"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }