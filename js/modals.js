import { escape, money, rates, state, uniqueName } from "./core.js";

function gameSettingPicker(name, label, value, options) {
  const selected = options.find((option) => String(option.value) === String(value));
  return `
    <div class="setting-picker new-game-picker">
      <input id="${name}" type="hidden" name="${name}" value="${value}" />
      <button type="button" class="setting-picker-trigger" data-new-game-trigger="${name}" aria-haspopup="listbox" aria-expanded="false">
        <span class="setting-picker-value">${escape(selected?.label || label)}</span>
        <span class="winner-trigger-chevron">⌄</span>
      </button>
      <div class="setting-picker-menu" data-new-game-menu="${name}" role="listbox">
        ${options.map((option) => `<button type="button" class="setting-option ${String(option.value) === String(value) ? "selected" : ""}" data-new-game-option="${name}" data-value="${option.value}" data-label="${escape(option.label)}" role="option" aria-selected="${String(option.value) === String(value)}"><span>${escape(option.label)}</span><span class="winner-option-check">${String(option.value) === String(value) ? "✓" : ""}</span></button>`).join("")}
      </div>
    </div>
  `;
}

export function newGameForm(gameType = "marriage") {
  const isCallBreak = gameType === "call-break";
  const title = isCallBreak ? "New Call-Break Game" : "New Marriage Game";
  const callBreakDefaults = ["Upasana", "Bandana", "Laxmi", "Smeeta"];
  const names = isCallBreak
    ? (state.prefs.callBreakUseDefaultNames
        ? callBreakDefaults.map((fallback, index) => state.prefs.names[index] || fallback)
        : callBreakDefaults)
    : Array.from(
        { length: state.prefs.playerCount },
        (_, index) => state.prefs.names[index] || `Player ${index + 1}`,
      );
  const playerFields = names
    .map(
      (name, index) => `
    <div class="field new-game-row reorderable-player-row">
      <label>Player <span data-player-position>${index + 1}</span></label>
      <input name="player-${index}" value="${escape(name)}" required />
      <div class="player-reorder-controls"><button type="button" class="icon-button" data-reorder-player="up" aria-label="Move player up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" class="icon-button" data-reorder-player="down" aria-label="Move player down" ${index === names.length - 1 ? "disabled" : ""}>↓</button></div>
    </div>
  `,
    )
    .join("");
  const playerOptions = Array.from({ length: 7 }, (_, index) => index + 2)
    .map((count) => ({ value: count, label: `${count} players` }));
  const rateOptions = rates.map((rate) => ({ value: rate, label: money(rate) }));
  const playerCountField = isCallBreak
    ? '<input type="hidden" name="count" value="4" />'
    : `<div class="field new-game-row"><label for="player-count">Players</label>${gameSettingPicker("count", "Players", state.prefs.playerCount, playerOptions)}</div>`;

  return `
    <div class="modal-backdrop">
      <div class="modal new-game-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header"><h2 id="modal-title">${title}</h2><button class="close" data-action="close-modal" aria-label="Close dialog">×</button></div>
        <form id="new-game-form" data-game-type="${gameType}">
          <div class="modal-body">
            <div class="field new-game-row"><label for="game-name">Game name</label><input id="game-name" name="name" value="${escape(uniqueName(gameType))}" required /></div>
            ${playerCountField}
            <div class="form-section">
              <h2>Players</h2>
              <div class="player-fields new-game-players" id="new-player-fields">${playerFields}</div>
            </div>
            <div class="form-section">
              <h2>${isCallBreak ? "Game settings" : "Point settings"}</h2>
              <div class="field-grid new-game-settings">
                ${isCallBreak ? "" : `<div class="field new-game-row"><label>Point rate</label>${gameSettingPicker("rate", "Point rate", state.prefs.pointRate, rateOptions)}</div>`}
                ${isCallBreak
                  ? '<div class="field new-game-row"><label>Number of Rounds</label><input type="number" name="rounds" value="5" min="1" max="100" /></div>'
                  : '<div class="field new-game-row"><label>Seen charge</label><input type="number" name="seen" value="3" min="0" max="100" /></div><div class="field new-game-row"><label>Unseen charge</label><input type="number" name="unseen" value="10" min="0" max="100" /></div>'}
              </div>
            </div>
          </div>
          <div class="modal-footer"><button type="button" class="button ghost" data-action="close-modal">Cancel</button><button class="button primary">Start Game</button></div>
        </form>
      </div>
    </div>
  `;
}

export function editGameForm(game) {
  const playerOptions = Array.from(
    { length: 9 - game.players.length },
    (_, index) => game.players.length + index,
  )
    .map((count) => ({ value: count, label: `${count} players` }));
  const playerFields = game.players.map((player, index) => `
    <div class="field new-game-row">
      <label>Player ${index + 1}</label>
      <input name="player-${index}" value="${escape(player.name)}" required />
    </div>
  `).join("");
  return `
    <div class="modal-backdrop">
      <div class="modal new-game-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header"><h2 id="modal-title">Edit Game</h2><button class="close" data-action="close-modal" aria-label="Close dialog">×</button></div>
        <form id="edit-game-form" data-game-id="${game.id}">
          <div class="modal-body">
            <div class="field new-game-row"><label for="count">Players</label>${gameSettingPicker("count", "Players", game.players.length, playerOptions)}</div>
            <div class="form-section"><h2>Players</h2><div class="player-fields new-game-players" id="edit-player-fields">${playerFields}</div></div>
          </div>
          <div class="modal-footer"><button type="button" class="button ghost" data-action="close-modal">Cancel</button><button class="button primary">Update Game</button></div>
        </form>
      </div>
    </div>
  `;
}

export function confirmModal(
  title,
  copy,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
) {
  return `
    <div class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header"><h2 id="modal-title">${title}</h2><button class="close" data-action="close-modal" aria-label="Close dialog">×</button></div>
        <div class="modal-body"><p class="confirm-copy">${copy}</p></div>
        <div class="modal-footer"><button class="button ghost" data-action="close-modal">${cancelLabel}</button><button class="button danger" id="confirm-yes">${confirmLabel}</button></div>
      </div>
    </div>
  `;
}
