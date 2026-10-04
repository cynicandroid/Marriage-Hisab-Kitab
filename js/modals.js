import { escape, money, rates, state, uniqueName } from "./core.js";

export function newGameForm() {
  const names = Array.from(
    { length: state.prefs.playerCount },
    (_, index) => state.prefs.names[index] || `Player ${index + 1}`,
  );
  const playerFields = names
    .map(
      (name, index) => `
    <div class="field">
      <label>Player ${index + 1}</label>
      <input name="player-${index}" value="${escape(name)}" required />
    </div>
  `,
    )
    .join("");
  const countOptions = Array.from({ length: 7 }, (_, index) => index + 2)
    .map(
      (count) =>
        `<option ${count === state.prefs.playerCount ? "selected" : ""}>${count}</option>`,
    )
    .join("");
  const rateOptions = rates
    .map(
      (rate) =>
        `<option value="${rate}" ${state.prefs.pointRate === rate ? "selected" : ""}>${money(rate)}</option>`,
    )
    .join("");

  return `
    <div class="modal-backdrop">
      <div class="modal">
        <div class="modal-header"><h2>New Game</h2><button class="close" data-action="close-modal">×</button></div>
        <form id="new-game-form">
          <div class="modal-body">
            <div class="field"><label for="game-name">Game name</label><input id="game-name" name="name" value="${escape(uniqueName())}" required /></div>
            <div class="field"><label for="player-count">Players</label><select id="player-count" name="count">${countOptions}</select></div>
            <div class="form-section">
              <h2>Players</h2>
              <div class="player-fields" id="new-player-fields">${playerFields}</div>
            </div>
            <div class="form-section">
              <h2>Point settings</h2>
              <div class="field-grid">
                <div class="field"><label>Point rate</label><select name="rate">${rateOptions}</select></div>
                <div class="field"><label>Seen charge</label><input type="number" name="seen" value="3" min="0" max="100" /></div>
                <div class="field"><label>Unseen charge</label><input type="number" name="unseen" value="10" min="0" max="100" /></div>
              </div>
            </div>
          </div>
          <div class="modal-footer"><button type="button" class="button ghost" data-action="close-modal">Cancel</button><button class="button primary">Start game</button></div>
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
      <div class="modal" style="max-width:440px">
        <div class="modal-header"><h2>${title}</h2><button class="close" data-action="close-modal">×</button></div>
        <div class="modal-body"><p class="confirm-copy">${copy}</p></div>
        <div class="modal-footer"><button class="button ghost" data-action="close-modal">${cancelLabel}</button><button class="button danger" id="confirm-yes">${confirmLabel}</button></div>
      </div>
    </div>
  `;
}
