import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
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

type PaginationType = "offset" | "cursor";

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

  const [progressIndex, setProgressIndex] = useState<null | number>(null);

  /** ========== Pagination state ========== */
  const [paginationType, setPaginationType] = useState<PaginationType>("cursor");
  const [currentOffset, setCurrentOffset] = useState(0);

  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // ✅ search results cache (up to 100) for client offset paging
  const [searchAll, setSearchAll] = useState<DocumentUI[]>([]);

  const page = useMemo(() => {
    if (paginationType === "cursor") return cursorStack.length + 1;
    return Math.floor(currentOffset / PAGINATION.PAGE_SIZE) + 1;
  }, [paginationType, cursorStack.length, currentOffset]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGINATION.PAGE_SIZE)),
    [totalCount]
  );

  const backDisabled =
    isListLoading ||
    isSearching ||
    (paginationType === "cursor" ? cursorStack.length === 0 : currentOffset === 0);

  const nextDisabled =
    isListLoading ||
    isSearching ||
    (paginationType === "cursor"
      ? !hasNext || !nextCursor
      : currentOffset + PAGINATION.PAGE_SIZE >= totalCount);

  /** ========== Toast helpers ========== */
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

  const newController = (ref: MutableRefObject<AbortController | null>) => {
    ref.current?.abort();
    const c = new AbortController();
    ref.current = c;
    return c;
  };

  /** ========== List loading (cursor) ========== */
  const applyListData = (data: DocumentListResponse) => {
    const all = (data.items ?? []).map(mapApiToUI);

    // ✅ если бэк отдаёт PAGE_SIZE+1 для определения следующей страницы:
    const hasNextPage = all.length > PAGINATION.PAGE_SIZE;
    const visible = all.slice(0, PAGINATION.PAGE_SIZE);

    // ✅ nextCursor должен быть последним ВИДИМЫМ, а не “лишним”
    const computedNextCursor = hasNextPage ? visible[visible.length - 1]?.id ?? null : null;

    setDocuments(visible);
    setHasNext(hasNextPage);
    setNextCursor(computedNextCursor);
    setTotalCount(data.count ?? 0);
  };

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
        applyListData(data);
      } catch (e: any) {
        if (isAbortError(e)) return;
        console.error(e);
        showToast("fetch documents failed", "error");
      } finally {
        if (listReqIdRef.current === reqId) setIsListLoading(false);
      }
    },
    [namespaceName, cursor, isSearchMode, showToast]
  );

  /** ========== Search (fetch 100) ========== */
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
  }, []);

  const runSearch = useCallback(async () => {
    const filters = searchValue.trim();

    if (!filters) {
      exitSearchMode();
      return;
    }

    const c = newController(searchAbortRef);
    setIsSearching(true);

    try {
      // ✅ apiSearchObjects поддерживает вызов с opts третьим аргументом (см. перегрузку)
      const result = await apiSearchObjects(namespaceName, filters);

      const mapped = (result ?? [])
        .map(mapSearchItemToUI)
        .filter((d): d is DocumentUI => Boolean(d?.id));

      setIsSearchMode(true);
      setPaginationType("offset");

      // сброс cursor режима (он только для списка)
      setCursor(null);
      setCursorStack([]);
      setNextCursor(null);

      // offset paging начинается с 0
      setCurrentOffset(0);

      // кэшируем 100 результатов и показываем первую страницу
      setSearchAll(mapped);
      setTotalCount(mapped.length);
      setHasNext(mapped.length > PAGINATION.PAGE_SIZE);
      setDocuments(mapped.slice(0, PAGINATION.PAGE_SIZE));

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
  }, [namespaceName, searchValue, exitSearchMode, showToast]);

  // ✅ client-side paging для поиска (offset -> slice)
  useEffect(() => {
    if (!isSearchMode) return;
    if (paginationType !== "offset") return;

    const start = currentOffset;
    const end = currentOffset + PAGINATION.PAGE_SIZE;

    setDocuments(searchAll.slice(start, end));
    setTotalCount(searchAll.length);
    setHasNext(end < searchAll.length);
    setNextCursor(null);
  }, [isSearchMode, paginationType, currentOffset, searchAll]);

  /** ========== Pagination actions ========== */
  const goNext = useCallback(() => {
    if (nextDisabled) return;

    if (paginationType === "cursor") {
      setCursorStack((prev) => [...prev, cursor]);
      setCursor(nextCursor);
    } else {
      setCurrentOffset((prev) => prev + PAGINATION.PAGE_SIZE);
    }
  }, [nextDisabled, paginationType, cursor, nextCursor]);

  const goBack = useCallback(() => {
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
  }, [backDisabled, paginationType]);

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

        // выйти из поиска и вернуться к cursor списку
        abortSearch();
        setIsSearchMode(false);
        setSearchValue("");
        setPaginationType("cursor");
        setSearchAll([]);
        setCurrentOffset(0);

        setCursor(null);
        setCursorStack([]);

        // ✅ гарантируем первую страницу
        await loadCurrentPage(null);
      } catch (e: any) {
        if (isAbortError(e)) return;
        console.error(e);
        showToast("Upload failed", "error");
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
      }
    },
    [namespaceName, showToast, loadCurrentPage]
  );

  /** ========== Delete ========== */
  const deleteDoc = useCallback(
    async (docId: string) => {
      const c = newController(mutAbortRef);

      try {
        await apiDeleteDocument(namespaceName, docId, { signal: c.signal });
        showToast("Document removed", "success");

        // ============================
        // 1) SEARCH MODE (offset)
        // ============================
        if (isSearchMode && paginationType === "offset") {
          setSearchAll((prev) => {
            const next = prev.filter((d) => d.id !== docId);

            // если удалили так, что текущий offset стал “за концом” — откатимся на последнюю валидную страницу
            const pageSize = PAGINATION.PAGE_SIZE;
            const maxOffset =
              next.length === 0 ? 0 : Math.floor((next.length - 1) / pageSize) * pageSize;

            if (currentOffset > maxOffset) {
              setCurrentOffset(maxOffset);
            }
            // searchValue НЕ трогаем, isSearchMode НЕ трогаем
            return next;
          });

          return;
        }

        // ============================
        // 2) LIST MODE (cursor)
        // ============================
        const onlyOneOnPage = documents.length === 1;

        if (paginationType === "cursor") {
          const notFirstPage = cursorStack.length > 0;

          if (onlyOneOnPage && notFirstPage) {
            // перейти назад на 1 страницу
            const prevCursor = cursorStack[cursorStack.length - 1] ?? null;
            const newStack = cursorStack.slice(0, -1);

            setCursorStack(newStack);
            setCursor(prevCursor);

            await loadCurrentPage(prevCursor);
            return;
          }

          // остаёмся на той же странице
          await loadCurrentPage(cursor);
          return;
        }

        // ============================
        // 3) fallback (если вдруг окажешься в offset вне поиска)
        // ============================
        await loadCurrentPage(cursor);
      } catch (e: any) {
        if (isAbortError(e)) return;
        console.error(e);
        showToast("Delete failed", "error");
      }
    },
    [
      namespaceName,
      showToast,
      isSearchMode,
      paginationType,
      currentOffset,
      documents.length,
      cursorStack,
      cursor,
      loadCurrentPage,
    ]
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
      setIsModalOpen(false);
      await pollProgressStatusSimple(namespaceName);
    } catch (e: any) {
      if (isAbortError(e)) return;
      console.error(e);
      showToast("Update index failed", "error");
    } finally {
      setIsSchemaSaving(false);
    }
  }, [namespaceName, indexText, showToast]);

  const pollProgressStatusSimple = async (namespace: string) => {
    const POLL_INTERVAL = 100;
    const MAX_POLL_TIME = 30000;
    const MAX_RETRIES = MAX_POLL_TIME / POLL_INTERVAL;

    let retries = 0;

    while (retries < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

      try {
        const response = await fetch(`http://5.159.101.21:8080/ns/${namespace}/progress-bar`, {
          method: "GET",
          headers: { accept: "application/json" },
        });

        if (!response.ok) {
          retries++;
          continue;
        }

        const data = await response.json();
        const { status, percent } = data;

        setProgressIndex(percent);

        if (status === "success") {
          setProgressIndex(null);
          showToast("Index updated successfully!", "success");
          return;
        }

        if (status === "failed") {
          setProgressIndex(null);
          showToast("Index update failed", "error");
          return;
        }

        if (status !== "progress" && status !== "init") {
          setProgressIndex(null);
          showToast(`Index update status: ${status}`, status === "success" ? "success" : "error");
          return;
        }
      } catch (error) {
        // ignore
      }

      retries++;
    }

    setProgressIndex(null);
    showToast("Index update timed out. Please check manually.", "error");
  };

  /** ========== Effects ========== */
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

    setDocuments([]);

    setPaginationType("cursor");
    setCurrentOffset(0);
    setSearchAll([]);
  }, [namespaceName]);

  useEffect(() => {
    void loadCurrentPage();
    return () => abortList();
  }, [loadCurrentPage]);

  return {
    progressIndex,
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
