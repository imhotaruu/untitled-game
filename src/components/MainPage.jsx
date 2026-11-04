import { useId, useState } from "react";
import ActionDetails from "./ActionDetails";
import HistoryPanel from "./HistoryPanel";
import StoryPanel from "./StoryPanel";
import Panel from "./ui/Panel";

export default function MainPage({
  player, resources, actionLog, storyLog, currentArea, currentAreaLabel,
  discoveredAreaGroups, availableActions, onMoveToArea, onAction,
}) {
  const [historyRevision, setHistoryRevision] = useState(0);
  const sceneId = useId();

  function showActionHistory() {
    setHistoryRevision((current) => current + 1);
  }

  return <>
    <Panel title="Locations" className="locations-panel">
      <nav className="area-group-list" aria-label="Travel locations">
        {discoveredAreaGroups.map((group) => (
          <div key={group.category} className="area-group">
            <h3>{group.category}</h3>
            <div className="button-list area-button-list">
              {group.areas.map((area) => (
                <button key={area.id} type="button"
                  className={area.id === player.area ? "primary" : ""}
                  aria-current={area.id === player.area ? "location" : undefined}
                  onClick={() => {
                    showActionHistory();
                    onMoveToArea(area);
                  }}>
                  {area.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </Panel>

    <section className="panel scene-panel" aria-labelledby={sceneId}>
      <header className="scene-header-block">
        <div className="scene-heading">
          <h1 id={sceneId}>{currentAreaLabel}</h1>
          <span className="scene-category">{currentArea?.category || "Unknown"}</span>
        </div>
        <p>{currentArea?.description || "You are somewhere unfamiliar. The path ahead is unclear."}</p>
      </header>

      <div className="scene-content-split">
        <ActionButtons key={player.area} actions={availableActions} resources={resources}
          player={player} onAction={(action) => {
            showActionHistory();
            onAction(action);
          }} />

        <StoryPanel entries={storyLog} />
      </div>
    </section>

    <HistoryPanel actionLog={actionLog} resetKey={historyRevision} />
  </>;
}

function ActionButtons({ actions, resources, player, onAction }) {
  const [previewId, setPreviewId] = useState(null);
  const detailsId = useId();
  const preview = actions.find((action) => action.id === previewId);

  return (
    <section className="scene-actions" aria-label="Available actions">
      <h2>Actions</h2>
      <div className="main-action-grid">
        {actions.map((action) => {
          const isResting = Boolean(action.startsResting && player.isResting);
          return (
            <button key={action.id} type="button"
              className={isResting ? "main-action-button primary" : "main-action-button"}
              data-previewed={preview?.id === action.id} disabled={isResting}
              aria-controls={detailsId}
              aria-describedby={preview?.id === action.id ? detailsId : undefined}
              onPointerEnter={() => setPreviewId(action.id)}
              onFocus={() => setPreviewId(action.id)}
              onClick={() => {
                setPreviewId(action.id);
                onAction(action);
              }}>
              {isResting ? "Resting…" : action.label}
            </button>
          );
        })}
      </div>
      {actions.length > 0 ? (
        <div className="action-preview" id={detailsId}>
          {preview ? <>
            <h3>{preview.label}</h3>
            {preview.oneTime && <span className="action-once-label">One-time action</span>}
            <ActionDetails action={preview} resources={resources} />
          </> : <p className="action-preview-hint">Hover or focus an action to see what it does. Click to perform it.</p>}
        </div>
      ) : <p className="empty-note">No actions available here yet. You can visit another location.</p>}
    </section>
  );
}
