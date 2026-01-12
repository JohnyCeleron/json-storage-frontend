import { useCallback, useEffect, useRef, useState } from "react";
import { PAGINATION } from "../constants/ui";
import { apiFetchDocumentsPage } from "../api/documents";
import { mapApiToUI } from "../utils/documents";
import type { DocumentUI } from "../types/documents";

export function useDocumentsList(namespaceName: string, cursor: string | null, enabled: boolean) {
  const [documents, setDocuments] = useState<DocumentUI[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isListLoading, setIsListLoading] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);

  const applyPageData = useCallback((data: { items: any[]; count: number }) => {
    const all = (data.items ?? []).map(mapApiToUI);

    const hasNextPage = all.length > PAGINATION.PAGE_SIZE;
    const computedNextCursor = hasNextPage ? all[all.length - 1].id : null;

    const visible = all.slice(0, PAGINATION.PAGE_SIZE);

    return { visible, hasNextPage, computedNextCursor, count: data.count ?? 0 };
  }, []);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsListLoading(true);
    try {
      const data = await apiFetchDocumentsPage(namespaceName, cursor, { signal: controller.signal });
      const mapped = applyPageData(data);

      setDocuments(mapped.visible);
      setTotalCount(mapped.count);

      return { hasNext: mapped.hasNextPage, nextCursor: mapped.computedNextCursor };
    } finally {
      setIsListLoading(false);
    }
  }, [namespaceName, cursor, applyPageData]);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    void (async () => {
      try {
        await load();
      } catch (e: any) {
        if (!mounted) return;
        if (e?.name === "AbortError") return;
        throw e;
      }
    })();

    return () => {
      mounted = false;
      controllerRef.current?.abort();
    };
  }, [enabled, load]);

  const reset = useCallback(() => {
    setDocuments([]);
    setTotalCount(0);
  }, []);

  return { documents, setDocuments, totalCount, isListLoading, load, reset };
}
