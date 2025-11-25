

import { useState } from "react";
import { Header } from "../components/header";
import { Sidebar } from "../components/sidebar";
import { useLocation, useParams } from "react-router-dom";
import type { DocumentData } from "../interfaces/document";

export function DocumentPage() {
    const { namespace, documentName} = useParams<{
        namespace: string;
        documentName: string;
    }>();

    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const { state } = useLocation<{ document?: DocumentData }>();
    const documentData = state.document;
    console.log(documentData);
    const title = `Namespaces | ${namespace} | ${documentData.documentName}`;

    return (
        <div className='page'>
            <Header 
                title={title} 
                onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)} 
            />
            <Sidebar 
                isVisible={isSidebarVisible} 
                onClose={() => setIsSidebarVisible(false)} 
            />
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

                </div>
                <div className="document-content-container">
                    {documentData.content ? (
                        <pre>{JSON.stringify(documentData.content, null, 2)}</pre>
                    ) : (
                        <p>No content</p>
                    )}
                </div>
            </div>
        </div>
    )
}