import {
  getGame,
  id,
  navigate,
  save,
  setRenderer,
  state,
  uniqueName,
} from "./js/core.js";
import { homeView } from "./js/views/home.js";
import { gamesView } from "./js/views/games.js";
import { configView } from "./js/views/config.js";
import { rulesView } from "./js/views/rules.js";
import { scoreboardView } from "./js/views/scoreboard.js";
import { roundView } from "./js/views/round.js";
import { detailView } from "./js/views/detail.js";
import { confirmModal, newGameForm } from "./js/modals.js";

const views = {
  home: homeView,
  games: gamesView,
  config: configView,
  rules: rulesView,
  scoreboard: scoreboardView,
  round: roundView,
  detail: detailView,
};

function render() {
  document
    .querySelectorAll("[data-view]")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.view === state.view),
    );
  document.querySelector("#main-content").innerHTML = views[state.view]();
  bind();
}

function applyTheme() {
  document.documentElement.dataset.theme =
    state.prefs.theme === "dark" ? "dark" : "light";
}
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}
function closeModal() {
  document.querySelector("#modal-root").innerHTML = "";
}
function showNewGame() {
  document.querySelector("#modal-root").innerHTML = newGameForm();
  bind();
}
function showConfirmation(title, copy, action, confirmLabel, cancelLabel) {
  document.querySelector("#modal-root").innerHTML = confirmModal(
    title,
    copy,
    confirmLabel,
    cancelLabel,
  );
  document.querySelector("#confirm-yes").onclick = () => {
    closeModal();
    action();
  };
  bind();
}

function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  if (action === "navigate") navigate(event.currentTarget.dataset.view);
  if (action === "new-game") showNewGame();
  if (action === "close-modal") closeModal();
  if (action === "toggle-theme") {
    state.prefs.theme = state.prefs.theme === "dark" ? "light" : "dark";
    save();
    applyTheme();
    render();
  }
  if (action === "open-game")
    navigate("scoreboard", event.currentTarget.dataset.id);
  if (action === "add-round") navigate("round", state.gameId);
  if (action === "cancel-round")
    showConfirmation(
      "Are you sure you want to cancel?",
      "Any changes made to this round will be lost.",
      () => navigate("scoreboard", state.gameId),
      "Yes",
      "No",
    );
  if (action === "open-round")
    navigate("detail", state.gameId, event.currentTarget.dataset.id);
  if (action === "delete-game") {
    const gameId = event.currentTarget.dataset.gameId || state.gameId;
    showConfirmation(
      "Hisab Kitab Sabai Sakiyo?",
      "Are you sure you want to delete this game? All rounds and scores will be removed.",
      () => {
        state.games = state.games.filter((game) => game.id !== gameId);
        save();
        if (state.gameId === gameId) navigate("home", null);
        else render();
      },
      "Yes",
      "No",
    );
  }
  if (action === "delete-round")
    showConfirmation(
      "Delete this round?",
      "Are you sure you want to delete this round? The round numbers that follow will be recalculated.",
      () => {
        const game = getGame();
        game.rounds = game.rounds.filter((round) => round.id !== state.roundId);
        game.rounds.forEach((round, index) => {
          round.number = index + 1;
        });
        save();
        navigate("scoreboard", game.id);
      },
      "Delete",
      "Cancel",
    );
  if (action === "edit-round")
    showConfirmation(
      "Are you sure you want to recalculate maal?",
      "The saved scores for this round will be replaced when you calculate it again.",
      () => {
        state.view = "round";
        render();
      },
      "Yes",
      "No",
    );
  if (action === "share") shareGame();
}

function bind() {
  document
    .querySelectorAll("[data-action]")
    .forEach((element) => element.addEventListener("click", handleAction));
  document.querySelectorAll("[data-pref-name]").forEach((element) =>
    element.addEventListener("input", () => {
      state.prefs.names[Number(element.dataset.prefName)] = element.value;
      save();
    }),
  );
  document
    .querySelectorAll("[data-setting-trigger]")
    .forEach((element) => element.addEventListener("click", toggleSettingMenu));
  document
    .querySelectorAll("[data-setting-option]")
    .forEach((element) =>
      element.addEventListener("click", selectSettingOption),
    );
  document
    .querySelectorAll("[data-currency-option]")
    .forEach((element) => element.addEventListener("click", selectCurrency));
  document
    .querySelector("#player-count")
    ?.addEventListener("change", resizePlayerFields);
  document
    .querySelector("#new-game-form")
    ?.addEventListener("submit", createGame);
  document.querySelector("#round-form")?.addEventListener("submit", saveRound);
  document
    .querySelector("[data-winner-trigger]")
    ?.addEventListener("click", toggleWinnerMenu);
  document
    .querySelectorAll("[data-winner-option]")
    .forEach((element) =>
      element.addEventListener("click", selectWinnerOption),
    );
  document
    .querySelectorAll("[data-status]")
    .forEach((element) => element.addEventListener("click", statusClick));
  document
    .querySelectorAll("[data-step]")
    .forEach((element) => element.addEventListener("click", stepClick));
}

