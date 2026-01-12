import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import "../css/documents.css";
import "../css/updateIndex.css";
import "../css/toast.css";

import { UpdateIndexModal } from "./update-index.tsx";
import { LoadingSpinner } from "./load-spinner.tsx";

import { useNamespaceDocumentsActions } from "../hooks/useNamespaceDocumentsActions";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";



export function NamespaceDocuments({ namespaceName }: { namespaceName: string }) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const action = useNamespaceDocumentsActions(namespaceName);

  const location = useLocation();

  useEffect(() => {
    const st = (location.state as any)?.listState;
    if (st) void action.restoreListState(st);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="namespace-documents-container">
      {action.toast && (
        <div
          className={`toast toast--top ${action.toast.type ?? "error"} ${
            action.toast.fading ? "toast--fadeout" : ""
          }`}
        >
          {action.toast.message}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          void action.uploadSelectedFile(file);
          if (e.target) e.target.value = "";
        }}
        accept=".json,application/json"
        style={{ display: "none" }}
      />

      <UpdateIndexModal
        isOpen={action.isModalOpen}
        onClose={action.closeUpdateIndexModal}
        onAccept={action.acceptUpdateIndex}
        value={action.indexText}
        onChange={action.setIndexText}
        loading={action.isSchemaSaving}
      />

      <div className="namespace-header">
        <input
          type="text"
          className="json-path-search-input"
          placeholder="JSON Path Search"
          value={action.searchValue}
          onChange={(e) => action.setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void action.runSearch();
            }
          }}
        />

        <div className="header-buttons">
          <button
            type="button"
            className="update-index-button"
            onClick={action.openUpdateIndexModal}
            disabled={action.progressIndex !== null}
          >
            {action.progressIndex !== null ? `${action.progressIndex}%` : 'Update Index'}
          </button>

          <button
            type="button"
            className="add-document-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={action.isUploading}
          >
            {action.isUploading ? "Loading..." : "Add"}
          </button>
        </div>
      </div>

      {action.selectedFile && !action.isUploading && (
        <div className="selected-file-info">
          Выбран файл: <strong>{action.selectedFile.name}</strong>
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

          {(action.documents ?? []).map((doc) => (
            <div key={doc.id} className="document-row">
              <div className="document-name">{doc.documentName}</div>
              <div className="document-date">{doc.createdAt}</div>

              <div className="document-actions">
                <button
                  className="document-info-button"
                  onClick={() =>
                    navigate(`/namespaces/${namespaceName}/documents/${doc.id}`, {
                      state: { 
                        document: doc,
                        returnTo: location.pathname + location.search,
                        listState: action.getListState(), 
                      },
                    })
                  }
                >
                  Info
                </button>

                <button
                  className="document-remove-button"
                  onClick={() => void action.deleteDoc(doc.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {action.isListLoading && <LoadingSpinner />}
        </div>

        <div className="document-paginator-container">
          <div className="page-info">
            Page: {action.page} / {action.totalPages}
          </div>

          <div className="pagination-buttons">
            <button
              type="button"
              className="back-page-button"
              onClick={action.goBack}
              disabled={action.backDisabled}
            >
              Back
            </button>

            <button
              type="button"
              className="next-page-button"
              onClick={action.goNext}
              disabled={action.nextDisabled}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
