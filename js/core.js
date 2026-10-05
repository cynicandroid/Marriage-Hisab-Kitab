const STORAGE = {
  games: "marriage-web-games",
  prefs: "marriage-web-prefs",
};
const defaultPrefs = {
  playerCount: 5,
  names: ["Saroj", "Raj", "Padam", "Prakash", "Pragyan"],
  pointRate: 0.25,
  currency: "USD",
};
export const rates = [0.25, 0.5, 1, 2, 5, 10, 50, 100];
export const currencies = [
  { value: "USD", symbol: "$", label: "Dollar" },
  { value: "NPR", symbol: "Rs.", label: "Nepalese Rupee" },
  { value: "GBP", symbol: "£", label: "Pound" },
  { value: "EUR", symbol: "€", label: "Euro" },
];

export function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export const state = {
  view: "home",
  gameId: null,
  roundId: null,
  games: load(STORAGE.games, []),
  prefs: load(STORAGE.prefs, defaultPrefs),
};

export function save() {
  localStorage.setItem(STORAGE.games, JSON.stringify(state.games));
  localStorage.setItem(STORAGE.prefs, JSON.stringify(state.prefs));
}
export function id() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}
export function money(n) {
  const currency =
    currencies.find((option) => option.value === state.prefs.currency) ||
    currencies[0];
  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(Number(n) || 0));
  return `${Number(n) < 0 ? "-" : ""}${currency.symbol}${amount}`;
}
export function dateLabel(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
export function getGame() {
  return state.games.find((game) => game.id === state.gameId);
}
export function total(game, playerId) {
  return game.rounds.reduce(
    (sum, round) => sum + (round.scores[playerId] || 0),
    0,
  );
}
export function scoreClass(score) {
  return score > 0 ? "positive" : score < 0 ? "negative" : "zero";
}
export function scoreBadge(score) {
  return `<span class="score-number ${scoreClass(score)}">${score > 0 ? "+" : ""}${score}</span>`;
}
export function escape(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ],
  );
}
export function uniqueName() {
  const date = new Date();
  const base = `${date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} Ko Game`;
  return `${base} (${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })})`;
}

let renderer = () => {};
export function setRenderer(render) {
  renderer = render;
}
export function navigate(view, gameId = state.gameId, roundId = null) {
  state.view = view;
  state.gameId = gameId;
  state.roundId = roundId;
  renderer();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
