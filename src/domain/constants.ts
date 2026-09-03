// Tunable game-balance constants (NFR4). See aidlc-docs/construction/virtual-pet-web-app/functional-design/business-rules.md.

export const STAT_MIN = 0;
export const STAT_MAX = 100;

export const TICK_INTERVAL_MS = 1000;
export const DECAY_PER_TICK = 5;

export const FEED_HUNGER_DELTA = -15;
export const FEED_ENERGY_DELTA = 10;

export const PLAY_HAPPINESS_DELTA = 20;
export const PLAY_HUNGER_DELTA = 15;
export const PLAY_ENERGY_DELTA = -15;

export const REST_DURATION_MS = 10000;
export const REST_ENERGY_REGEN_PER_TICK = 5;

export const HEALTH_DECLINE_PER_TICK = DECAY_PER_TICK;
export const HEALTH_RECOVERY_PER_TICK = 2;

export const CRITICAL_HUNGER_THRESHOLD = 80;
export const CRITICAL_HAPPINESS_THRESHOLD = 20;
export const CRITICAL_ENERGY_THRESHOLD = 20;

export const HAPPY_HUNGER_THRESHOLD = 40;
export const HAPPY_HAPPINESS_THRESHOLD = 60;
export const HAPPY_ENERGY_THRESHOLD = 60;
export const SICK_HEALTH_THRESHOLD = 20;

export const NEW_PET_STARTING_STATS = {
  hunger: 10,
  happiness: 80,
  energy: 80,
  health: 100,
} as const;

export const PET_STATE_STORAGE_KEY = "virtualPet.state.v1";
