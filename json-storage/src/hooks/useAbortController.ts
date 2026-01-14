import { useCallback, useRef, type MutableRefObject } from "react";

export function isAbortError(e: any) {
  return e?.name === "AbortError";
}

export function useAbortControllers() {
  const listAbortRef = useRef<AbortController | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const mutAbortRef = useRef<AbortController | null>(null);

  const abortList = useCallback(() => {
    listAbortRef.current?.abort();
  }, []);

  const abortSearch = useCallback(() => {
    searchAbortRef.current?.abort();
  }, []);

  const abortMutations = useCallback(() => {
    mutAbortRef.current?.abort();
  }, []);

  const newController = useCallback(
    (ref: MutableRefObject<AbortController | null>) => {
      ref.current?.abort();
      const c = new AbortController();
      ref.current = c;
      return c;
    },
    []
  );

  return {
    listAbortRef,
    searchAbortRef,
    mutAbortRef,
    abortList,
    abortSearch,
    abortMutations,
    newController,
  };
}
