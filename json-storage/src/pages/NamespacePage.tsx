import '../css/header.css'
import '../css/index.css'
import '../css/sidebar.css'
import { Header } from '../components/header.tsx';
import { Sidebar } from '../components/sidebar.tsx';
import { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import { mockDB } from '../mocks/namespace.mocks.ts';
import { LoadPage } from './loadPage.tsx';
import { NamespaceDocuments } from '../components/namespace-documents.tsx';
import type { NamespaceData } from '../interfaces/namespaceData.ts';


// Функция имитации сетевого запроса
async function fetchNamespaceData( namespace: string): Promise<NamespaceData | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (mockDB.has(namespace)) {
        return mockDB.get(namespace)!;
    } else {
        throw new Error('Namespace not found');
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