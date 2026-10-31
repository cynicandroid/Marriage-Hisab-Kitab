import {
  escape,
  calculateRoundScores,
  calculateCallBreakScores,
  getGame,
  id,
  navigate,
  restoreNavigation,
  save,
  setRenderer,
  state,
  total,
  uniqueName,
} from "./js/core.js";
import { homeView } from "./js/views/home.js";
import { gamesView } from "./js/views/games.js";
import { configView } from "./js/views/config.js";
import { rulesView } from "./js/views/rules.js";
import { scoreboardView } from "./js/views/scoreboard.js";
import { roundView } from "./js/views/round.js";
import { detailView } from "./js/views/detail.js";
import { confirmModal, editGameForm, newGameForm } from "./js/modals.js";

let stopActiveStepperHold = null;
let lastFocusedElement = null;
[
  "pointerup",
  "pointercancel",
  "touchend",
  "touchcancel",
].forEach((eventName) =>
  window.addEventListener(eventName, () => stopActiveStepperHold?.(), true),
);
window.addEventListener("blur", () => stopActiveStepperHold?.());

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
  if (lastFocusedElement?.isConnected) lastFocusedElement.focus();
  else document.querySelector("#main-content")?.focus?.();
  lastFocusedElement = null;
}
function showNewGame(gameType = "marriage") {
  lastFocusedElement = document.activeElement;
  document.querySelector("#modal-root").innerHTML = newGameForm(gameType);
  bind();
  document.querySelector("#new-game-form input")?.focus();
}
function showEditGame() {
  const game = getGame();
  if (!game) return;
  lastFocusedElement = document.activeElement;
  document.querySelector("#modal-root").innerHTML = editGameForm(game);
  bind();
  document.querySelector("#edit-game-form input")?.focus();
}
function showConfirmation(title, copy, action, confirmLabel, cancelLabel) {
  lastFocusedElement = document.activeElement;
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
  document.querySelector("#confirm-yes")?.focus();
}

function focusable(container) {
  return [...container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => element.offsetParent !== null);
}

function closeOpenMenus() {
  document.querySelectorAll(".setting-picker-menu.open, .winner-picker-menu.open").forEach((menu) => {
    menu.classList.remove("open");
    const trigger = menu.previousElementSibling;
    trigger?.setAttribute("aria-expanded", "false");
  });
}

function handleKeyboard(event) {
  const modal = document.querySelector(".modal");
  if (modal) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key === "Tab") {
      const elements = focusable(modal);
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    return;
  }

  const openMenu = document.querySelector(
    ".setting-picker-menu.open, .winner-picker-menu.open, .setting-picker-menu:focus-within, .winner-picker-menu:focus-within",
  );
  if (event.key === "Escape") {
    if (openMenu) {
      event.preventDefault();
      closeOpenMenus();
    }
    return;
  }
  if (!openMenu || !["ArrowDown", "ArrowUp"].includes(event.key)) return;
  const options = focusable(openMenu);
  if (!options.length) return;
  event.preventDefault();
  const current = options.indexOf(document.activeElement);
  const next = event.key === "ArrowDown"
    ? (current + 1) % options.length
    : (current - 1 + options.length) % options.length;
  options[next].focus();
}

document.addEventListener("keydown", handleKeyboard);

