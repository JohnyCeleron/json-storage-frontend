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
                <Button title="Metrics"/>
                <Button title="Logs"/>
                <Button title="Namespaces"/>
            </div>
        </div>
    );
}

function Button({ title }: {title: string}) {
    return (
        <button type="button" className="sidebar-button">
            {title}
        </button>
    );
}