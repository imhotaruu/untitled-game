export const upgrades = [
  {
    id: "stamina_training",
    label: "Stamina Training",
    description: "Increase max stamina by 2.",
    flavorText: "One more step before you rest. Tomorrow, perhaps one more.",
    maxLevel: 5,
    costs: [
      { herbs: 5 },
      { herbs: 10 },
      { herbs: 15 },
      { herbs: 20 },
      { herbs: 25 },
    ],
    effects: [
      { stat: "maxStamina", amount: 2 },
      { stat: "stamina", amount: 2 },
    ],
  },

  {
    id: "breathing_practice",
    label: "Breathing Practice",
    description: "Increase stamina regeneration by 0.1 per second.",
    flavorText: "You listen to the wind in the leaves and let your breathing settle into its rhythm.",
    maxLevel: 5,
    costs: [
      { herbs: 8 },
      { herbs: 14 },
      { herbs: 20 },
      { herbs: 28 },
      { herbs: 36 },
    ],
    effects: [
      { stat: "staminaRegen", amount: 0.1 },
    ],
  },

  {
    id: "basic_conditioning",
    label: "Basic Conditioning",
    description: "Increase max health by 2.",
    flavorText: "The morning aches linger, but familiar work grows a little easier.",
    maxLevel: 5,
    costs: [
      { herbs: 10 },
      { herbs: 16 },
      { herbs: 24 },
      { herbs: 32 },
      { herbs: 40 },
    ],
    effects: [
      { stat: "maxHp", amount: 2 },
      { stat: "hp", amount: 2 },
    ],
  },
];
