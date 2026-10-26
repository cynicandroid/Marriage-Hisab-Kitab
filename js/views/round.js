import { escape, getGame, state } from "../core.js";

function callBreakPlayerInput(player, entry, isCalculation, allowCallEdit = false) {
  const call = entry.call ?? "";
  const wins = entry.wins ?? "";
  const canEditCalls = !isCalculation || allowCallEdit;
  const callValues = isCalculation ? [null, ...Array.from({ length: 8 }, (_, index) => index + 1)] : Array.from({ length: 8 }, (_, index) => index + 1);
  const callOptions = callValues
    .map((value) => value === null
      ? '<span class="call-option-spacer" aria-hidden="true"></span>'
      : `<button type="button" class="call-option ${value === call ? "selected" : ""}" data-call-option="${value}" ${canEditCalls ? "" : "disabled"} aria-pressed="${value === call}">${value}</button>`)
    .join("");
  const winsOptions = Array.from({ length: 9 }, (_, value) =>
    `<button type="button" class="call-option ${value === wins ? "selected" : ""}" data-wins-option="${value}" ${isCalculation ? "" : "disabled"} aria-pressed="${value === wins}">${value}</button>`,
  ).join("");
  return `
    <div class="player-card call-break-player-card" data-player-card="${player.id}">
      <div class="player-top">
        <span class="avatar">${escape(player.name.charAt(0).toUpperCase())}</span>
        <span class="player-name">${escape(player.name)}</span>
      </div>
      <div class="call-control">
        <span class="call-label">Haat</span>
        <input type="hidden" data-call value="${call}" />
        <div class="call-options ${isCalculation ? "calculation-call-options" : ""}" role="group" aria-label="Haat for ${escape(player.name)}">${callOptions}</div>
        ${isCalculation ? `<div class="wins-control"><span class="call-label">Haat won</span><input type="hidden" data-wins value="${wins}" /><div class="call-options wins-options" role="group" aria-label="Haat won by ${escape(player.name)}">${winsOptions}</div></div>` : ""}
      </div>
    </div>
  `;
}

