import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Noise } from "../ui/Noise";
import { DEFAULT_NOISE_CONFIG } from "../../constants/noise";

interface MainLayoutProps {
  children: ReactNode;
  hideHeaderFooter?: boolean;
  // Only keep the enabled flag
  noiseEnabled?: boolean;
}

export function MainLayout({ 
  children, 
  hideHeaderFooter = false,
  noiseEnabled = DEFAULT_NOISE_CONFIG.enabled,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-stone-50 to-stone-200 text-black relative">
      {/* Noise background - simplified */}
      {noiseEnabled && <Noise />}
      
      {/* Render header if not hidden */}
      {!hideHeaderFooter && <Header />}

      {/* Main Content area */}
      <main className="flex-1 flex flex-col items-stretch relative">
        {children}
      </main>

      {/* Render footer if not hidden */}
      {!hideHeaderFooter && <Footer />}
    </div>
  );
} 