const STORAGE = {
  games: "marriage-web-games",
  prefs: "marriage-web-prefs",
};
export const APP_NAME = "Marriage Hisab Kitab";
export const CACHE_VERSION = globalThis.MARRIAGE_CACHE_VERSION || "unknown";
const defaultPrefs = {
  playerCount: 5,
  names: ["Saroj", "Raj", "Padam", "Prakash", "Pragyan"],
  callBreakUseDefaultNames: false,
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

function load(key, fallback) {
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

const views = new Set([
  "home",
  "games",
  "config",
  "rules",
  "scoreboard",
  "round",
  "detail",
]);

function routeHash(view, gameId, roundId) {
  return `#/${[view, gameId, roundId]
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
}

export function restoreNavigation() {
  let parts;
  try {
    parts = window.location.hash
      .replace(/^#\/?/, "")
      .split("/")
      .filter(Boolean)
      .map((part) => decodeURIComponent(part));
  } catch {
    parts = [];
  }
  const [view, gameId = null, roundId = null] = parts;

  if (!views.has(view)) {
    state.view = "home";
    state.gameId = null;
    state.roundId = null;
    return;
  }

  state.view = view;
  state.gameId = gameId;
  state.roundId = roundId;
}

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
export function calculateRoundScores(entries, settings, winnerId) {
  const totalMaal = entries.reduce((sum, entry) => sum + entry.maalPoints, 0);
  const scores = Object.fromEntries(
    entries.map((entry) => [entry.playerId, 0]),
  );
  let winnerGain = 0;

  entries
    .filter((entry) => entry.playerId !== winnerId)
    .forEach((entry) => {
      const loss =
        entry.status === "seen"
          ? totalMaal -
            entry.maalPoints * entries.length +
            (entry.dubli ? 0 : settings.seenPoint)
          : totalMaal + settings.unseenPoint;
      scores[entry.playerId] = -loss;
      winnerGain += loss;
    });

  scores[winnerId] = winnerGain;
  return scores;
}
export function calculateCallBreakScores(entries) {
  return Object.fromEntries(
    entries.map((entry) => {
      const call = Number(entry.call) || 0;
      const wins = Number(entry.wins) || 0;
      const score = wins < call ? -call : call + (wins - call) * 0.1;
      return [entry.playerId, Math.round(score * 10) / 10];
    }),
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
export function uniqueName(gameType = "marriage") {
  const date = new Date();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.toLocaleDateString("en-US", { day: "numeric" });
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const gameLabel = gameType === "call-break" ? "Call-Break" : "Marriage";
  return `${month}, ${day} ${gameLabel} (${time})`;
}

let renderer = () => {};
export function setRenderer(render) {
  renderer = render;
}
export function navigate(view, gameId = state.gameId, roundId = null) {
  state.view = view;
  state.gameId = gameId;
  state.roundId = roundId;
  history.replaceState(null, "", routeHash(view, gameId, roundId));
  renderer();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
