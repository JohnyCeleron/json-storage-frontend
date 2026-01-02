import { useCallback, useMemo, useState } from "react";
import { PAGINATION } from "../constants/ui";

export function useCursorPagination(totalCount: number, isListLoading: boolean) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const page = useMemo(() => cursorStack.length + 1, [cursorStack.length]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGINATION.PAGE_SIZE)),
    [totalCount]
  );

  const resetPagination = useCallback(() => {
    setCursor(null);
    setCursorStack([]);
    setHasNext(false);
    setNextCursor(null);
  }, []);

  const backDisabled = isListLoading || cursorStack.length === 0;
  const nextDisabled = isListLoading || !hasNext || !nextCursor;

  const goNext = useCallback(() => {
    if (nextDisabled) return;
    setCursorStack((prev) => [...prev, cursor]);
    setCursor(nextCursor);
  }, [cursor, nextCursor, nextDisabled]);

  const goBack = useCallback(() => {
    if (backDisabled) return;
    setCursorStack((prev) => {
      const newStack = prev.slice(0, -1);
      const prevCursor = prev[prev.length - 1] ?? null;
      setCursor(prevCursor);
      return newStack;
    });
  }, [backDisabled]);

  return {
    cursor,
    setCursor,
    cursorStack,
    setCursorStack,
    hasNext,
    setHasNext,
    nextCursor,
    setNextCursor,
    page,
    totalPages,
    resetPagination,
    backDisabled,
    nextDisabled,
    goNext,
    goBack,
  };
}
