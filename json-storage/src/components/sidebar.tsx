export function Sidebar({
    isVisible,
    onClose
}: {
    isVisible: boolean;
    onClose: () => void;
}){
    return (
        <div className={`sidebar-container ${isVisible ? '' : 'sidebar-hidden'}`}>
            <div className="sidebar-top">
                <button className="close-button" onClick={onClose}>
                    <span className="close-glyph">+</span>
                </button>
            </div>
            <div className="sidebar-bottom">
                Содержимое сайдбара
            </div>
        </div>
    );
}