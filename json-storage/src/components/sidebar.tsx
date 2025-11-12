import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const namespaces = [
        "namespace-1",
        "namespace-2",
        "namespace-3",
        "namespace-4"
];

export function Sidebar({
    isVisible,
    onClose
}: {
    isVisible: boolean;
    onClose: () => void;
}){
    const navigate = useNavigate();

    return (
        <div className={`sidebar-container ${isVisible ? '' : 'sidebar-hidden'}`}>
            <div className="sidebar-top">
                <button className="close-button" onClick={onClose}>
                    <span className="close-glyph">+</span>
                </button>
            </div>
            <div className="sidebar-bottom">
                <Button 
                    title="Metrics"
                    onClick={() => navigate('/metrics')}
                />
                <Button 
                    title="Logs"
                    onClick={() => navigate('/logs')}
                />
                <NamespacesButton namespaces={namespaces} />
            </div>
        </div>
    );
}

function NamespacesButton( { namespaces }: {namespaces: string[] } ) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && !(event.target as Element).closest('.namespaces-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="namespaces-container">
            <button type="button" className="sidebar-button" onClick={toggleDropdown}>
                Namespaces
            </button>

            {isOpen && (
                <div className="namespaces-dropdown">
                    {namespaces.map((namespace, index) => (
                        <button key={index} 
                        className="namespace-item"
                        onClick={() => {
                            navigate(`/namespaces/${namespace}`);
                        }}>
                            {namespace}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function Button({ title, onClick }: {title: string, onClick?: () => void}) {
    return (
        <button type="button" className="sidebar-button" onClick={onClick}>
            {title}
        </button>
    );
}