import { useUI } from "@/contexts/UIContext";
import { Header } from "./Header";
import React, { ReactNode } from "react";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
  hideHeaderFooter?: boolean;
}

export function MainLayout({ children, hideHeaderFooter = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
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