export function UpdateIndexModal({
    isOpen,
    onClose,
    onAccept,
    value,
    onChange,
    loading = false,
}: {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    value: string;
    onChange: (v: string) => void;
    loading?: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-window">
                <textarea
                    className="modal-textarea"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Write index here..."
                    onKeyDown={(e) => {
                        if (e.key === "Tab") {
                            e.preventDefault();

                            const text = value;
                            const start = e.currentTarget.selectionStart;
                            const end = e.currentTarget.selectionEnd;

                            const newValue =
                                text.substring(0, start) + "\t" + text.substring(end);

                            onChange(newValue);

                            // вернуть курсор после таба
                            setTimeout(() => {
                                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 1;
                            });
                        }
                    }}
                />

                <div className="modal-buttons">
                    <button className="cancel-button" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>

                    <button className="accept-button" onClick={onAccept} disabled={loading}>
                        {loading ? "Saving..." : "Accept"}
                    </button>
                </div>
            </div>
        </div>
    );
}