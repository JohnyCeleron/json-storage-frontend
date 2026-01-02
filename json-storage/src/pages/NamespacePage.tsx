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
    const { namespace } = useParams();
    const location = useLocation();

    useEffect(() => {
        setIsSidebarVisible(false);
    }, [namespace]);

    const title: string = `Namespaces | ${namespace}`;

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