import { useCallback } from "react";
import { apiDeleteDocument } from "../api/documents";
import { PAGINATION } from "../constants/ui";
import { isAbortError } from "./useAbortController";
import type { DocumentUI } from "../types/documents";

type Deps = {
  namespaceName: string;
  mutAbortRef: React.MutableRefObject<AbortController | null>;
  newController: (ref: React.MutableRefObject<AbortController | null>) => AbortController;

  showToast: (m: string, t?: "error" | "success") => void;

  isSearchMode: boolean;
  paginationType: "offset" | "cursor";
  currentOffset: number;
  setCurrentOffset: React.Dispatch<React.SetStateAction<number>>;

  documents: DocumentUI[];
  cursor: string | null;
  cursorStack: (string | null)[];
  setCursor: (c: string | null) => void;
  setCursorStack: (s: (string | null)[]) => void;

  setSearchAll: React.Dispatch<React.SetStateAction<DocumentUI[]>>;

  loadCurrentPage: (cursorOverride?: string | null) => Promise<void>;
};

export function useDocumentDelete({
  namespaceName,
  mutAbortRef,
  newController,
  showToast,
  isSearchMode,
  paginationType,
  currentOffset,
  setCurrentOffset,
  documents,
  cursor,
  cursorStack,
  setCursor,
  setCursorStack,
  setSearchAll,
  loadCurrentPage
}: Deps) {
  const deleteDoc = useCallback(
    async (docId: string) => {
      const c = newController(mutAbortRef);

      try {
        await apiDeleteDocument(namespaceName, docId, { signal: c.signal });
        showToast("Document removed", "success");

        if (isSearchMode && paginationType === "offset") {
          setSearchAll((prev) => {
            const next = prev.filter((d) => d.id !== docId);

            const pageSize = PAGINATION.PAGE_SIZE;
            const maxOffset =
              next.length === 0 ? 0 : Math.floor((next.length - 1) / pageSize) * pageSize;

            if (currentOffset > maxOffset) setCurrentOffset(maxOffset);
            return next;
          });
          return;
        }

        const onlyOneOnPage = documents.length === 1;

        if (paginationType === "cursor") {
          const notFirstPage = cursorStack.length > 0;

          if (onlyOneOnPage && notFirstPage) {
            const prevCursor = cursorStack[cursorStack.length - 1] ?? null;
            const newStack = cursorStack.slice(0, -1);

            setCursorStack(newStack);
            setCursor(prevCursor);

            await loadCurrentPage(prevCursor);
            return;
          }

          await loadCurrentPage(cursor);
          return;
        }

        await loadCurrentPage(cursor);
      } catch (e: any) {
        if (isAbortError(e)) return;
        console.error(e);
        showToast("Delete failed", "error");
      }
    },
    [
      namespaceName,
      mutAbortRef,
      newController,
      showToast,
      isSearchMode,
      paginationType,
      currentOffset,
      setCurrentOffset,
      setSearchAll,
      documents.length,
      cursor,
      cursorStack,
      setCursor,
      setCursorStack,
      loadCurrentPage,
    ]
  );

  return { deleteDoc };
}
