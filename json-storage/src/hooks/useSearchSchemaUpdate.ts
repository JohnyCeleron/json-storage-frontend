import { useCallback, useState } from "react";
import { apiSetSearchSchema } from "../api/documents";
import { API_BASE_URL } from "../config/api";
import { isAbortError } from "./useAbortController";

type Deps = {
  namespaceName: string;
  mutAbortRef: React.MutableRefObject<AbortController | null>;
  newController: (ref: React.MutableRefObject<AbortController | null>) => AbortController;
  showToast: (m: string, t?: "error" | "success") => void;
};

export function useSearchSchemaUpdate({
  namespaceName,
  mutAbortRef,
  newController,
  showToast
}: Deps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [indexText, setIndexText] = useState("");
  const [isSchemaSaving, setIsSchemaSaving] = useState(false);
  const [progressIndex, setProgressIndex] = useState<null | number>(null);

  const openUpdateIndexModal = useCallback(() => {
    setIndexText("");
    setIsModalOpen(true);
  }, []);

  const closeUpdateIndexModal = useCallback(() => {
    if (!isSchemaSaving) setIsModalOpen(false);
  }, [isSchemaSaving]);

  const pollProgressStatusSimple = useCallback(
    async (namespace: string) => {
      const POLL_INTERVAL = 100;
      const MAX_POLL_TIME = 30000;
      const MAX_RETRIES = MAX_POLL_TIME / POLL_INTERVAL;

      let retries = 0;

      while (retries < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

        try {
          const response = await fetch(`${API_BASE_URL}/ns/${namespace}/progress-bar`, {
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
        } catch {
        }

        retries++;
      }

      setProgressIndex(null);
      showToast("Index update timed out. Please check manually.", "error");
    },
    [showToast]
  );

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
  }, [indexText, namespaceName, mutAbortRef, newController, pollProgressStatusSimple, showToast]);

  return {
    isModalOpen,
    indexText,
    setIndexText,
    isSchemaSaving,
    progressIndex,

    openUpdateIndexModal,
    closeUpdateIndexModal,
    acceptUpdateIndex,
  };
}
