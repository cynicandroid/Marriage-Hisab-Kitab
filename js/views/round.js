import { escape, getGame, state } from "../core.js";

function playerInput(player, entry, isWinner) {
  return `
    <div class="player-card ${isWinner ? "is-winner" : ""}" data-player-card="${player.id}">
      <div class="player-top">
        <span class="avatar">${escape(player.name.charAt(0).toUpperCase())}</span>
        <span class="player-name">${escape(player.name)}</span>
        ${isWinner ? '<span class="winner-label">♛ Winner</span>' : ""}
      </div>
      <div class="segmented">
        <button type="button" class="${entry.status === "seen" ? "selected seen" : ""}" data-status="seen">◉ Seen</button>
        <button type="button" class="${entry.status === "unseen" ? "selected unseen" : ""}" data-status="unseen">◌ Unseen</button>
      </div>
      <label class="toggle"><input type="checkbox" data-dubli ${entry.dubli ? "checked" : ""} ${entry.status !== "seen" ? "disabled" : ""}/> Dubli</label>
      <div class="maal-row">
        <span class="maal-label">MAAL POINTS</span>
        <span class="stepper" data-tooltip="${entry.status !== "seen" ? "Only Seen players can have Maal points." : ""}">
          <button type="button" data-step="-1" ${entry.status !== "seen" ? "disabled" : ""}>−</button>
          <span data-maal>${entry.status === "seen" ? entry.maalPoints : 0}</span>
          <button type="button" data-step="1" ${entry.status !== "seen" ? "disabled" : ""}>＋</button>
        </span>
      </div>
    </div>
  `;
}

export function roundView() {
  const game = getGame();
  const editing = state.roundId
    ? game?.rounds.find((round) => round.id === state.roundId)
    : null;
  if (!game) return `<div class="empty">Game unavailable</div>`;
  const entries = editing
    ? editing.entries
    : game.players.map((player) => ({
        playerId: player.id,
        maalPoints: 0,
        status: "unseen",
        dubli: false,
      }));
  const winner = editing?.winnerId || "";
  const winnerPlayer = game.players.find((player) => player.id === winner);
  const canCalculate = Boolean(winner);
  const options = game.players
    .map(
      (player) => `
    <button type="button" class="winner-option ${winner === player.id ? "selected" : ""}" data-winner-option="${player.id}" role="option" aria-selected="${winner === player.id}">
      <span class="winner-option-avatar">${escape(player.name.charAt(0).toUpperCase())}</span>
      <span>${escape(player.name)}<small>${winner === player.id ? "Current winner" : "Choose as winner"}</small></span>
      <span class="winner-option-check">${winner === player.id ? "✓" : ""}</span>
    </button>
  `,
    )
    .join("");
  const playerCards = game.players
    .map((player) =>
      playerInput(
        player,
        entries.find((entry) => entry.playerId === player.id) || {
          maalPoints: 0,
          status: "unseen",
          dubli: false,
        },
        winner === player.id,
      ),
    )
    .join("");

  return `
    <button class="back-link" data-action="navigate" data-view="scoreboard">← Back to scoreboard</button>
    <div class="round-hero">
      <p class="eyebrow" style="color:#fff">Round ${editing?.number || game.rounds.length + 1}</p>
      <h1>Enter Maal Points</h1>
      <p>Choose the winner, then add each player’s status and maal.</p>
    </div>
    <form id="round-form" data-editing="${editing?.id || ""}">
      <div class="winner-field">
        <label>♛ Round Winner</label>
        <input type="hidden" id="winner" name="winner" value="${winner}" required>
        <div class="winner-picker">
          <button type="button" class="winner-picker-trigger ${winner ? "has-value" : ""}" data-winner-trigger aria-haspopup="listbox" aria-expanded="false">
            <span class="winner-trigger-person"><span class="winner-trigger-avatar">${winnerPlayer ? escape(winnerPlayer.name.charAt(0).toUpperCase()) : "♛"}</span><span><small>Winning player</small><strong>${winnerPlayer ? escape(winnerPlayer.name) : "Select a winner"}</strong></span></span>
            <span class="winner-trigger-chevron">⌄</span>
          </button>
          <div class="winner-picker-menu" data-winner-menu role="listbox">${options}</div>
        </div>
      </div>
      <div class="round-player-grid">${playerCards}</div>
      <div class="notice">Unseen pays maal plus its charge. Seen with maal uses the total-maal rule plus its charge. The winner receives the total.</div>
      <div class="sticky-actions">
        <button type="button" class="button ghost" data-action="cancel-round">Cancel</button>
        <div class="calculate-action">
          <button type="submit" class="button primary" ${canCalculate ? "" : "disabled"}>Calculate round</button>
          <span class="calculate-hint" ${canCalculate ? "hidden" : ""}>Pick Winner</span>
        </div>
      </div>
    </form>
  `;
}
