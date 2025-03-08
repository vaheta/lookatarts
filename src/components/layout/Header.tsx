interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  return (
    <header className={`text-center py-8 ${className}`}>
      <p className="text-sm text-gray-500">lookatarts.com</p>
    </header>
  );
} 