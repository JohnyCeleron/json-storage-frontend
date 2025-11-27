import { useNavigate } from "react-router-dom";
import "../css/documents.css"
import "../css/updateIndex.css"
import type { NamespaceData } from "../interfaces/namespaceData.ts";
import { useState } from "react";
import { UpdateIndexModal } from "./update-index.tsx";

export function NamespaceDocuments({namespaceName, namespaceData}: {namespaceName: string, namespaceData: NamespaceData}) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [indexText, setIndexText] = useState("");
    
    return (
        <div className="namespace-documents-container">
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
                <input type="text" className="json-path-search-input" placeholder="JSON Path Search"/>
                <div>
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
                            <div className="document-name">{doc.documentName}</div>
                            <div className="document-date">{doc.createdAt}</div>
                            <div className="document-actions">
                                <button className="document-info-button" onClick={
                                    () => navigate(`/namespaces/${namespaceName}/documents/${doc.id}`, 
                                        {state : {document: doc}}
                                    )}>Info</button>
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