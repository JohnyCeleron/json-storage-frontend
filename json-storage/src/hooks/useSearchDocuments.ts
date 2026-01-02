import { useCallback, useRef, useState } from "react";
import { apiSearchObjects } from "../api/documents";
import { mapSearchItemToUI } from "../utils/documents";
import type { DocumentUI } from "../types/documents";

export function useSearchDocuments(namespaceName: string) {
  const [isSearching, setIsSearching] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(async (filters: string): Promise<DocumentUI[]> => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsSearching(true);
    try {
      const result = await apiSearchObjects(namespaceName, filters, { signal: controller.signal });
      return (result ?? [])
        .map(mapSearchItemToUI)
        .filter((d): d is DocumentUI => Boolean(d?.id));
    } finally {
      setIsSearching(false);
    }
  }, [namespaceName]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return { isSearching, runSearch, cancel };
}