function resizePlayerFields(event) {
  const form = document.querySelector("#new-game-form");
  const existing = [...form.querySelectorAll('[name^="player-"]')].map(
    (input) => input.value,
  );
  const count = Number(event.target.value);
  document.querySelector("#new-player-fields").innerHTML = Array.from(
    { length: count },
    (_, index) =>
      `<div class="field"><label>Player ${index + 1}</label><input name="player-${index}" value="${existing[index] || `Player ${index + 1}`}" required /></div>`,
  ).join("");
}

function toggleSettingMenu(event) {
  const preference = event.currentTarget.dataset.settingTrigger;
  const menu = document.querySelector(`[data-setting-menu="${preference}"]`);
  const open = menu.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
}
function selectSettingOption(event) {
  const option = event.currentTarget;
  const preference = option.dataset.settingOption;
  state.prefs[preference] = Number(option.dataset.value);
  save();
  document.querySelector(
    `[data-setting-trigger="${preference}"] .setting-picker-value`,
  ).textContent = option.dataset.label;
  document
    .querySelector(`[data-setting-trigger="${preference}"]`)
    .setAttribute("aria-expanded", "false");
  document
    .querySelector(`[data-setting-menu="${preference}"]`)
    .classList.remove("open");
  document
    .querySelectorAll(`[data-setting-option="${preference}"]`)
    .forEach((item) => {
      const selected = item === option;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-selected", String(selected));
      item.querySelector(".winner-option-check").textContent = selected
        ? "✓"
        : "";
    });
  document.querySelector("#save-note")?.classList.add("visible");
}

function selectCurrency(event) {
  state.prefs.currency = event.currentTarget.dataset.currencyOption;
  save();
  render();
}

function toggleWinnerMenu() {
  const trigger = document.querySelector("[data-winner-trigger]");
  const menu = document.querySelector("[data-winner-menu]");
  const open = menu.classList.toggle("open");
  trigger.setAttribute("aria-expanded", String(open));
}
function selectWinnerOption(event) {
  const option = event.currentTarget;
  const playerId = option.dataset.winnerOption;
  const playerName =
    option
      .querySelector("span:nth-child(2)")
      ?.firstChild?.textContent?.trim() || "Winner";
  const trigger = document.querySelector("[data-winner-trigger]");
  const menu = document.querySelector("[data-winner-menu]");
  document.querySelector("#winner").value = playerId;
  trigger.classList.add("has-value");
  trigger.innerHTML = `<span class="winner-trigger-person"><span class="winner-trigger-avatar">${playerName.charAt(0).toUpperCase()}</span><span><small>Winning player</small><strong>${playerName}</strong></span></span><span class="winner-trigger-chevron">⌄</span>`;
  menu.classList.remove("open");
  trigger.setAttribute("aria-expanded", "false");
  document
    .querySelector('#round-form button[type="submit"]')
    ?.removeAttribute("disabled");
  document.querySelector(".calculate-hint")?.setAttribute("hidden", "");
  document.querySelectorAll("[data-winner-option]").forEach((item) => {
    const selected = item.dataset.winnerOption === playerId;
    item.classList.toggle("selected", selected);
    item.setAttribute("aria-selected", String(selected));
    item.querySelector(".winner-option-check").textContent = selected
      ? "✓"
      : "";
    item.querySelector("small").textContent = selected
      ? "Current winner"
      : "Choose as winner";
  });
  setWinnerSeen(playerId);
  document.querySelectorAll("[data-player-card]").forEach((card) => {
    const selected = card.dataset.playerCard === playerId;
    card.classList.toggle("is-winner", selected);
    const label = card.querySelector(".winner-label");
    if (selected && !label)
      card
        .querySelector(".player-top")
        .insertAdjacentHTML(
          "beforeend",
          '<span class="winner-label">♛ Winner</span>',
        );
    if (!selected && label) label.remove();
  });
}
function setWinnerSeen(playerId) {
  const card = document.querySelector(`[data-player-card="${playerId}"]`);
  if (card && card.dataset.status !== "seen")
    card.querySelector('[data-status="seen"]')?.click();
}
function statusClick(event) {
  const card = event.currentTarget.closest("[data-player-card]");
  const seen = event.currentTarget.dataset.status === "seen";
  card.dataset.status = seen ? "seen" : "unseen";
  if (!seen) card.querySelector("[data-maal]").textContent = "0";
  card
    .querySelectorAll("[data-status]")
    .forEach((button) =>
      button.classList.toggle(
        "selected",
        button.dataset.status === event.currentTarget.dataset.status,
      ),
    );
  card.querySelector('[data-status="seen"]').classList.toggle("seen", seen);
  card
    .querySelector('[data-status="unseen"]')
    .classList.toggle("unseen", !seen);
  card.querySelectorAll("[data-step], [data-dubli]").forEach((control) => {
    control.disabled = !seen;
  });
  card.querySelector(".stepper")?.setAttribute("data-tooltip", seen ? "" : "Only Seen players can have Maal points.");
  if (!seen) card.querySelector("[data-dubli]").checked = false;
}
function stepClick(event) {
  const card = event.currentTarget.closest("[data-player-card]");
  if (event.currentTarget.disabled) return;
  const value = Math.max(
    0,
    Math.min(
      100,
      Number(card.querySelector("[data-maal]").textContent) +
        Number(event.currentTarget.dataset.step),
    ),
  );
  card.querySelector("[data-maal]").textContent = value;
}

