import { ReactNode } from "react";
import { MeditationProvider } from "@/contexts/MeditationContext";
import { UIProvider } from "@/contexts/UIContext";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MeditationProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </MeditationProvider>
  );
} 