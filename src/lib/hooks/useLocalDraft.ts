"use client";

import { useCallback, useSyncExternalStore } from "react";

const LOCAL_KEY = "nesto_draft_id";

function subscribe(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === LOCAL_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(LOCAL_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export function useLocalDraft() {
  const draftId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveDraftId = useCallback((id: string) => {
    try {
      localStorage.setItem(LOCAL_KEY, id);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const clearDraftId = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return { draftId, saveDraftId, clearDraftId } as const;
}
