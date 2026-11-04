import { useCallback, useEffect, useState } from "react";
import { processGameTick } from "./engine/tickSystem";

import { actions } from "./data/actions";
import { areas } from "./data/areas";
import { upgrades } from "./data/upgrades";

import { createGameState } from "./engine/createGameState";
import { performAction } from "./engine/actionSystem";
import { moveToArea } from "./engine/areaSystem";
import { equipItem, unequipSlot } from "./engine/equipmentSystem";
import { consumeInventoryItem } from "./engine/itemSystem";
import { createItemFeedback } from "./utils/itemFeedback";
import {
  getAvailableActions,
  getAreaById,
  getAreaLabel,
  getDiscoveredAreaGroups,
  getDiscoveredResources,
} from "./engine/selectors";
import {
  clearAllSaveSlots,
  clearSaveSlot,
  getSaveSlotSummaries,
  loadGameFromSlot,
  loadLastUsedSave,
  saveGameToSlot,
} from "./engine/saveSystem";
import { purchaseUpgrade } from "./engine/upgradeSystem";

import Topbar from "./components/Topbar";
import MainPage from "./components/MainPage";
import CharacterPage from "./components/CharacterPage";
import QuickOverviewSidebar from "./components/QuickOverviewSidebar";
import SaveSlotModal from "./components/SaveSlotModal";

