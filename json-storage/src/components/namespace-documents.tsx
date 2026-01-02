import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import "../css/documents.css";
import "../css/updateIndex.css";
import "../css/toast.css";

import { UpdateIndexModal } from "./update-index.tsx";
import { LoadingSpinner } from "./load-spinner.tsx";

import { useNamespaceDocumentsActions } from "../hooks/useNamespaceDocumentsActions";

export function NamespaceDocuments({ namespaceName }: { namespaceName: string }) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const a = useNamespaceDocumentsActions(namespaceName);

  return (
    <div className="namespace-documents-container">
      {a.toast && (
        <div
          className={`toast toast--top ${a.toast.type ?? "error"} ${
            a.toast.fading ? "toast--fadeout" : ""
          }`}
        >
          {a.toast.message}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          void a.uploadSelectedFile(file);
          if (e.target) e.target.value = "";
        }}
        accept=".json,application/json"
        style={{ display: "none" }}
      />

      <UpdateIndexModal
        isOpen={a.isModalOpen}
        onClose={a.closeUpdateIndexModal}
        onAccept={a.acceptUpdateIndex}
        value={a.indexText}
        onChange={a.setIndexText}
        loading={a.isSchemaSaving}
      />

      <div className="namespace-header">
        <input
          type="text"
          className="json-path-search-input"
          placeholder="JSON Path Search"
          value={a.searchValue}
          onChange={(e) => a.setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void a.runSearch();
            }
          }}
        />

        <div className="header-buttons">
          <button
            type="button"
            className="update-index-button"
            onClick={a.openUpdateIndexModal}
          >
            Update Index
          </button>

          <button
            type="button"
            className="add-document-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={a.isUploading}
          >
            {a.isUploading ? "Loading..." : "Add"}
          </button>
        </div>
      </div>

      {a.selectedFile && !a.isUploading && (
        <div className="selected-file-info">
          Выбран файл: <strong>{a.selectedFile.name}</strong>
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

          {(a.documents ?? []).map((doc) => (
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
                  onClick={() => void a.deleteDoc(doc.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {a.isListLoading && <LoadingSpinner />}
        </div>

        <div className="document-paginator-container">
          <div className="page-info">
            Page: {a.page} / {a.totalPages}
          </div>

          <div className="pagination-buttons">
            <button
              type="button"
              className="back-page-button"
              onClick={a.goBack}
              disabled={a.backDisabled}
            >
              Back
            </button>

            <button
              type="button"
              className="next-page-button"
              onClick={a.goNext}
              disabled={a.nextDisabled}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
