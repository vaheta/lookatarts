import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  return (
    <header className={`text-center py-8 ${className}`}>
      <p className="text-sm text-muted-foreground">lookatarts.com</p>
    </header>
  );
} 