function App() {
  // UI feedback shares an atomic update with gameplay, but is never saved.
  const [session, setSession] = useState(() => ({
    gameState: loadLastUsedSave() || createGameState(),
    itemFeedback: null,
    feedbackSequence: 0,
  }));
  const { gameState, itemFeedback } = session;

  const setGameState = useCallback((update) => {
    setSession((current) => {
      const nextGameState = typeof update === "function"
        ? update(current.gameState)
        : update;
      return nextGameState === current.gameState
        ? current
        : { ...current, gameState: nextGameState };
    });
  }, []);

  const dismissItemFeedback = useCallback((expectedFeedback = null) => {
    setSession((current) => {
      // An old timer must never dismiss a newer interaction's feedback.
      if (expectedFeedback && current.itemFeedback !== expectedFeedback) {
        return current;
      }
      return { ...current, itemFeedback: null };
    });
  }, []);

  const [activeModal, setActiveModal] = useState(null);
  const [saveSlots, setSaveSlots] = useState(() => getSaveSlotSummaries());
  const [activePage, setActivePage] = useState("main");
  const [characterTab, setCharacterTab] = useState("overview");

  const { player, resources, actionLog, storyLog, unlocks } = gameState;

  const currentArea = getAreaById(areas, player.area);
  const currentAreaLabel = getAreaLabel(areas, player.area);
  const discoveredAreaGroups = getDiscoveredAreaGroups(areas, unlocks);
  const availableActions = getAvailableActions(actions, player.area, unlocks);
  const discoveredResources = getDiscoveredResources(resources);

  useEffect(() => {
    let lastTime = Date.now();

    const intervalId = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      setGameState((currentState) =>
        processGameTick(currentState, deltaSeconds)
      );
    }, 100);

    return () => clearInterval(intervalId);
  }, [setGameState]);

  function addSystemLog(currentState, message) {
    return {
      ...currentState,
      actionLog: [message, ...currentState.actionLog].slice(0, 50),
    };
  }

  function refreshSaveSlots() {
    setSaveSlots(getSaveSlotSummaries());
  }

  function openModal(modalType) {
    dismissItemFeedback();
    refreshSaveSlots();
    setActiveModal(modalType);
  }

  function closeModal() {
    setActiveModal(null);
  }

  function handlePurchaseUpgrade(upgrade) {
    setGameState((currentState) => purchaseUpgrade(currentState, upgrade));
  }

  function handleEquipItem(itemId, preferredSlotId = null) {
    handleItemInteraction("equip", itemId, preferredSlotId);
  }

  function handleUnequipSlot(slotId) {
    handleItemInteraction("unequip", null, slotId);
  }

  function handleUseItem(itemId) {
    handleItemInteraction("use", itemId);
  }

  function handleItemInteraction(type, itemId, slotId = null) {
    setSession((current) => {
      const before = current.gameState;
      const after = type === "use"
        ? consumeInventoryItem(before, itemId)
        : type === "equip"
          ? equipItem(before, itemId, slotId)
          : unequipSlot(before, slotId);
      const feedbackSequence = current.feedbackSequence + 1;

      return {
        gameState: after,
        feedbackSequence,
        itemFeedback: {
          ...createItemFeedback(before, after, { type, itemId, slotId }),
          id: feedbackSequence,
        },
      };
    });
  }

  function handleChangePage(page) {
    dismissItemFeedback();
    setActivePage(page);
  }

  function handleMoveToArea(area) {
    setGameState((currentState) => moveToArea(currentState, area));
  }

  function handleAction(action) {
    setGameState((currentState) => performAction(currentState, action));
  }

  function handleSaveToSlot(slotId) {
    const nextState = addSystemLog(gameState, `Game saved to Slot ${slotId}.`);

    saveGameToSlot(slotId, nextState);
    setGameState(nextState);
    refreshSaveSlots();
    closeModal();
  }

  function handleLoadFromSlot(slotId) {
    const savedState = loadGameFromSlot(slotId);

    if (!savedState) {
      setGameState((currentState) =>
        addSystemLog(currentState, `Slot ${slotId} is empty.`)
      );

      return;
    }

    setGameState(addSystemLog(savedState, `Loaded Slot ${slotId}.`));
    refreshSaveSlots();
    closeModal();
  }

  function handleDeleteSlot(slotId) {
    clearSaveSlot(slotId);
    refreshSaveSlots();

    setGameState((currentState) =>
      addSystemLog(currentState, `Deleted Slot ${slotId}.`)
    );
  }

  function handleResetCurrentGame() {
    const resetState = createGameState();

    setActivePage("main");
    setCharacterTab("overview");
    setGameState(addSystemLog(resetState, "Current game reset."));
    closeModal();
  }

  function handleDeleteAllSaves() {
    clearAllSaveSlots();

    const resetState = createGameState();

    setActivePage("main");
    setCharacterTab("overview");
    setGameState(addSystemLog(resetState, "All save slots deleted."));
    refreshSaveSlots();
    closeModal();
  }

  return (
    <div className="app">
      <Topbar
        activePage={activePage}
        currentAreaLabel={currentAreaLabel}
        player={player}
        onChangePage={handleChangePage}
        onOpenModal={openModal}
      />

      <main
        className={
          activePage === "character"
            ? "game-layout character-layout"
            : "game-layout main-layout"
        }
      >
        {activePage === "main" ? (
          <>
            <MainPage
              player={player}
              resources={resources}
              actionLog={actionLog}
              storyLog={storyLog}
              currentArea={currentArea}
              currentAreaLabel={currentAreaLabel}
              discoveredAreaGroups={discoveredAreaGroups}
              availableActions={availableActions}
              onMoveToArea={handleMoveToArea}
              onAction={handleAction}
            />

            <QuickOverviewSidebar
              player={player}
              resources={resources}
              discoveredResources={discoveredResources}
            />
          </>
        ) : (
          <CharacterPage
            itemFeedback={itemFeedback}
            onDismissItemFeedback={dismissItemFeedback}
            player={player}
            resources={resources}
            gameState={gameState}
            currentAreaLabel={currentAreaLabel}
            upgrades={upgrades}
            activeTab={characterTab}
            onChangeTab={setCharacterTab}
            onPurchaseUpgrade={handlePurchaseUpgrade}
            onEquipItem={handleEquipItem}
            onUnequipSlot={handleUnequipSlot}
            onUseItem={handleUseItem}
          />
        )}
      </main>

      {activeModal && (
        <SaveSlotModal
          mode={activeModal}
          slots={saveSlots}
          onClose={closeModal}
          onSave={handleSaveToSlot}
          onLoad={handleLoadFromSlot}
          onDeleteSlot={handleDeleteSlot}
          onResetCurrentGame={handleResetCurrentGame}
          onDeleteAllSaves={handleDeleteAllSaves}
        />
      )}
    </div>
  );
}

export default App;