function createGame(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const count = Number(form.get("count"));
  const game = {
    id: id(),
    name: String(form.get("name")).trim() || uniqueName(),
    players: Array.from({ length: count }, (_, index) => ({
      id: id(),
      name: String(form.get(`player-${index}`)).trim() || `Player ${index + 1}`,
    })),
    settings: {
      pointRate: Number(form.get("rate")),
      seenPoint: Number(form.get("seen")),
      unseenPoint: Number(form.get("unseen")),
    },
    rounds: [],
    createdAt: new Date().toISOString(),
  };
  state.games.unshift(game);
  save();
  closeModal();
  navigate("scoreboard", game.id);
  showToast("Game started");
}

function saveRound(event) {
  event.preventDefault();
  const game = getGame();
  const form = new FormData(event.target);
  const winnerId = form.get("winner");
  if (!winnerId) return;
  const entries = [...document.querySelectorAll("[data-player-card]")].map(
    (card) => ({
      playerId: card.dataset.playerCard,
      maalPoints: Number(card.querySelector("[data-maal]").textContent),
      status:
        card.querySelector("[data-status].selected")?.dataset.status ||
        "unseen",
      dubli: card.querySelector("[data-dubli]").checked,
    }),
  );
  if (!entries.some((entry) => entry.status === "seen")) {
    showToast("At least one player must be Seen");
    return;
  }
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
            (entry.dubli ? 0 : game.settings.seenPoint)
          : totalMaal + game.settings.unseenPoint;
      scores[entry.playerId] = -loss;
      winnerGain += loss;
    });
  scores[winnerId] = winnerGain;
  const editingId = event.target.dataset.editing;
  const existing = editingId
    ? game.rounds.find((round) => round.id === editingId)
    : null;
  const round = {
    id: editingId || id(),
    number: existing?.number || game.rounds.length + 1,
    winnerId,
    entries,
    scores,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  if (existing) game.rounds[game.rounds.indexOf(existing)] = round;
  else game.rounds.push(round);
  save();
  navigate("scoreboard", game.id);
  showToast("Round calculated");
}

function shareGame() {
  const game = getGame();
  const text = `${game.name} — Marriage Scoreboard\n\n${game.players.map((player) => `${player.name}: ${game.rounds.reduce((sum, round) => sum + (round.scores[player.id] || 0), 0)}`).join("\n")}`;
  if (navigator.share) navigator.share({ title: game.name, text });
  else
    navigator.clipboard
      ?.writeText(text)
      .then(() => showToast("Scoreboard copied"));
}

function setupInstallPrompt() {
  let installPrompt;
  const installButton = document.querySelector("#install-button");
  if (!installButton) return;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener("click", async () => {
    if (!installPrompt) {
      showToast(
        "Use your browser menu to install or add Marriage Hisab Kitab to your home screen.",
      );
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton.hidden = true;
  });
}

setRenderer(render);
applyTheme();
render();
setupInstallPrompt();
