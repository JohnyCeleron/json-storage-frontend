import { useCallback, useEffect, useState } from "react";
import type { DocumentUI } from "../types/documents";

import { useToastTimers } from "./useToast";
import { useAbortControllers } from "./useAbortController";
import { useDocumentsPagination } from "./useDocumentsPagination";
import { useDocumentsList } from "./useDocumentsList";
import { useDocumentsSearch } from "./useDocumentsSearch";
import { useDocumentUpload } from "./useDocumentUpload";
import { useDocumentDelete } from "./useDocumentDelete";
import { useSearchSchemaUpdate } from "./useSearchSchemaUpdate";

export type DocumentsListState = {
  searchValue: string;
  isSearchMode: boolean;
  paginationType: "offset" | "cursor";
  currentOffset: number;
  cursor: string | null;
  cursorStack: (string | null)[];
};

export function useNamespaceDocumentsActions(namespaceName: string) {
  const { toast, showToast } = useToastTimers();
  const {
    listAbortRef,
    searchAbortRef,
    mutAbortRef,
    abortList,
    abortSearch,
    abortMutations,
    newController,
  } = useAbortControllers();

  const [documents, setDocuments] = useState<DocumentUI[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchAll, setSearchAll] = useState<DocumentUI[]>([]);

  const pagination = useDocumentsPagination();

  const { isListLoading, loadCurrentPage } = useDocumentsList({
    namespaceName,
    isSearchMode,
    cursor: pagination.cursor,
    listAbortRef,
    newController,
    applyListData: pagination.applyListData,
    setDocuments,
    showToast,
  });

  const search = useDocumentsSearch({
    namespaceName,
    searchAbortRef,
    newController,

    searchValue,
    setSearchValue,
    isSearchMode,
    setIsSearchMode,

    setPaginationType: pagination.setPaginationType,
    setCursor: pagination.setCursor,
    setCursorStack: pagination.setCursorStack,
    setNextCursor: pagination.setNextCursor,

    currentOffset: pagination.currentOffset,
    setCurrentOffset: pagination.setCurrentOffset,

    searchAll,
    setSearchAll,

    setTotalCount: pagination.setTotalCount,
    setHasNext: pagination.setHasNext,
    setDocuments,

    showToast,
    abortSearch,
  });

  const upload = useDocumentUpload({
    namespaceName,
    mutAbortRef,
    newController,
    showToast,
    abortSearch,
    setIsSearchMode,
    setSearchValue,
    resetToCursorMode: pagination.resetToCursorMode,
    loadCurrentPage,
    setSearchAll,
  });

  const del = useDocumentDelete({
    namespaceName,
    mutAbortRef,
    newController,
    showToast,
    isSearchMode,
    paginationType: pagination.paginationType,
    currentOffset: pagination.currentOffset,
    setCurrentOffset: pagination.setCurrentOffset,
    documents,
    cursor: pagination.cursor,
    cursorStack: pagination.cursorStack,
    setCursor: pagination.setCursor,
    setCursorStack: pagination.setCursorStack,
    setSearchAll,
    loadCurrentPage,
  });

  const schemaUpdate = useSearchSchemaUpdate({
    namespaceName,
    mutAbortRef,
    newController,
    showToast,
  });

  const backDisabled = pagination.computeBackDisabled(isListLoading || search.isSearching);
  const nextDisabled = pagination.computeNextDisabled(isListLoading || search.isSearching);

  const page = pagination.page;
  const totalPages = pagination.totalPages;

  const goNext = useCallback(() => pagination.goNext(nextDisabled), [pagination, nextDisabled]);
  const goBack = useCallback(() => pagination.goBack(backDisabled), [pagination, backDisabled]);

  useEffect(() => {
    abortList();
    abortSearch();
    abortMutations();

    setSearchValue("");
    setIsSearchMode(false);
    setDocuments([]);
    setSearchAll([]);

    pagination.resetToCursorMode();
  }, [namespaceName]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void loadCurrentPage();
    return () => abortList();
  }, [loadCurrentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const getListState = useCallback((): DocumentsListState => {
    return {
      searchValue,
      isSearchMode,
      paginationType: pagination.paginationType,
      currentOffset: pagination.currentOffset,
      cursor: pagination.cursor,
      cursorStack: pagination.cursorStack,
    };
  }, [searchValue, isSearchMode, pagination]);

  const restoreListState = useCallback(
    async (st: DocumentsListState | null | undefined) => {
      if (!st) return;

      abortList();
      abortSearch();

      setSearchValue(st.searchValue ?? "");

      if (st.isSearchMode) {
        setIsSearchMode(true);
        pagination.resetToOffsetMode();

        setSearchAll([]);
        setDocuments([]);

        await search.refreshSearch(st.searchValue ?? "", false);
        pagination.setCurrentOffset(st.currentOffset ?? 0);
        return;
      }

      setIsSearchMode(false);
      pagination.resetToCursorMode();

      pagination.setCursorStack(st.cursorStack ?? []);
      pagination.setCursor(st.cursor ?? null);

      await loadCurrentPage(st.cursor ?? null);
    },
    [abortList, abortSearch, loadCurrentPage, pagination, search]
  );

  return {
    progressIndex: schemaUpdate.progressIndex,
    toast,
    showToast,

    paginationType: pagination.paginationType,
    documents,
    isListLoading,
    currentOffset: pagination.currentOffset,
    cursor: pagination.cursor,
    cursorStack: pagination.cursorStack,

    page,
    totalPages,
    backDisabled,
    nextDisabled,

    searchValue,
    setSearchValue,
    isSearching: search.isSearching,
    isSearchMode,
    runSearch: search.runSearch,
    exitSearchMode: search.exitSearchMode,

    goNext,
    goBack,
    uploadSelectedFile: upload.uploadSelectedFile,
    deleteDoc: del.deleteDoc,

    isModalOpen: schemaUpdate.isModalOpen,
    indexText: schemaUpdate.indexText,
    setIndexText: schemaUpdate.setIndexText,
    isSchemaSaving: schemaUpdate.isSchemaSaving,
    openUpdateIndexModal: schemaUpdate.openUpdateIndexModal,
    closeUpdateIndexModal: schemaUpdate.closeUpdateIndexModal,
    acceptUpdateIndex: schemaUpdate.acceptUpdateIndex,

    selectedFile: upload.selectedFile,
    isUploading: upload.isUploading,

    getListState,
    restoreListState,
  };
}
