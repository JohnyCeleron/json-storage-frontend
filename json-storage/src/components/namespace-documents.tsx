import "../css/documents.css"
import type { NamespaceData } from "../interfaces/namespaceData.ts";

export function NamespaceDocuments({namespaceData}: {namespaceData: NamespaceData | null}) {
    return (
        <div className="namespace-documents-container">
            <div className="namespace-header">
                <input type="text" className="json-path-search-input" placeholder="JSON Path Search"/>
                <div>
                    <button type="button" className="update-index-button">
                        Update Index
                    </button>
                    <button type="button" className="add-document-button">
                        Add
                    </button>
                </div>
                
            </div>
            <hr />
            <div className="documents-content">
                <div className="documents-container">
                    <div className="documents-header">
                        <div className="column-name">Name</div>
                        <div className="column-date">CreatedDate</div>
                        <div className="column-actions"></div>
                    </div>

                    {(namespaceData?.documentsData ?? []).map((doc) => (
                        <div key={doc.id} className="document-row">
                            <div className="document-name">{doc.document_name}</div>
                            <div className="document-date">{doc.createdAt}</div>
                            <div className="document-actions">
                                <button className="document-info-button">Info</button>
                                <button className="document-remove-button">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="document-paginator-container">
                    <div className="page-info">Page: 1</div>
                    <div className="pagination-buttons">
                        <button type="button" className="back-page-button">Back</button>
                        <button type="button" className="next-page-button">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}