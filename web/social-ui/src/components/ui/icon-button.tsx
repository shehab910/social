import { type LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "./button";
import { VariantProps } from "class-variance-authority";

interface IconButtonProps {
  Icon: LucideIcon;
  text: string;
}

export default function IconButton({
  Icon,
  text,
  ...props
}: IconButtonProps &
  React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  return (
    <>
      <Button size="sm" className="hidden md:flex" {...props}>
        <Icon size={16} aria-hidden="true" />
        <span>{text}</span>
      </Button>
      <Button size="icon" variant="default" className="md:hidden">
        <Icon size={16} aria-hidden="true" />
        <span className="sr-only">{text}</span>
      </Button>
    </>
  );
}