function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  if (action === "navigate") navigate(event.currentTarget.dataset.view);
  if (action === "new-game") showNewGame();
  if (action === "new-call-break-game") showNewGame("call-break");
  if (action === "edit-game") showEditGame();
  if (action === "close-modal") closeModal();
  if (action === "toggle-theme") {
    state.prefs.theme = state.prefs.theme === "dark" ? "light" : "dark";
    save();
    applyTheme();
    render();
  }
  if (action === "open-game")
    navigate("scoreboard", event.currentTarget.dataset.id);
  if (action === "calculate-call-break-round")
    navigate("round", state.gameId, event.currentTarget.dataset.id);
  if (action === "keep-playing") {
    const game = getGame();
    if (game?.type === "call-break") {
      game.settings.allowExtraRounds = true;
      save();
      render();
    }
  }
  if (action === "add-round") {
    const game = getGame();
    if (game?.type === "call-break" && game.rounds.some((round) => round.status === "calls")) {
      showToast("Enter wins for the saved haats before starting another round");
      return;
    }
    if (game?.type === "call-break" && !game.settings.allowExtraRounds && game.rounds.length >= game.settings.numberOfRounds) {
      showToast(`This game is limited to ${game.settings.numberOfRounds} rounds`);
    } else navigate("round", state.gameId);
  }
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
      getGame()?.type === "call-break" ? "Edit this Call-Break round?" : "Are you sure you want to recalculate maal?",
      getGame()?.type === "call-break" ? "The haats and wins for this round can be updated before recalculating." : "The saved scores for this round will be replaced when you calculate it again.",
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
  document.querySelector("[data-call-break-default-names]")?.addEventListener("change", (event) => {
    state.prefs.callBreakUseDefaultNames = event.currentTarget.checked;
    save();
  });
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
    .querySelectorAll("[data-new-game-trigger]")
    .forEach((element) => element.addEventListener("click", toggleNewGameMenu));
  document
    .querySelectorAll("[data-new-game-option]")
    .forEach((element) => element.addEventListener("click", selectNewGameOption));
  document
    .querySelector("#new-game-form")
    ?.addEventListener("submit", createGame);
  document
    .querySelector("#edit-game-form")
    ?.addEventListener("submit", updateGame);
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
    .querySelectorAll("[data-call-option]")
    .forEach((element) => element.addEventListener("click", selectCallOption));
  document
    .querySelectorAll("[data-wins-option]")
    .forEach((element) => element.addEventListener("click", selectWinsOption));
  document
    .querySelectorAll("[data-reorder-player]")
    .forEach((element) => element.addEventListener("click", reorderCallBreakPlayer));
  document
    .querySelectorAll(".status-toggle")
    .forEach((element) => element.addEventListener("click", statusClick));
  document
    .querySelectorAll("[data-step]")
    .forEach((element) => element.addEventListener("click", stepClick));
  document.querySelectorAll('.stepper [data-step="-1"], .stepper [data-step="1"]')
    .forEach((element) => {
      let holdTimer;
      let repeatTimer;
      const stopHolding = () => {
        clearTimeout(holdTimer);
        clearInterval(repeatTimer);
        if (stopActiveStepperHold === stopHolding)
          stopActiveStepperHold = null;
      };
      element.addEventListener("pointerdown", (event) => {
        if (element.disabled || !event.isPrimary || event.button !== 0) return;
        stopActiveStepperHold?.();
        stopActiveStepperHold = stopHolding;
        element.setPointerCapture?.(event.pointerId);
        holdTimer = setTimeout(() => {
          repeatTimer = setInterval(() => stepClick({ currentTarget: element }), 90);
        }, 450);
      });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) =>
        element.addEventListener(eventName, stopHolding),
      );
    });
}

function toggleNewGameMenu(event) {
  const name = event.currentTarget.dataset.newGameTrigger;
  const menu = document.querySelector(`[data-new-game-menu="${name}"]`);
  const open = menu.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
}
function selectNewGameOption(event) {
  const option = event.currentTarget;
  const name = option.dataset.newGameOption;
  const form = event.currentTarget.closest("form");
  form.elements[name].value = option.dataset.value;
  document.querySelector(`[data-new-game-trigger="${name}"] .setting-picker-value`).textContent = option.dataset.label;
  document.querySelector(`[data-new-game-menu="${name}"]`).classList.remove("open");
  document.querySelector(`[data-new-game-trigger="${name}"]`).setAttribute("aria-expanded", "false");
  document.querySelectorAll(`[data-new-game-option="${name}"]`).forEach((item) => {
    const selected = item === option;
    item.classList.toggle("selected", selected);
    item.setAttribute("aria-selected", String(selected));
    item.querySelector(".winner-option-check").textContent = selected ? "✓" : "";
  });
  if (name === "count") resizePlayerFields(form, Number(option.dataset.value));
}
function resizePlayerFields(form, count) {
  const existing = [...form.querySelectorAll('[name^="player-"]')].map(
    (input) => input.value,
  );
  const canReorder = form.id === "new-game-form";
  document.querySelector(`#${form.id === "edit-game-form" ? "edit" : "new"}-player-fields`).innerHTML = Array.from(
    { length: count },
    (_, index) =>
      `<div class="field new-game-row ${canReorder ? "reorderable-player-row" : ""}"><label>Player <span data-player-position>${index + 1}</span></label><input name="player-${index}" value="${escape(existing[index] || `Player ${index + 1}`)}" required />${canReorder ? `<div class="player-reorder-controls"><button type="button" class="icon-button" data-reorder-player="up" aria-label="Move player up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" class="icon-button" data-reorder-player="down" aria-label="Move player down" ${index === count - 1 ? "disabled" : ""}>↓</button></div>` : ""}</div>`,
  ).join("");
}

