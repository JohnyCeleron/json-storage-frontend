import '../css/header.css'
import '../css/index.css'
import '../css/sidebar.css'
import { Header } from '../components/header.tsx';
import { Sidebar } from '../components/sidebar.tsx';
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { mockDB } from '../mocks/namespace.mocks.ts';


// Функция имитации сетевого запроса
const fetchNamespaceData = async (namespace: string) => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 800));
    
    
    if (mockDB.has(namespace)) {
        return mockDB.get(namespace);
    } else {
        throw new Error('Namespace not found');
    }
};

export function NamespacePage() {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [namespaceData, setNamespaceData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    
    const { namespace } = useParams();

    useEffect(() => {
        const loadNamespaceData = async () => {
            if (!namespace) {
                setError('Namespace not specified');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchNamespaceData(namespace);
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

    // Показываем загрузку
    if (isLoading) {
        return (
            <div>
                <Header 
                    title={`Namespaces | ${namespace}`} 
                    onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)} 
                />
                <Sidebar 
                    isVisible={isSidebarVisible} 
                    onClose={() => setIsSidebarVisible(false)} 
                />
                <main className={`main-content ${isSidebarVisible ? 'with-sidebar' : ''}`}>
                    <div className="page">
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Загрузка документов namespace...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Если namespace не найден - редирект на 404
    if (error) {
        return <Navigate to="/404" replace />;
    }

    return (
        <div>
            <Header 
                title={`Namespaces | ${namespace}`} 
                onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)} 
            />
            <Sidebar 
                isVisible={isSidebarVisible} 
                onClose={() => setIsSidebarVisible(false)} 
            />
            
            <main className={`main-content ${isSidebarVisible ? 'with-sidebar' : ''}`}>
                <div className="page">
                    <div className="namespace-header">
                        <h1>Namespace: {namespace}</h1>
                        <div className="namespace-stats">
                            <span className="stat">Документов: {namespaceData?.count}</span>
                            <span className="stat">Общий размер: {namespaceData ? 
                                Math.round(namespaceData.items.reduce((sum: number, item: any) => sum + item.contentLength, 0) / 1024 * 100) / 100 
                                : 0} KB
                            </span>
                        </div>
                    </div>

                    {namespaceData && (
                        <div className="documents-container">
                            <h2>Документы</h2>
                            <div className="documents-grid">
                                {namespaceData.items.map((doc: any) => (
                                    <div key={doc.id} className="document-card">
                                        <div className="document-header">
                                            <h3 className="document-name">{doc.document_name}</h3>
                                            <span className="document-size">{doc.contentLength} bytes</span>
                                        </div>
                                        <div className="document-details">
                                            <div className="detail-item">
                                                <strong>ID:</strong> {doc.id}
                                            </div>
                                            <div className="detail-item">
                                                <strong>Создан:</strong> {new Date(doc.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="detail-item">
                                                <strong>Обновлен:</strong> {new Date(doc.updatedAt).toLocaleDateString()}
                                            </div>
                                            <div className="detail-item">
                                                <strong>Hash:</strong> 
                                                <span className="hash-value">{doc.contentHash.substring(0, 12)}...</span>
                                            </div>
                                        </div>
                                        <div className="document-actions">
                                            <button className="btn btn-primary">Просмотреть</button>
                                            <button className="btn btn-secondary">Скачать</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}