import { createContext, useContext, useEffect, useState } from "react";

interface DesktopContextType {
  isDesktop: boolean;
}

const DesktopContext = createContext<DesktopContextType>({ isDesktop: false });

export function DesktopProvider({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Tauri sets __TAURI_METADATA__ or other window properties
    if (typeof window !== "undefined" && ((window as any).__TAURI_METADATA__ || (window as any).__TAURI_INTERNALS__)) {
      setIsDesktop(true);
    }
  }, []);

  return (
    <DesktopContext.Provider value={{ isDesktop }}>
      {children}
    </DesktopContext.Provider>
  );
}

export const useDesktop = () => useContext(DesktopContext);
