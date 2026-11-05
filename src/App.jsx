import { useCallback, useEffect, useState } from "react";
import { processGameTick } from "./engine/tickSystem";

import { actions } from "./data/actions";
import { areas } from "./data/areas";
import { upgrades } from "./data/upgrades";

import { createGameState } from "./engine/createGameState";
import { performAction } from "./engine/actionSystem";
import { dismissCombat, performCombatMove } from "./engine/combatSystem";
import { moveToArea } from "./engine/areaSystem";
import { equipItem, unequipSlot } from "./engine/equipmentSystem";
import { consumeInventoryItem } from "./engine/itemSystem";
import { createItemFeedback } from "./utils/itemFeedback";
import { createUpgradeFeedback } from "./utils/upgradeFeedback";
import { createGatheringFeedback } from "./utils/gatheringFeedback";
import { getGatheringResourceIds, hasGatheringMastery } from "./engine/gatheringSystem";
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
import BattleConfirmModal from "./components/BattleConfirmModal";
import CombatScreen from "./components/CombatScreen";
import SettingsModal from "./components/SettingsModal";
import ItemFeedbackPopup from "./components/ItemFeedbackPopup";
import { loadPreferences, normalizePreferences, savePreferences } from "./utils/preferences";

function App() {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [preferencesSaved, setPreferencesSaved] = useState(true);
  const reducedMotion = preferences.motion === "reduced";

  function handlePreferencesChange(next) {
    const normalized = normalizePreferences(next);
    setPreferences(normalized);
    setPreferencesSaved(savePreferences(normalized));
  }

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
  const [pendingBattleId, setPendingBattleId] = useState(null);
  const [focusActionId, setFocusActionId] = useState(null);
  const pendingBattle = actions.find((action) => action.id === pendingBattleId);

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
    setPendingBattleId(null);
    dismissItemFeedback();
    if (modalType !== "settings") refreshSaveSlots();
    setActiveModal(modalType);
  }

  function closeModal() {
    setActiveModal(null);
  }

  function handlePurchaseUpgrade(upgrade) {
    setSession((current) => {
      const before = current.gameState;
      const after = purchaseUpgrade(before, upgrade);
      const feedbackSequence = current.feedbackSequence + 1;
      return {
        gameState: after,
        feedbackSequence,
        itemFeedback: { ...createUpgradeFeedback(before, after, upgrade.id), id: feedbackSequence },
      };
    });
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
    if (gameState.combat && page !== "main") return;
    dismissItemFeedback();
    setFocusActionId(null);
    setActivePage(page);
  }

  function handleMoveToArea(area) {
    dismissItemFeedback();
    setFocusActionId(null);
    setGameState((currentState) => moveToArea(currentState, area));
  }

  function handleAction(action) {
    if (action.encounterId) {
      dismissItemFeedback();
      setPendingBattleId(action.id);
      return;
    }
    const criticalRolls = Object.fromEntries(getGatheringResourceIds(action).map((id) => [id, Math.random()]));
    setSession((current) => {
      const after = performAction(current.gameState, action, { criticalRolls });
      const feedback = createGatheringFeedback(current.gameState, after, action);
      if (!feedback) return { ...current, gameState: after };
      const feedbackSequence = current.feedbackSequence + 1;
      return { gameState: after, feedbackSequence, itemFeedback: { ...feedback, id: feedbackSequence } };
    });
  }

  function handleConfirmBattle() {
    if (!pendingBattle) return;
    const seed = Date.now();
    setGameState((currentState) => performAction(currentState, pendingBattle, { seed }));
    setPendingBattleId(null);
    setFocusActionId(null);
  }

  function handleCombatMove(moveId) {
    setGameState((currentState) => performCombatMove(currentState, moveId));
  }

  function handleDismissCombat() {
    setFocusActionId(actions.find((action) => action.encounterId === gameState.combat?.encounterId)?.id || null);
    setActivePage("main");
    setGameState(dismissCombat);
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
    if (characterTab === "mastery" && !hasGatheringMastery(savedState)) setCharacterTab("overview");
    setFocusActionId(null);
    setPendingBattleId(null);
    if (savedState.combat) setActivePage("main");
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
    setFocusActionId(null);
    setPendingBattleId(null);
    const resetState = createGameState();

    setActivePage("main");
    setCharacterTab("overview");
    setGameState(addSystemLog(resetState, "Current game reset."));
    closeModal();
  }

  function handleDeleteAllSaves() {
    setFocusActionId(null);
    setPendingBattleId(null);
    clearAllSaveSlots();

    const resetState = createGameState();

    setActivePage("main");
    setCharacterTab("overview");
    setGameState(addSystemLog(resetState, "All save slots deleted."));
    refreshSaveSlots();
    closeModal();
  }

  return (
    <div className={gameState.combat ? "app app-combat" : "app"} data-reduced-motion={reducedMotion}>
      {gameState.combat ? <CombatScreen
        combatPace={preferences.combatPace}
        reducedMotion={reducedMotion}
        magicUnlocked={Boolean(gameState.unlocks?.systems?.magic)}
        inventory={gameState.inventory}
        combat={gameState.combat}
        areaLabel={currentAreaLabel}
        onMove={handleCombatMove}
        onDismiss={handleDismissCombat}
        onOpenModal={openModal}
      /> : <>
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
              gatheringMastery={gameState.gatheringMastery}
              focusActionId={focusActionId}
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

          </>
        ) : (
          <CharacterPage
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
        <QuickOverviewSidebar
          player={player}
          resources={resources}
          discoveredResources={discoveredResources}
        />
      </main>
      </>}

      <ItemFeedbackPopup feedback={itemFeedback} onDismiss={dismissItemFeedback} />

      {pendingBattle && !gameState.combat && <BattleConfirmModal
        action={pendingBattle}
        onConfirm={handleConfirmBattle}
        onCancel={() => setPendingBattleId(null)}
      />}

      {activeModal === "settings" && <SettingsModal
        preferences={preferences}
        saved={preferencesSaved}
        onChange={handlePreferencesChange}
        onClose={closeModal}
      />}

      {activeModal && activeModal !== "settings" && (
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
