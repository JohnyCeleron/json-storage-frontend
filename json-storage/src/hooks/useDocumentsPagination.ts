import { useCallback, useMemo, useState } from "react";
import { PAGINATION } from "../constants/ui";
import type { DocumentUI, DocumentListResponse } from "../types/documents";
import { mapApiToUI } from "../utils/documents";
import type { PaginationType } from "../types/pagination";


export function useDocumentsPagination() {
  const [paginationType, setPaginationType] = useState<PaginationType>("cursor");
  const [currentOffset, setCurrentOffset] = useState(0);

  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);

  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const page = useMemo(() => {
    if (paginationType === "cursor") return cursorStack.length + 1;
    return Math.floor(currentOffset / PAGINATION.PAGE_SIZE) + 1;
  }, [paginationType, cursorStack.length, currentOffset]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGINATION.PAGE_SIZE)),
    [totalCount]
  );

  const computeBackDisabled = (busy: boolean) =>
    busy || (paginationType === "cursor" ? cursorStack.length === 0 : currentOffset === 0);

  const computeNextDisabled = (busy: boolean) =>
    busy ||
    (paginationType === "cursor"
      ? !hasNext || !nextCursor
      : currentOffset + PAGINATION.PAGE_SIZE >= totalCount);

  const applyListData = useCallback((data: DocumentListResponse) => {
    const all = (data.items ?? []).map(mapApiToUI);
    const hasNextPage = all.length > PAGINATION.PAGE_SIZE;
    const visible = all.slice(0, PAGINATION.PAGE_SIZE);
    const computedNextCursor = hasNextPage ? visible[visible.length - 1]?.id ?? null : null;

    setHasNext(hasNextPage);
    setNextCursor(computedNextCursor);
    setTotalCount(data.count ?? 0);

    return visible as DocumentUI[];
  }, []);

  const goNext = useCallback(
    (nextDisabled: boolean) => {
      if (nextDisabled) return;
      if (paginationType === "cursor") {
        setCursorStack((prev) => [...prev, cursor]);
        setCursor(nextCursor);
      } else {
        setCurrentOffset((prev) => prev + PAGINATION.PAGE_SIZE);
      }
    },
    [paginationType, cursor, nextCursor]
  );

  const goBack = useCallback(
    (backDisabled: boolean) => {
      if (backDisabled) return;
      if (paginationType === "cursor") {
        setCursorStack((prev) => {
          const newStack = prev.slice(0, -1);
          const prevCursor = prev[prev.length - 1] ?? null;
          setCursor(prevCursor);
          return newStack;
        });
      } else {
        setCurrentOffset((prev) => Math.max(0, prev - PAGINATION.PAGE_SIZE));
      }
    },
    [paginationType]
  );

  const resetToCursorMode = useCallback(() => {
    setPaginationType("cursor");
    setCurrentOffset(0);
    setCursor(null);
    setCursorStack([]);
    setHasNext(false);
    setNextCursor(null);
  }, []);

  const resetToOffsetMode = useCallback(() => {
    setPaginationType("offset");
    setCurrentOffset(0);
    setCursor(null);
    setCursorStack([]);
    setHasNext(false);
    setNextCursor(null);
  }, []);

  return {
    paginationType,
    setPaginationType,
    currentOffset,
    setCurrentOffset,
    cursor,
    setCursor,
    cursorStack,
    setCursorStack,
    totalCount,
    setTotalCount,
    hasNext,
    setHasNext,
    nextCursor,
    setNextCursor,

    page,
    totalPages,
    computeBackDisabled,
    computeNextDisabled,

    applyListData,
    goNext,
    goBack,

    resetToCursorMode,
    resetToOffsetMode,
  };
}
