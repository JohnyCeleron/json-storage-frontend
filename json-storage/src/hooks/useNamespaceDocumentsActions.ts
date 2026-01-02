import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PAGINATION, TOAST_TIMINGS } from "../constants/ui";
import {
  apiDeleteDocument,
  apiFetchDocumentsPage,
  apiSearchObjects,
  apiSetSearchSchema,
  apiUploadDocument,
} from "../api/documents";
import { mapApiToUI, mapSearchItemToUI } from "../utils/documents";
import { readJsonFile } from "../utils/files";
import type { DocumentUI, DocumentListResponse } from "../types/documents";

type ToastState = { message: string; type?: "error" | "success"; fading?: boolean } | null;

function isAbortError(e: any) {
  return e?.name === "AbortError";
}

export function useNamespaceDocumentsActions(namespaceName: string) {
  /** ========== UI state ========== */
  const [toast, setToast] = useState<ToastState>(null);

  const [documents, setDocuments] = useState<DocumentUI[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [indexText, setIndexText] = useState("");
  const [isSchemaSaving, setIsSchemaSaving] = useState(false);

  /** ========== Pagination state ========== */
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const page = useMemo(() => cursorStack.length + 1, [cursorStack.length]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGINATION.PAGE_SIZE)),
    [totalCount]
  );

  const backDisabled = isListLoading || cursorStack.length === 0 || isSearchMode;
  const nextDisabled = isListLoading || !hasNext || !nextCursor || isSearchMode;

  /** ========== Toast helpers (no magic timers) ========== */
  const fadeTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearToastTimers = () => {
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    fadeTimerRef.current = null;
    hideTimerRef.current = null;
  };

  useEffect(() => clearToastTimers, []);

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    clearToastTimers();
    setToast({ message, type });

    fadeTimerRef.current = window.setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, fading: true } : prev));
    }, TOAST_TIMINGS.VISIBLE_MS);

    hideTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, TOAST_TIMINGS.VISIBLE_MS + TOAST_TIMINGS.FADE_MS);
  }, []);

  /** ========== AbortControllers ========== */
  const listAbortRef = useRef<AbortController | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const mutAbortRef = useRef<AbortController | null>(null);

  const abortList = () => listAbortRef.current?.abort();
  const abortSearch = () => searchAbortRef.current?.abort();
  const abortMutations = () => mutAbortRef.current?.abort();

  const newController = (ref: React.MutableRefObject<AbortController | null>) => {
    ref.current?.abort();
    const c = new AbortController();
    ref.current = c;
    return c;
  };

  /** ========== List loading ========== */
  const applyListData = (data: DocumentListResponse) => {
    const all = (data.items ?? []).map(mapApiToUI);

    const hasNextPage = all.length > PAGINATION.PAGE_SIZE;
    const computedNextCursor = hasNextPage ? all[all.length - 1].id : null;

    const visible = all.slice(0, PAGINATION.PAGE_SIZE);

    setDocuments(visible);
    setHasNext(hasNextPage);
    setNextCursor(computedNextCursor);
    setTotalCount(data.count ?? 0);
  };

  const listReqIdRef = useRef(0);

  const loadCurrentPage = useCallback(async () => {
    if (isSearchMode) return;

    const reqId = ++listReqIdRef.current;

    const c = newController(listAbortRef);
    setIsListLoading(true);

    try {
      const data = await apiFetchDocumentsPage(namespaceName, cursor, { signal: c.signal });
      applyListData(data);
    } catch (e: any) {
      if (isAbortError(e)) return;
      console.error(e);
      showToast("fetch documents failed", "error");
    } finally {
      // ✅ только последний запрос имеет право гасить loader
      if (listReqIdRef.current === reqId) {
        setIsListLoading(false);
      }
    }
  }, [namespaceName, cursor, isSearchMode, showToast]);

  /** ========== Search ========== */
  const exitSearchMode = useCallback(() => {
    abortSearch();
    setIsSearchMode(false);

    // reset pagination
    setCursor(null);
    setCursorStack([]);
    setHasNext(false);
    setNextCursor(null);
  }, []);

  const runSearch = useCallback(async () => {
    const filters = searchValue.trim();

    if (!filters) {
      exitSearchMode();
      // list will be loaded by effect (cursor/namespaceName)
      return;
    }

    const c = newController(searchAbortRef);
    setIsSearching(true);

    try {
      const result = await apiSearchObjects(namespaceName, filters, { signal: c.signal });
      const mapped = (result ?? [])
        .map(mapSearchItemToUI)
        .filter((d): d is DocumentUI => Boolean(d?.id));

      setDocuments(mapped);
      setIsSearchMode(true);

      // disable pagination in search-mode
      setHasNext(false);
      setNextCursor(null);
      setTotalCount(mapped.length);
      setCursor(null);
      setCursorStack([]);

      showToast(`Found ${mapped.length} document(s)`, "success");
    } catch (e: any) {
      if (isAbortError(e)) return;
      console.error(e);
      showToast("Search failed", "error");
    } finally {
      setIsSearching(false);
    }
  }, [namespaceName, searchValue, exitSearchMode, showToast]);

  /** ========== Pagination actions ========== */
  const goNext = useCallback(() => {
    if (nextDisabled) return;
    setCursorStack((prev) => [...prev, cursor]);
    setCursor(nextCursor);
  }, [nextDisabled, cursor, nextCursor]);

  const goBack = useCallback(() => {
    if (backDisabled) return;
    setCursorStack((prev) => {
      const newStack = prev.slice(0, -1);
      const prevCursor = prev[prev.length - 1] ?? null;
      setCursor(prevCursor);
      return newStack;
    });
  }, [backDisabled]);

  /** ========== Upload ========== */
  const uploadSelectedFile = useCallback(
    async (file: File | null) => {
      if (!file) return;

      setSelectedFile(file);
      setIsUploading(true);

      const c = newController(mutAbortRef);

      try {
        const jsonData = await readJsonFile(file);
        await apiUploadDocument(namespaceName, file.name, jsonData, { signal: c.signal });

        showToast(`Document "${file.name}" uploaded`, "success");

        // after upload -> go back to list mode and reload from first page
        abortSearch();
        setIsSearchMode(false);
        setSearchValue("");

        setCursor(null);
        setCursorStack([]);
      } catch (e: any) {
        if (isAbortError(e)) return;
        console.error(e);
        showToast("Upload failed", "error");
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
      }
    },
    [namespaceName, showToast]
  );

  /** ========== Delete ========== */
  const deleteDoc = useCallback(
    async (docId: string) => {
      const c = newController(mutAbortRef);

      try {
        await apiDeleteDocument(namespaceName, docId, { signal: c.signal });
        showToast("Document removed", "success");

        // reset to first page list
        abortSearch();
        setIsSearchMode(false);
        setSearchValue("");

        setCursor(null);
        setCursorStack([]);
      } catch (e: any) {
        if (isAbortError(e)) return;
        console.error(e);
        showToast("Delete failed", "error");
      }
    },
    [namespaceName, showToast]
  );

  /** ========== Update index (schema) ========== */
  const openUpdateIndexModal = useCallback(() => {
    setIndexText("");
    setIsModalOpen(true);
  }, []);

  const closeUpdateIndexModal = useCallback(() => {
    if (!isSchemaSaving) setIsModalOpen(false);
  }, [isSchemaSaving]);

  const acceptUpdateIndex = useCallback(async () => {
    let schema: any;
    try {
      schema = JSON.parse(indexText);
    } catch (e) {
      console.error(e);
      showToast("Invalid JSON in search schema", "error");
      return;
    }

    const c = newController(mutAbortRef);
    setIsSchemaSaving(true);

    try {
      await apiSetSearchSchema(namespaceName, schema, { signal: c.signal });
      showToast("Search schema updated", "success");
      setIsModalOpen(false);
    } catch (e: any) {
      if (isAbortError(e)) return;
      console.error(e);
      showToast("Update index failed", "error");
    } finally {
      setIsSchemaSaving(false);
    }
  }, [namespaceName, indexText, showToast]);

  /** ========== Effects ========== */
  // Reset everything when namespace changes
  useEffect(() => {
    abortList();
    abortSearch();
    abortMutations();

    setSearchValue("");
    setIsSearchMode(false);

    setCursor(null);
    setCursorStack([]);
    setHasNext(false);
    setNextCursor(null);

    // optional: clear docs until load
    setDocuments([]);
  }, [namespaceName]);

  // Load list when cursor/namespace changes (and not in search mode)
  useEffect(() => {
    void loadCurrentPage();
    return () => {
      // abort in-flight list request on unmount or change
      abortList();
    };
  }, [loadCurrentPage]);

  return {
    // state
    toast,

    documents,
    isListLoading,

    selectedFile,
    isUploading,

    searchValue,
    setSearchValue,
    isSearching,
    isSearchMode,

    page,
    totalPages,
    backDisabled,
    nextDisabled,

    isModalOpen,
    indexText,
    setIndexText,
    isSchemaSaving,

    // actions
    showToast,
    runSearch,
    exitSearchMode,

    goNext,
    goBack,

    uploadSelectedFile,
    deleteDoc,

    openUpdateIndexModal,
    closeUpdateIndexModal,
    acceptUpdateIndex,
  };
}
