"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type RentStepperUiContextValue = {
  /** When true, hide editable address on Property Info (e.g. Save & Exit after createDraft would otherwise flash fields). */
  suppressPropertyInfoAddress: boolean;
  setSuppressPropertyInfoAddress: (v: boolean) => void;
};

const RentStepperUiContext = createContext<RentStepperUiContextValue | null>(
  null
);

export function RentStepperUiProvider({ children }: { children: ReactNode }) {
  const [suppressPropertyInfoAddress, setSuppressPropertyInfoAddress] =
    useState(false);
  const value = useMemo(
    () => ({
      suppressPropertyInfoAddress,
      setSuppressPropertyInfoAddress,
    }),
    [suppressPropertyInfoAddress]
  );
  return (
    <RentStepperUiContext.Provider value={value}>
      {children}
    </RentStepperUiContext.Provider>
  );
}

export function useRentStepperUiOptional() {
  return useContext(RentStepperUiContext);
}
