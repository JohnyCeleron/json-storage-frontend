export function Header({
  title,
}: { title: string} ) {
  return (
    <header className="hdr">
      <button
        type="button"
        className="hdr__burger"
        aria-label="Open navigation"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <rect x="3" y="6"  width="18" height="2" rx="1" />
          <rect x="3" y="11" width="18" height="2" rx="1" />
          <rect x="3" y="16" width="18" height="2" rx="1" />
        </svg>
      </button>

      <div className="hdr__title">{title}</div>
    </header>
  );
}