import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import AppDrawer from "./AppDrawer";

interface DrawerContextType {
  open: () => void;
  close: () => void;
}

const DrawerContext = createContext<DrawerContextType>({ open: () => {}, close: () => {} });

export const useDrawer = () => useContext(DrawerContext);

// Holds the drawer's open state and renders the drawer over its children.
export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <DrawerContext.Provider value={value}>
      {children}
      <AppDrawer visible={visible} onClose={close} />
    </DrawerContext.Provider>
  );
}
