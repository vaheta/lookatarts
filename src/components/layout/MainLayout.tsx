import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
  hideHeaderFooter?: boolean;
}

export function MainLayout({ children, hideHeaderFooter = false }: MainLayoutProps) {
  return (
    <div className="real-h-screen flex flex-col bg-white text-black">
      {/* Render header if not hidden */}
      {!hideHeaderFooter && <Header />}

      {/* Main Content area */}
      <main className="flex-1 flex flex-col items-stretch">
        {children}
      </main>

      {/* Render footer if not hidden */}
      {!hideHeaderFooter && <Footer />}
    </div>
  );
} 