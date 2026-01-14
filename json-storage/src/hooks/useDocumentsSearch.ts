import { useCallback, useEffect, useState } from "react";
import { PAGINATION } from "../constants/ui";
import { apiSearchObjects } from "../api/documents";
import { mapSearchItemToUI } from "../utils/documents";
import type { DocumentUI } from "../types/documents";
import { isAbortError } from "./useAbortController";

type Deps = {
  namespaceName: string;
  searchAbortRef: React.MutableRefObject<AbortController | null>;
  newController: (ref: React.MutableRefObject<AbortController | null>) => AbortController;

  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  isSearchMode: boolean;
  setIsSearchMode: React.Dispatch<React.SetStateAction<boolean>>;
  setPaginationType: (t: "offset" | "cursor") => void;

  setCursor: (c: string | null) => void;
  setCursorStack: (s: (string | null)[]) => void;
  setNextCursor: (c: string | null) => void;

  currentOffset: number;
  setCurrentOffset: React.Dispatch<React.SetStateAction<number>>;

  searchAll: DocumentUI[];
  setSearchAll: React.Dispatch<React.SetStateAction<DocumentUI[]>>;

  setTotalCount: (n: number) => void;
  setHasNext: (b: boolean) => void;
  setDocuments: (docs: DocumentUI[]) => void;

  showToast: (m: string, t?: "error" | "success") => void;
  abortSearch: () => void;
};

export function useDocumentsSearch({
  namespaceName,
  searchAbortRef,
  newController,
  searchValue,
  setSearchValue,
  isSearchMode,
  setIsSearchMode,
  setPaginationType,
  setCursor,
  setCursorStack,
  setNextCursor,
  currentOffset,
  setCurrentOffset,
  searchAll,
  setSearchAll,
  setTotalCount,
  setHasNext,
  setDocuments,
  showToast,
  abortSearch,
}: Deps) {

  const [isSearching, setIsSearching] = useState(false);

  const exitSearchMode = useCallback(() => {
    abortSearch();
    setIsSearchMode(false);

    setPaginationType("cursor");
    setSearchAll([]);
    setCurrentOffset(0);

    setCursor(null);
    setCursorStack([]);
    setHasNext(false);
    setNextCursor(null);
  }, [
    abortSearch,
    setIsSearchMode,
    setPaginationType,
    setSearchAll,
    setCurrentOffset,
    setCursor,
    setCursorStack,
    setHasNext,
    setNextCursor,
  ]);

  const runSearch = useCallback(async () => {
    const filters = searchValue.trim();
    if (!filters) {
      exitSearchMode();
      return;
    }

    newController(searchAbortRef);
    setIsSearching(true);

    try {
      const result = await apiSearchObjects(namespaceName, filters);
      const mapped = (result ?? [])
        .map(mapSearchItemToUI)
        .filter((d): d is DocumentUI => Boolean(d?.id));

      setIsSearchMode(true);
      setPaginationType("offset");
      setCursor(null);
      setCursorStack([]);
      setNextCursor(null);
      setCurrentOffset(0);

      setSearchAll(mapped);
      setTotalCount(mapped.length);

      const firstPage = mapped.slice(0, PAGINATION.PAGE_SIZE);
      setDocuments(firstPage);
      setHasNext(mapped.length > PAGINATION.PAGE_SIZE);

      if (mapped.length === 100) {
        showToast("Found 100 results (showing first 100). Refine filters to narrow down.", "success");
      } else {
        showToast(`Found ${mapped.length} document(s)`, "success");
      }
    } catch (e: any) {
      if (isAbortError(e)) return;
      console.error(e);
      showToast("Search failed", "error");
    } finally {
      setIsSearching(false);
    }
  }, [
    namespaceName,
    searchValue,
    exitSearchMode,
    newController,
    searchAbortRef,
    setIsSearchMode,
    setPaginationType,
    setCursor,
    setCursorStack,
    setNextCursor,
    setCurrentOffset,
    setSearchAll,
    setTotalCount,
    setDocuments,
    setHasNext,
    showToast,
  ]);

  useEffect(() => {
    if (!isSearchMode) return;

    const start = currentOffset;
    const end = currentOffset + PAGINATION.PAGE_SIZE;

    setDocuments(searchAll.slice(start, end));
    setTotalCount(searchAll.length);
    setHasNext(end < searchAll.length);
    setNextCursor(null);
  }, [isSearchMode, currentOffset, searchAll, setDocuments, setTotalCount, setHasNext, setNextCursor]);

  const refreshSearch = useCallback(
    async (filters: string, keepOffset: boolean = true) => {
      const q = filters.trim();
      if (!q) return;

      newController(searchAbortRef);
      setIsSearching(true);

      try {
        const result = await apiSearchObjects(namespaceName, q);
        const mapped = (result ?? [])
          .map(mapSearchItemToUI)
          .filter((d): d is DocumentUI => Boolean(d?.id));

        setIsSearchMode(true);
        setPaginationType("offset");
        setSearchAll(mapped);
        setTotalCount(mapped.length);

        if (!keepOffset) {
          setCurrentOffset(0);
          return;
        }

        const pageSize = PAGINATION.PAGE_SIZE;
        const maxOffset =
          mapped.length === 0 ? 0 : Math.floor((mapped.length - 1) / pageSize) * pageSize;

        setCurrentOffset((prev) => (prev > maxOffset ? maxOffset : prev));
      } catch (e: any) {
        if (isAbortError(e)) return;
        console.error(e);
        showToast("Search refresh failed", "error");
      } finally {
        setIsSearching(false);
      }
    },
    [
      namespaceName,
      newController,
      searchAbortRef,
      setIsSearchMode,
      setPaginationType,
      setSearchAll,
      setTotalCount,
      setCurrentOffset,
      showToast,
    ]
  );

  return {
    isSearching,
    exitSearchMode,
    runSearch,
    refreshSearch,
    setSearchValue,
  };
}
