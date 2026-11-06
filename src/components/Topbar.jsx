function Topbar({
  activePage,
  currentAreaLabel,
  player,
  onChangePage,
  onOpenModal,
}) {
  const isMainPage = activePage === "main";
  return (
    <header className={isMainPage ? "topbar" : "page-toolbar"}>
      {isMainPage ? <nav className="nav-tabs" aria-label="Main navigation">
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

        <button className="nav-btn nav-upcoming" type="button" disabled>
          Story<span>Soon</span>
        </button>
        <button
          className={activePage === "relationships" ? "nav-btn active" : "nav-btn"}
          type="button"
          aria-current={activePage === "relationships" ? "page" : undefined}
          onClick={() => onChangePage("relationships")}
        >Relationships</button>
        {["Party", "Codex"].map((label) => (
          <button key={label} className="nav-btn nav-upcoming" type="button" disabled>
            {label}<span>Soon</span>
          </button>
        ))}
      </nav> : <nav aria-label="Return navigation">
        <button className="back-to-main" type="button" onClick={() => onChangePage("main")}>
          <span aria-hidden="true">←</span> Back to Main
        </button>
      </nav>}

      <div className="topbar-right">
        {isMainPage && <div className="status-strip" aria-label="Current status">
          <span>Area: {currentAreaLabel}</span>
          <span>{player.day}</span>
          <span>Path: {player.path}</span>
        </div>}

        <div className="top-actions">
          <button type="button" aria-haspopup="dialog" onClick={() => onOpenModal("settings")}>
            Settings
          </button>
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
