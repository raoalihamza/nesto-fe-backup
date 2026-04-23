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
  /**
   * When true, Rent details step blocks Next until invalid non-empty money
   * inputs are cleared or corrected.
   */
  rentDetailsNextBlocked: boolean;
  setRentDetailsNextBlocked: (v: boolean) => void;
};

const RentStepperUiContext = createContext<RentStepperUiContextValue | null>(
  null
);

export function RentStepperUiProvider({ children }: { children: ReactNode }) {
  const [suppressPropertyInfoAddress, setSuppressPropertyInfoAddress] =
    useState(false);
  const [rentDetailsNextBlocked, setRentDetailsNextBlocked] = useState(false);
  const value = useMemo(
    () => ({
      suppressPropertyInfoAddress,
      setSuppressPropertyInfoAddress,
      rentDetailsNextBlocked,
      setRentDetailsNextBlocked,
    }),
    [suppressPropertyInfoAddress, rentDetailsNextBlocked]
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
