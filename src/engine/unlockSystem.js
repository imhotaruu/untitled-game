export const unlockRules = [
  {
    id: "unlock_garron_spar",
    type: "action",
    targetId: "spar_with_garron",
    condition: (state) => Boolean(state.unlocks?.systems?.basic_guard),
    log: { type: "unlock", message: "Garron is ready to spar with you at Stonefield House." },
  },
  {
    id: "unlock_training_armor",
    type: "action",
    targetId: "collect_training_armor",
    condition: (state) => Boolean(state.unlocks?.systems?.basic_guard),
    log: { type: "unlock", message: "Garron has training armor for you. Collect it at Stonefield House." },
  },
  {
    id: "unlock_forest_trail",
    type: "area",
    targetId: "forest_trail",
    condition: (state) =>
      (state.progress.actionCounts.explore_forest_edge || 0) >= 3,
    log: "New area unlocked: Forest Trail.",
  },

  {
    id: "unlock_forage_carefully",
    type: "action",
    targetId: "forage_carefully",
    condition: (state) => state.resources.herbs.discovered,
    log: "New action unlocked: Forage Carefully.",
  },
];

function addLog(logList, message) {
  return [message, ...logList].slice(0, 50);
}

export function processUnlocks(state) {
  unlockRules.forEach((rule) => {
    if (state.unlocks.completedRules.includes(rule.id)) return;
    if (!rule.condition(state)) return;

    if (rule.type === "area") {
      state.unlocks.areas[rule.targetId] = true;
    }

    if (rule.type === "action") {
      state.unlocks.actions[rule.targetId] = true;
    }

    state.unlocks.completedRules.push(rule.id);

    if (rule.log) {
      state.actionLog = addLog(state.actionLog, rule.log);
    }
  });

  return state;
}
