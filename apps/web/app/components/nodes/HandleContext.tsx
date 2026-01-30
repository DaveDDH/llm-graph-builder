"use client";

import { createContext, useContext } from "react";

interface HandleContextValue {
  onSourceHandleClick?: (
    nodeId: string,
    handleId: string,
    event: React.MouseEvent
  ) => void;
}

export const HandleContext = createContext<HandleContextValue>({});

export function useHandleContext() {
  return useContext(HandleContext);
}
