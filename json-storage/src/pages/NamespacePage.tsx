import '../css/header.css'
import '../css/index.css'
import '../css/sidebar.css'
import { Header } from '../components/header.tsx';
import { Sidebar } from '../components/sidebar.tsx';
import { useState, useEffect } from 'react';
import { useParams, useLocation} from 'react-router-dom';
import { NamespaceDocuments } from '../components/namespace-documents.tsx';

export function NamespacePage() {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    //const [isLoading, setIsLoading] = useState(true);
    //const [namespaceData, setNamespaceData] = useState<NamespaceData | null>(null);
    //const [error, setError] = useState<string | null>(null);
    
    const { namespace } = useParams();
    const location = useLocation();

    //useEffect(() => {
    //    const loadNamespaceData = async () => {
    //        try {
    //            setIsLoading(true);
    //            setError(null);
    //            const data = await fetchNamespaceData(namespace!);
    //           setNamespaceData(data);
    //        } catch (err) {
    //            setError('Namespace not found');
    //            console.error('Error loading namespace data:', err);
    //        } finally {
    //            setIsLoading(false);
    //        }
    //    };

    //    loadNamespaceData();
    //}, [namespace]);

     useEffect(() => {
        setIsSidebarVisible(false);
    }, [namespace]);

    const title: string = `Namespaces | ${namespace}`;

    // Показываем загрузку
    //if (isLoading) {
    //    return <LoadPage title={title} 
    //    isSidebarVisible={isSidebarVisible}
    //    onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)}
    //    onClose={() => setIsSidebarVisible(false)}/>;
    //}

    // Если namespace не найден - редирект на 404
    //if (error) {
    //    return null;
    //}
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
            <NamespaceDocuments namespaceName={namespace!} key={`${namespace}-${location.key}`}/>
        </div>
    );
}