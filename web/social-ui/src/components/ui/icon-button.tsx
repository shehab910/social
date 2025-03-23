import { type LucideIcon } from "lucide-react";
import { Button } from "./button";

interface IconButtonProps {
  Icon: LucideIcon;
  text: string;
}

export default function IconButton({ Icon, text }: IconButtonProps) {
  return (
    <>
      <Button size="sm" className="hidden md:flex">
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