function playerInput(player, entry, isWinner) {
  return `
    <div class="player-card ${isWinner ? "is-winner" : ""}" data-player-card="${player.id}" data-status="${entry.status}">
      <div class="player-top">
        <span class="avatar">${escape(player.name.charAt(0).toUpperCase())}</span>
        <span class="player-name">${escape(player.name)}</span>
        ${isWinner ? '<span class="winner-label">♛ W</span>' : ""}
      </div>
      <div class="status-control">
        <button type="button" class="status-toggle ${entry.status}" data-status="${entry.status}" aria-pressed="${entry.status === "seen"}">${entry.status === "seen" ? "● Seen" : "○ Unseen"}</button>
      </div>
      <label class="toggle"><input type="checkbox" data-dubli ${entry.dubli ? "checked" : ""} ${entry.status !== "seen" ? "disabled" : ""}/> Dubli</label>
      <div class="maal-row ${entry.status !== "seen" ? "is-disabled" : ""}">
        <span class="maal-label">MAAL POINTS</span>
        <span class="stepper" data-tooltip="${entry.status !== "seen" ? "Only Seen players can have Maal points." : ""}">
          <button type="button" data-step="-1" ${entry.status !== "seen" ? "disabled" : ""}>−</button>
          <span data-maal>${entry.status === "seen" ? entry.maalPoints : 0}</span>
          <button type="button" data-step="1" ${entry.status !== "seen" ? "disabled" : ""}>＋</button>
        </span>
        <span class="quick-steps" aria-label="Quickly add Maal points">
          <button type="button" class="quick-step" data-step="5" ${entry.status !== "seen" ? "disabled" : ""}>+5</button>
          <button type="button" class="quick-step" data-step="10" ${entry.status !== "seen" ? "disabled" : ""}>+10</button>
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
  if (game.type === "call-break") {
    const isCalculation = Boolean(editing);
    const canEditCalls = Boolean(editing && editing.status !== "calls");
    const roundNumber = editing?.number || game.rounds.length + 1;
    const roundPlayers = game.players.map(
      (_, index) => game.players[(index + roundNumber - 1) % game.players.length],
    );
    const entries = editing
      ? editing.entries
      : game.players.map((player) => ({ playerId: player.id, call: null, wins: 0 }));
    const playerCards = roundPlayers
      .map((player) => callBreakPlayerInput(
        player,
        entries.find((entry) => entry.playerId === player.id) || { call: null, wins: 0 },
        isCalculation,
        canEditCalls,
      ))
      .join("");
    const totalWins = entries.reduce((sum, entry) => sum + (Number(entry.wins) || 0), 0);
    const canSubmit = isCalculation
      ? entries.every((entry) => entry.wins !== null && entry.wins !== undefined) && totalWins === 13
      : entries.every((entry) => entry.call !== null && entry.call !== undefined);
    const submitHint = isCalculation && totalWins !== 13
      ? `Total points won is ${totalWins} and not 13 in total`
      : "";
    return `
      <button class="back-link" data-action="navigate" data-view="scoreboard">← Back to scoreboard</button>
      <div class="round-toolbar ${isCalculation ? "calculation-toolbar" : ""}"><div><h1>Round ${editing?.number || game.rounds.length + 1}</h1><p class="round-subtitle">${isCalculation ? "Enter Game Haat" : "Haat Bolam"}</p></div><div class="call-total"><span>Boleko Haat: <strong data-total-calls>${entries.reduce((sum, entry) => sum + (Number(entry.call) || 0), 0)}</strong></span>${isCalculation ? `<span>Game Haat: <strong data-total-wins>${totalWins}</strong></span>` : ""}</div></div>
      <form id="round-form" data-editing="${editing?.id || ""}" data-phase="${isCalculation ? "calculate" : "calls"}">
        <div class="round-player-grid">${playerCards}</div>
        <div class="notice">${isCalculation ? "Meet your haat to score the haat. Each extra win adds 0.1 points; missing your haat scores negative points equal to your haat." : "Each player records the number of haat they expect to win. Save haats, then enter the haat won after the game ends."}</div>
        <div class="sticky-actions">
          <button type="button" class="button ghost" data-action="cancel-round">Cancel</button>
          <button type="submit" class="button ${isCalculation ? "primary" : "success"}" ${!canSubmit ? "disabled" : ""} ${submitHint ? `title="${submitHint}"` : ""}>${isCalculation ? "Calculate Round" : "Save Haats"}</button>
        </div>
      </form>
    `;
  }
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
  const playerNameWidth = Math.max(
    8,
    ...game.players.map((player) => [...player.name].length),
  );

  return `
    <button class="back-link" data-action="navigate" data-view="scoreboard">← Back to scoreboard</button>
    <div class="round-toolbar">
      <div>
        <h1>Round ${editing?.number || game.rounds.length + 1}</h1>
        <p class="round-subtitle">Enter Maal Points</p>
      </div>
    </div>
    <form id="round-form" data-editing="${editing?.id || ""}">
      <div class="winner-field">
        <label>♛ Round Winner</label>
        <input type="hidden" id="winner" name="winner" value="${winner}" required>
        <div class="winner-picker">
          <button type="button" class="winner-picker-trigger ${winner ? "has-value" : ""}" data-winner-trigger aria-haspopup="listbox" aria-expanded="false">
            <span class="winner-trigger-person"><span class="winner-trigger-avatar">${winnerPlayer ? escape(winnerPlayer.name.charAt(0).toUpperCase()) : "♛"}</span><span><strong>${winnerPlayer ? escape(winnerPlayer.name) : "Select a winner"}</strong></span></span>
            <span class="winner-trigger-chevron">⌄</span>
          </button>
          <div class="winner-picker-menu" data-winner-menu role="listbox">${options}</div>
        </div>
      </div>
      <div class="round-player-grid" style="--player-name-width:${playerNameWidth}ch">${playerCards}</div>
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
