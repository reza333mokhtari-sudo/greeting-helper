import * as React from "react";
import { AppDialog } from "./AppDialog";

interface DialogProviderProps {
  children: React.ReactNode;
}

export function DialogProvider({ children }: DialogProviderProps) {
  return (
    <>
      {children}
      <AppDialog />
    </>
  );
}
