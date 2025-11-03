function BurgerButton( { onClick }: {onClick: () => void}) {
  return <button
        type="button"
        className="header-burger-button"
        onClick={onClick}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <rect x="3" y="6"  width="18" height="2" rx="1" />
          <rect x="3" y="11" width="18" height="2" rx="1" />
          <rect x="3" y="16" width="18" height="2" rx="1" />
        </svg>
      </button>
}

export function Header({
  title,
  onBurgerClick
}: { title: string;
  onBurgerClick: () => void;
} ) {
  return (
    <header className="header-container">
      <BurgerButton onClick={onBurgerClick}/>
      <div className="header-title">{title}</div>
    </header>
  );
}