function toggleSettingMenu(event) {
  const preference = event.currentTarget.dataset.settingTrigger;
  const menu = document.querySelector(`[data-setting-menu="${preference}"]`);
  const open = menu.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
  if (open) menu.querySelector("[role=option]")?.focus();
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
  if (open) menu.querySelector("[role=option]")?.focus();
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
  trigger.innerHTML = `<span class="winner-trigger-person"><span class="winner-trigger-avatar">${playerName.charAt(0).toUpperCase()}</span><span><strong>${playerName}</strong></span></span><span class="winner-trigger-chevron">⌄</span>`;
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
          '<span class="winner-label">♛ W</span>',
        );
    if (!selected && label) label.remove();
  });
}

function selectCallOption(event) {
  const option = event.currentTarget;
  const card = option.closest("[data-player-card]");
  const input = card?.querySelector("[data-call]");
  if (!card || !input) return;
  input.value = option.dataset.callOption;
  card.querySelectorAll("[data-call-option]").forEach((button) => {
    const selected = button === option;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const total = [...document.querySelectorAll("[data-call]")].reduce(
    (sum, call) => sum + (Number(call.value) || 0),
    0,
  );
  document.querySelector("[data-total-calls]").textContent = total;
  const allCallsSelected = [...document.querySelectorAll("[data-call]")].every(
    (call) => call.value,
  );
  document
    .querySelector('#round-form[data-phase="calls"] button[type="submit"]')
    ?.toggleAttribute("disabled", !allCallsSelected);
}

function selectWinsOption(event) {
  const option = event.currentTarget;
  const card = option.closest("[data-player-card]");
  const input = card?.querySelector("[data-wins]");
  if (!card || !input) return;
  input.value = option.dataset.winsOption;
  card.querySelectorAll("[data-wins-option]").forEach((button) => {
    const selected = button === option;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const allWinsSelected = [...document.querySelectorAll("[data-wins]")].every(
    (wins) => wins.value !== "",
  );
  const totalWins = [...document.querySelectorAll("[data-wins]")].reduce(
    (sum, wins) => sum + (Number(wins.value) || 0),
    0,
  );
  document.querySelector("[data-total-wins]").textContent = totalWins;
  document
    .querySelector('#round-form[data-phase="calculate"] button[type="submit"]')
    ?.toggleAttribute("disabled", !allWinsSelected || totalWins !== 13);
  const calculateButton = document.querySelector('#round-form[data-phase="calculate"] button[type="submit"]');
  if (calculateButton) {
    calculateButton.title = totalWins === 13
      ? ""
      : `Total points won is ${totalWins} and not 13 in total`;
  }
}

function reorderCallBreakPlayer(event) {
  const button = event.currentTarget;
  const row = button.closest("[data-player-row]") || button.closest(".new-game-row");
  const direction = button.dataset.reorderPlayer;
  if (!row) return;
  const sibling = direction === "up" ? row.previousElementSibling : row.nextElementSibling;
  if (!sibling) return;
  if (direction === "up") row.parentNode.insertBefore(row, sibling);
  else row.parentNode.insertBefore(sibling, row);

  [...row.parentNode.children].forEach((playerRow, index) => {
    const input = playerRow.querySelector('input[name^="player-"]');
    const position = playerRow.querySelector("[data-player-position]");
    const up = playerRow.querySelector('[data-reorder-player="up"]');
    const down = playerRow.querySelector('[data-reorder-player="down"]');
    if (!input) return;
    input.name = `player-${index}`;
    if (position) position.textContent = index + 1;
    if (up) up.disabled = index === 0;
    if (down) down.disabled = index === row.parentNode.children.length - 1;
  });
}
function setWinnerSeen(playerId) {
  const card = document.querySelector(`[data-player-card="${playerId}"]`);
  if (card && card.dataset.status !== "seen")
    card.querySelector("[data-status]")?.click();
}
function statusClick(event) {
  const card = event.currentTarget.closest("[data-player-card]");
  const seen = card.dataset.status !== "seen";
  card.dataset.status = seen ? "seen" : "unseen";
  event.currentTarget.dataset.status = seen ? "seen" : "unseen";
  event.currentTarget.textContent = seen ? "● Seen" : "○ Unseen";
  event.currentTarget.setAttribute("aria-pressed", String(seen));
  card.querySelector(".maal-row")?.classList.toggle("is-disabled", !seen);
  if (!seen) card.querySelector("[data-maal]").textContent = "0";
  event.currentTarget.classList.toggle("seen", seen);
  event.currentTarget.classList.toggle("unseen", !seen);
  card.querySelectorAll("[data-step], [data-dubli]").forEach((control) => {
    control.disabled = !seen;
  });
  card.querySelector(".stepper")?.setAttribute("data-tooltip", seen ? "" : "Only Seen players can have Maal points.");
  if (!seen) card.querySelector("[data-dubli]").checked = false;
  if (!seen && document.querySelector("#winner")?.value === card.dataset.playerCard)
    clearWinnerSelection();
}
function clearWinnerSelection() {
  document.querySelector("#winner").value = "";
  const trigger = document.querySelector("[data-winner-trigger]");
  trigger.classList.remove("has-value");
  trigger.innerHTML = '<span class="winner-trigger-person"><span class="winner-trigger-avatar">♛</span><span><strong>Select a winner</strong></span></span><span class="winner-trigger-chevron">⌄</span>';
  document.querySelectorAll("[data-winner-option]").forEach((option) => {
    option.classList.remove("selected");
    option.setAttribute("aria-selected", "false");
    option.querySelector(".winner-option-check").textContent = "";
    option.querySelector("small").textContent = "Choose as winner";
  });
  document.querySelectorAll("[data-player-card]").forEach((playerCard) => {
    playerCard.classList.remove("is-winner");
    playerCard.querySelector(".winner-label")?.remove();
  });
  document.querySelector('#round-form button[type="submit"]')?.setAttribute("disabled", "");
  document.querySelector(".calculate-hint")?.removeAttribute("hidden");
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
  const gameType = event.target.dataset.gameType || "marriage";
  const game = {
    id: id(),
    type: gameType,
    name: String(form.get("name")).trim() || uniqueName(gameType),
    players: Array.from({ length: count }, (_, index) => ({
      id: id(),
      name: String(form.get(`player-${index}`)).trim() || `Player ${index + 1}`,
    })),
    settings: gameType === "call-break"
      ? { pointRate: Number(form.get("rate")), numberOfRounds: Number(form.get("rounds")) }
      : {
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

function updateGame(event) {
  event.preventDefault();
  const game = getGame();
  if (!game) return;
  const form = new FormData(event.target);
  const count = Number(form.get("count"));
  const previousPlayers = game.players;
  if (count < previousPlayers.length) return;
  const players = Array.from({ length: count }, (_, index) => ({
    id: previousPlayers[index]?.id || id(),
    name: String(form.get(`player-${index}`)).trim() || `Player ${index + 1}`,
  }));
  const addedPlayers = players.slice(previousPlayers.length);

  game.rounds.forEach((round) => {
    addedPlayers.forEach((player) => {
      round.scores[player.id] = 0;
      round.entries.push({ playerId: player.id, maalPoints: 0, status: "unseen", dubli: false });
    });
  });
  game.players = players;
  save();
  closeModal();
  render();
  showToast("Game updated");
}

function saveRound(event) {
  event.preventDefault();
  const game = getGame();
  const form = new FormData(event.target);
  const editingId = event.target.dataset.editing;
  const existing = editingId
    ? game.rounds.find((round) => round.id === editingId)
    : null;

  if (game.type === "call-break") {
    const wasPendingCallBreakRound = existing?.status === "calls";
    const entries = [...document.querySelectorAll("[data-player-card]")].map(
      (card) => ({
        playerId: card.dataset.playerCard,
        call: Number(card.querySelector("[data-call]").value),
        wins: Number(card.querySelector("[data-wins]")?.value),
      }),
    );
    if (entries.some((entry) => entry.call < 1 || entry.call > 8)) {
      showToast("Haats must be between 1 and 8");
      return;
    }
    if (event.target.dataset.phase === "calls") {
      game.rounds.push({
        id: id(),
        number: game.rounds.length + 1,
        winnerId: null,
        entries: entries.map((entry) => ({ ...entry, wins: null })),
        scores: {},
        status: "calls",
        createdAt: new Date().toISOString(),
      });
      save();
      navigate("scoreboard", game.id);
      showToast("Haats saved");
      return;
    }
    if (entries.some((entry) => entry.wins < 0 || entry.wins > 8)) {
      showToast("Wins must be between 0 and 8");
      return;
    }
    const totalWins = entries.reduce((sum, entry) => sum + entry.wins, 0);
    if (totalWins !== 13) {
      showToast(`Total points won is ${totalWins} and not 13 in total`);
      return;
    }
    const scores = calculateCallBreakScores(entries);
    const completedRoundsBefore = game.rounds.filter((item) => item.status !== "calls").length;
    const winnerId = [...entries].sort((a, b) => scores[b.playerId] - scores[a.playerId])[0].playerId;
    const round = {
      id: editingId || id(),
      number: existing?.number || game.rounds.length + 1,
      winnerId,
      entries,
      scores,
      status: "complete",
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    if (existing) game.rounds[game.rounds.indexOf(existing)] = round;
    else game.rounds.push(round);
    const finalCallBreakRound = wasPendingCallBreakRound && completedRoundsBefore < (game.settings.numberOfRounds || 5) &&
      game.rounds.filter((item) => item.status !== "calls").length >= (game.settings.numberOfRounds || 5);
    save();
    navigate("scoreboard", game.id);
    if (finalCallBreakRound) showCallBreakFinalRanking(game);
    showToast("Round calculated");
    return;
  }

  const winnerId = form.get("winner");
  if (!winnerId) return;
  const entries = [...document.querySelectorAll("[data-player-card]")].map(
    (card) => ({
      playerId: card.dataset.playerCard,
      maalPoints: Number(card.querySelector("[data-maal]").textContent),
      status: card.dataset.status || "unseen",
      dubli: card.querySelector("[data-dubli]").checked,
    }),
  );
  if (!entries.some((entry) => entry.status === "seen")) {
    showToast("At least one player must be Seen");
    return;
  }
  const scores = calculateRoundScores(entries, game.settings, winnerId);
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

function showCallBreakFinalRanking(game) {
  const ranking = [...game.players]
    .sort((a, b) => total(game, b.id) - total(game, a.id))
    .map((player, index) => `${index + 1}. ${escape(player.name)} — ${total(game, player.id)} points`)
    .join("<br>");
  const winner = escape([...game.players].sort((a, b) => total(game, b.id) - total(game, a.id))[0].name);
  showConfirmation(
    "Congratulations!",
    `<strong>Congratulations to ${winner}!</strong><br><br>${ranking}`,
    () => {},
    "View final ranking",
    "Close",
  );
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
        "Use your browser menu or Add to Home Screen to install this app.",
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

function setupServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    const registration = await navigator.serviceWorker.register("./sw.js");
    const updateToast = document.querySelector("#update-toast");
    const updateButton = document.querySelector("#update-button");

    const showUpdate = (worker) => {
      if (!navigator.serviceWorker.controller || !worker) return;
      updateToast.hidden = false;
      updateButton.onclick = () => {
        updateButton.disabled = true;
        worker.postMessage({ type: "SKIP_WAITING" });
      };
    };

    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed") showUpdate(worker);
      });
    });
    showUpdate(registration.waiting);
    // Check the server immediately so a higher CACHE_VERSION is discovered
    // without waiting for the browser's periodic service-worker check.
    registration.update().catch(() => {});

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    }, { once: true });
  });
}

setRenderer(render);
restoreNavigation();
window.addEventListener("hashchange", () => {
  restoreNavigation();
  render();
});
applyTheme();
render();
setupInstallPrompt();
setupServiceWorker();
