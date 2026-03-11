import { normalizeGameState, serializeGameState } from "./gameState";

export const GAME_STORAGE_KEY = "life-game-state-v1";

export const loadGameState = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = window.localStorage.getItem(GAME_STORAGE_KEY);
  if (!saved) {
    return null;
  }

  try {
    return normalizeGameState(JSON.parse(saved));
  } catch {
    return null;
  }
};

export const saveGameState = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GAME_STORAGE_KEY, serializeGameState(state));
};

export const clearGameState = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(GAME_STORAGE_KEY);
};

export const downloadGameState = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([serializeGameState(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "life-game-state.json";
  link.click();
  URL.revokeObjectURL(url);
};
