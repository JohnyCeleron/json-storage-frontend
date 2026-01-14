import { useCallback, useState } from "react";
import { readJsonFile } from "../utils/files";
import { apiUploadDocument } from "../api/documents";
import { isAbortError } from "./useAbortController";

type Deps = {
  namespaceName: string;
  mutAbortRef: React.MutableRefObject<AbortController | null>;
  newController: (ref: React.MutableRefObject<AbortController | null>) => AbortController;

  showToast: (m: string, t?: "error" | "success") => void;

  abortSearch: () => void;
  setIsSearchMode: (b: boolean) => void;
  setSearchValue: (v: string) => void;

  resetToCursorMode: () => void;
  loadCurrentPage: (cursorOverride?: string | null) => Promise<void>;
  setSearchAll: (docs: any[]) => void;
};

export function useDocumentUpload({
  namespaceName,
  mutAbortRef,
  newController,
  showToast,
  abortSearch,
  setIsSearchMode,
  setSearchValue,
  resetToCursorMode,
  loadCurrentPage,
  setSearchAll,
}: Deps) {

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

        abortSearch();
        setIsSearchMode(false);
        setSearchValue("");
        setSearchAll([]);

        resetToCursorMode();
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
    [
      namespaceName,
      mutAbortRef,
      newController,
      showToast,
      abortSearch,
      setIsSearchMode,
      setSearchValue,
      setSearchAll,
      resetToCursorMode,
      loadCurrentPage,
    ]
  );

  return { isUploading, selectedFile, uploadSelectedFile, setSelectedFile };
}
