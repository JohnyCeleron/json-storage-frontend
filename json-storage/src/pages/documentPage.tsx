import { useEffect, useState } from "react";
import { Header } from "../components/header";
import { Sidebar } from "../components/sidebar";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { DocumentData } from "../interfaces/document";

async function getObjectBodyText(namespace: string, id: string): Promise<string> {
  const response = await fetch(
    `http://5.159.101.21:8080/ns/${namespace}/objects/${id}/body?object_id=${id}`,
    {
      method: "GET",
      headers: [["Accept", "application/json"]],
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get object body: ${response.statusText}`);
  }

  return response.text();
}

type NavState = {
  document?: DocumentData;
  returnTo?: string;
  listState?: any; // можешь типизировать
};

export function DocumentPage() {
  const { namespace, documentName } = useParams<{
    namespace: string;
    documentName: string;
  }>();

  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state ?? {}) as NavState;

  const documentData = navState.document;

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const title = documentData
    ? `Namespaces | ${namespace} | ${documentData.documentName}`
    : `Namespaces | ${namespace} | ${documentName ?? ""}`;

  const handleBack = () => {
    if (navState.returnTo) {
      navigate(navState.returnTo, {
        replace: true,
        state: { listState: navState.listState }, // ✅ вернём снимок обратно
      });
      return;
    }
    navigate(-1);
  };

  useEffect(() => {
    if (!namespace || !documentData?.id) return;

    const load = async () => {
      try {
        setLoadError(null);
        const content = await getObjectBodyText(namespace, documentData.id);
        setDocumentContent(content);
      } catch (e: any) {
        console.error(e);
        setLoadError(e?.message ?? "Failed to load document content");
      }
    };

    void load();
  }, [namespace, documentData?.id]);

  // ✅ если пользователь открыл страницу напрямую/обновил — state может быть пустой
  if (!documentData) {
    return (
      <div className="page">
        <Header title={title} onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)} />
        <Sidebar isVisible={isSidebarVisible} onClose={() => setIsSidebarVisible(false)} />

        <div className="document-page-layout">
          <div className="document-info-container">
            <p>No document data in navigation state (maybe page was refreshed).</p>
            <button onClick={handleBack} className="document-back-button">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header title={title} onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)} />
      <Sidebar isVisible={isSidebarVisible} onClose={() => setIsSidebarVisible(false)} />

      <div className="document-page-layout">
        <div className="document-info-container">
          <div className="info-row">
            <span className="info-label">ID:</span>
            <span className="info-value">{documentData.id}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Created At:</span>
            <span className="info-value">{documentData.createdAt}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Updated At:</span>
            <span className="info-value">{documentData.updatedAt}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Content Length:</span>
            <span className="info-value">{documentData.contentLength} bytes</span>
          </div>

          <div className="info-row">
            <span className="info-label">Hash:</span>
            <span className="info-value">{documentData.contentHash}</span>
          </div>

          <button onClick={handleBack} className="document-back-button">
            Back
          </button>
        </div>

        <div className="document-content-container">
          {loadError ? (
            <p>{loadError}</p>
          ) : documentContent ? (
            <pre>{JSON.stringify(JSON.parse(documentContent), null, 2)}</pre>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
