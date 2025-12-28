import '../css/header.css'
import '../css/index.css'
import '../css/sidebar.css'
import { Header } from '../components/header.tsx';
import { Sidebar } from '../components/sidebar.tsx';
import { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import { LoadPage } from './loadPage.tsx';
import { NamespaceDocuments } from '../components/namespace-documents.tsx';
import type { NamespaceData } from '../interfaces/namespaceData.ts';
import type { DocumentData } from '../interfaces/document.ts';

async function fetchNamespaceData(namespace: string): Promise<NamespaceData | null> {
    try {
        // Формируем URL с параметрами
        const url = new URL(`http://localhost:8080/ns/${namespace}/objects`);
        url.searchParams.append('limit', '7');
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Namespace "${namespace}" not found`);
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.json();
        // Базовые проверки
        if (!rawData || typeof rawData !== 'object') {
            throw new Error('Invalid response format');
        }
        
        // Преобразуем и валидируем документы
        const documentsData: DocumentData[] = Array.isArray(rawData.items) 
            ? rawData.items.map((doc: any) => ({
                id: String(doc?.id || ''),
                documentName: String(doc?.documentName || ''),
                createdAt: String(doc?.createdAt || ''),
                updatedAt: String(doc?.updatedAt || ''),
                contentLength: Number(doc?.contentLength) || 0,
                contentHash: String(doc?.contentHash || ''),
                content: doc?.content && typeof doc.content === 'object' 
                    ? doc.content as Record<string, unknown>
                    : undefined,
            }))
            : [];
        
        // Создаем объект NamespaceData
        const namespaceData: NamespaceData = {
            documentsData,
            count: Number(rawData?.count) || documentsData.length,
        };
    
        
        return namespaceData;
    } catch (error) {
        console.error(`Error fetching namespace "${namespace}":`, error);
        return {
            documentsData: [],
            count: 0,
        };
    }
}

export function NamespacePage() {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [namespaceData, setNamespaceData] = useState<NamespaceData | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const { namespace } = useParams();

    useEffect(() => {
        const loadNamespaceData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchNamespaceData(namespace!);
                setNamespaceData(data);
            } catch (err) {
                setError('Namespace not found');
                console.error('Error loading namespace data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadNamespaceData();
    }, [namespace]);

     useEffect(() => {
        setIsSidebarVisible(false);
    }, [namespace]);

    const title: string = `Namespaces | ${namespace}`;

    // Показываем загрузку
    if (isLoading) {
        return <LoadPage title={title} 
        isSidebarVisible={isSidebarVisible}
        onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)}
        onClose={() => setIsSidebarVisible(false)}/>;
    }

    // Если namespace не найден - редирект на 404
    if (error) {
        return null;
    }

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
            <NamespaceDocuments namespaceName={namespace!} namespaceData={namespaceData!}/>
        </div>
    );
}