import { useCallback, useRef, useState } from "react";
import { apiFetchDocumentsPage } from "../api/documents";
import type { DocumentUI } from "../types/documents";
import { isAbortError } from "./useAbortController";

type Deps = {
  namespaceName: string;
  isSearchMode: boolean;
  cursor: string | null;
  listAbortRef: React.MutableRefObject<AbortController | null>;
  newController: (ref: React.MutableRefObject<AbortController | null>) => AbortController;
  applyListData: (data: any) => DocumentUI[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentUI[]>>;
  showToast: (m: string, t?: "error" | "success") => void;
};

export function useDocumentsList({
  namespaceName,
  isSearchMode,
  cursor,
  listAbortRef,
  newController,
  applyListData,
  setDocuments,
  showToast,
}: Deps) {
  const [isListLoading, setIsListLoading] = useState(false);
  const listReqIdRef = useRef(0);

  const loadCurrentPage = useCallback(
    async (cursorOverride?: string | null) => {
      if (isSearchMode) return;

      const reqId = ++listReqIdRef.current;
      const c = newController(listAbortRef);
      setIsListLoading(true);

      const cursorToUse = cursorOverride !== undefined ? cursorOverride : cursor;

      try {
        const data = await apiFetchDocumentsPage(namespaceName, cursorToUse, { signal: c.signal });
        const visible = applyListData(data);
        setDocuments(visible);
      } catch (e: any) {
        if (isAbortError(e)) return;
        console.error(e);
        showToast("fetch documents failed", "error");
      } finally {
        if (listReqIdRef.current === reqId) setIsListLoading(false);
      }
    },
    [
      namespaceName,
      cursor,
      isSearchMode,
      listAbortRef,
      newController,
      applyListData,
      setDocuments,
      showToast,
    ]
  );

  return { isListLoading, loadCurrentPage };
}
