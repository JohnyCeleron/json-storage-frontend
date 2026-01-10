

import { useEffect, useState } from "react";
import { Header } from "../components/header";
import { Sidebar } from "../components/sidebar";
import { useLocation, useParams } from "react-router-dom";
import type { DocumentData } from "../interfaces/document";

async function getObjectBodyText(
    namespace: string,
    id: string
  ): Promise<any> {
    const response = await fetch(
      `http://5.159.101.21:8080/ns/${namespace}/objects/${id}/body?object_id=${id}`,
      {
        method: 'GET',
        headers: [
            ['Accept', 'application/json'],
        ]
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get object body: ${response.statusText} ${response.body}`);
    }
    
    return response.text();
  }

export function DocumentPage() {
    const { namespace, documentName} = useParams<{
        namespace: string;
        documentName: string;
    }>();

    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const { state } = useLocation<{ document?: DocumentData }>();
    const documentData: DocumentData = state.document;
    const title = `Namespaces | ${namespace} | ${documentData.documentName}`;
    const [documentContent, setDocumentContent] = useState<any | null>();
    useEffect(() => {
        const loadDocumentContent = async () => {
            try {
                const content = await getObjectBodyText(namespace, documentData.id);
                console.info(content);
                setDocumentContent(content);
            } finally {

            }
        }
        loadDocumentContent();
    }, [namespace]);

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
                    {documentContent ? (      
                        <pre>{ JSON.stringify(JSON.parse(documentContent), null, 2) }</pre>
                    ) : (
                        <p>No content</p>
                    )}
                </div>
            </div>
        </div>
    )
}