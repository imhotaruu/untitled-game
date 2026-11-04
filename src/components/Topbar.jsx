function Topbar({
  activePage,
  currentAreaLabel,
  player,
  onChangePage,
  onOpenModal,
}) {
  return (
    <header className="topbar">
      <nav className="nav-tabs" aria-label="Main navigation">
        <button
          className={activePage === "main" ? "nav-btn active" : "nav-btn"}
          type="button"
          aria-current={activePage === "main" ? "page" : undefined}
          onClick={() => onChangePage("main")}
        >
          Main
        </button>

        <button
          className={activePage === "character" ? "nav-btn active" : "nav-btn"}
          type="button"
          aria-current={activePage === "character" ? "page" : undefined}
          onClick={() => onChangePage("character")}
        >
          Character
        </button>

        {["Story", "Relationships", "Party", "Codex"].map((label) => (
          <button key={label} className="nav-btn nav-upcoming" type="button" disabled>
            {label}<span>Soon</span>
          </button>
        ))}
      </nav>

      <div className="topbar-right">
        <div className="status-strip" aria-label="Current status">
          <span>Area: {currentAreaLabel}</span>
          <span>{player.day}</span>
          <span>Path: {player.path}</span>
        </div>

        <div className="top-actions">
          <button type="button" onClick={() => onOpenModal("save")}>
            Save
          </button>

          <button type="button" onClick={() => onOpenModal("load")}>
            Load
          </button>

          <button type="button" onClick={() => onOpenModal("reset")}>
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
