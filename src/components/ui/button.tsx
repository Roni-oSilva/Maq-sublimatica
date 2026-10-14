import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition disabled:pointer-events-none disabled:opacity-50 active:scale-[.98]",
  {
    variants: {
      variant: {
        primary: "bg-brand text-ink shadow-sm hover:bg-[#ff6a38]",
        dark: "bg-ink text-white hover:bg-ink-soft",
        whatsapp: "bg-[#128c4a] text-white shadow-sm hover:bg-[#0e7a3f]",
        outline: "border border-line bg-white text-ink hover:border-ink/30 hover:bg-paper",
        ghost: "text-ink hover:bg-ink/5",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: { sm: "h-9 px-3", md: "h-11 px-5", lg: "h-12 px-7 text-base", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
