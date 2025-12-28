import { useNavigate } from "react-router-dom";
import "../css/documents.css";
import "../css/updateIndex.css";
import type { NamespaceData } from "../interfaces/namespaceData.ts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { UpdateIndexModal } from "./update-index.tsx";

type DocumentUI = {
  id: string;
  documentName: string;
  createdAt: string;
  contentLength: number;
  contentHash: string;
  updatedAt: string;
};

type DocumentApi = {
  id: string;

  // expected from API (camelCase)
  documentName?: string;
  createdAt?: string;
  updatedAt?: string;
  contentLength?: number;
  contentHash?: string;

  // backward/compat (snake_case)
  document_name?: string;
  created_at?: string;
  updated_at?: string;
  content_length?: number;
  content_hash?: string;
};

type DocumentListResponse = {
  items: DocumentApi[];
  count: number; // общее количество документов
};

const PAGE_SIZE = 7;

export function NamespaceDocuments({
  namespaceName,
  namespaceData,
}: {
  namespaceName: string;
  namespaceData: NamespaceData;
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [indexText, setIndexText] = useState("");

  // upload
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // list + pagination
  const [documents, setDocuments] = useState<DocumentUI[]>(
    (namespaceData.documentsData ?? []).map((d: any) => ({
      id: d.id,
      documentName: d.documentName ?? d.document_name ?? "",
      createdAt: d.createdAt ?? d.created_at ?? "",
      contentHash: d.contentHash ?? d.content_hash ?? "",
      contentLength: d.contentLength ?? d.content_length ?? 0,
      updatedAt: d.updatedAt ?? d.updated_at ?? "",
    }))
  );
  const [isListLoading, setIsListLoading] = useState(false);

  // cursor-based pagination
  const [cursor, setCursor] = useState<string | null>(null); // текущий курсор (null = первая страница)
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]); // для Back

  const [totalCount, setTotalCount] = useState<number>(0);

  // NEW: hasNext + nextCursor из лишнего элемента (limit+1)
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const page = useMemo(() => cursorStack.length + 1, [cursorStack.length]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount]
  );

  const mapApiToUI = (d: DocumentApi): DocumentUI => ({
    id: d.id,
    documentName: d.documentName ?? d.document_name ?? "",
    createdAt: d.createdAt ?? d.created_at ?? "",
    contentHash: d.contentHash ?? d.content_hash ?? "",
    contentLength: d.contentLength ?? d.content_length ?? 0,
    updatedAt: d.updatedAt ?? d.updated_at ?? "",
  });

  const fetchDocumentsPage = async (namespace: string, cursorValue: string | null) => {
    const url = new URL(`http://localhost:8080/ns/${namespace}/objects`);

    // IMPORTANT: limit = PAGE_SIZE + 1
    url.searchParams.set("limit", String(PAGE_SIZE + 1));
    if (cursorValue) url.searchParams.set("cursor", cursorValue);

    const resp = await fetch(url.toString(), { method: "GET" });
    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${t || "Ошибка загрузки списка документов"}`);
    }

    return (await resp.json()) as DocumentListResponse;
  };

  const loadCurrentPage = async () => {
    setIsListLoading(true);
    try {
      const data = await fetchDocumentsPage(namespaceName, cursor);

      const all = (data.items ?? []).map(mapApiToUI);

      // если пришло PAGE_SIZE+1 — значит есть next, а курсор = id последнего (лишнего) элемента
      const hasNextPage = all.length > PAGE_SIZE;
      const computedNextCursor = hasNextPage ? all[all.length - 1].id : null;

      // показываем только первые PAGE_SIZE
      const visible = all.slice(0, PAGE_SIZE);

      setDocuments(visible);
      setHasNext(hasNextPage);
      setNextCursor(computedNextCursor);

      setTotalCount(data.count ?? 0);
    } finally {
      setIsListLoading(false);
    }
  };

  // при смене namespace — сброс на первую страницу
  useEffect(() => {
    setCursor(null);
    setCursorStack([]);
    setHasNext(false);
    setNextCursor(null);
  }, [namespaceName]);

  // загрузка при смене cursor/namespace
  useEffect(() => {
    loadCurrentPage().catch((e) => {
      console.error(e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespaceName, cursor]);

  // кнопки Next/Back
  const backDisabled = isListLoading || cursorStack.length === 0;

  // IMPORTANT: Next блокируем, если пришло < PAGE_SIZE+1 (то есть hasNext=false)
  const nextDisabled = isListLoading || !hasNext || !nextCursor;

  const handleNextPage = () => {
    if (nextDisabled) return;

    setCursorStack((prev) => [...prev, cursor]); // запоминаем текущий cursor
    setCursor(nextCursor); // идём вперёд по cursor из лишнего элемента
  };

  const handleBackPage = () => {
    if (backDisabled) return;

    setCursorStack((prev) => {
      const newStack = prev.slice(0, -1);
      const prevCursor = prev[prev.length - 1] ?? null;
      setCursor(prevCursor);
      return newStack;
    });
  };

  // ---------- upload ----------
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Ошибка чтения файла"));
      reader.readAsText(file);
    });
  };

  const uploadDocumentToServer = async (
    namespace: string,
    documentName: string,
    jsonData: any
  ) => {
    const endpoint = `http://localhost:8080/ns/${namespace}/objects?document_name=${encodeURIComponent(
      documentName
    )}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || "Ошибка загрузки"}`);
    }

    const objectId = await response.text();
    return { id: objectId, documentName };
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    try {
      setIsUploading(true);

      const documentName = file.name;
      const fileContent = await readFileAsText(file);
      const jsonData = JSON.parse(fileContent);

      await uploadDocumentToServer(namespaceName, documentName, jsonData);

      // после добавления — на первую страницу
      setCursor(null);
      setCursorStack([]);
      await loadCurrentPage();
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = "";
      setSelectedFile(null);
    }
  };

  const handleAddButtonClick = () => {
    fileInputRef.current?.click();
  };

  // ---------- delete ----------
  const deleteDocument = async (namespace: string, documentId: string) => {
    const url = new URL(`http://localhost:8080/ns/${namespace}/objects/${documentId}`);
    const response = await fetch(url.toString(), { method: "DELETE" });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || "Ошибка удаления файла"}`);
    }

    // после удаления — на первую страницу
    setCursor(null);
    setCursorStack([]);
    await loadCurrentPage();
  };

  const handleDeleteClick = (doc: { documentName: string; id: string }) => {
    if (confirm(`Delete document "${doc.documentName}"?`)) {
      deleteDocument(namespaceName, doc.id).catch((e) => {
        console.error(e);
      });
    }
  };

  return (
    <div className="namespace-documents-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        style={{ display: "none" }}
      />

      <UpdateIndexModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={() => {
          console.log("Index accepted:", indexText);
          setIsModalOpen(false);
        }}
        value={indexText}
        onChange={setIndexText}
      />

      <div className="namespace-header">
        <input
          type="text"
          className="json-path-search-input"
          placeholder="JSON Path Search"
        />

        <div className="header-buttons">
          <button
            type="button"
            className="update-index-button"
            onClick={() => {
              setIndexText("");
              setIsModalOpen(true);
            }}
          >
            Update Index
          </button>

          <button
            type="button"
            className="add-document-button"
            onClick={handleAddButtonClick}
            disabled={isUploading}
          >
            {isUploading ? "Loading..." : "Add"}
          </button>
        </div>
      </div>

      {selectedFile && !isUploading && (
        <div className="selected-file-info">
          Выбран файл: <strong>{selectedFile.name}</strong>
        </div>
      )}

      <hr />

      <div className="documents-content">
        <div className="documents-container">
          <div className="documents-header">
            <div className="column-name">Name</div>
            <div className="column-date">CreatedDate</div>
            <div className="column-actions"></div>
          </div>

          {(documents ?? []).map((doc) => (
            <div key={doc.id} className="document-row">
              <div className="document-name">{doc.documentName}</div>
              <div className="document-date">{doc.createdAt}</div>

              <div className="document-actions">
                <button
                  className="document-info-button"
                  onClick={() =>
                    navigate(`/namespaces/${namespaceName}/documents/${doc.id}`, {
                      state: { document: doc },
                    })
                  }
                >
                  Info
                </button>

                <button
                  className="document-remove-button"
                  onClick={() => handleDeleteClick(doc)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="document-paginator-container">
          <div className="page-info">
            Page: {page} / {totalPages}
          </div>

          <div className="pagination-buttons">
            <button
              type="button"
              className="back-page-button"
              onClick={handleBackPage}
              disabled={backDisabled}
            >
              Back
            </button>

            <button
              type="button"
              className="next-page-button"
              onClick={handleNextPage}
              disabled={nextDisabled}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
