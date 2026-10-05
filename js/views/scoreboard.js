import { escape, getGame, money, scoreBadge, state, total } from "../core.js";

function scoreTable(game) {
  const rows = game.rounds.length
    ? [...game.rounds]
        .reverse()
        .map(
          (round) =>
            `<tr><td>Round ${round.number}</td>${game.players.map((player) => `<td>${scoreBadge(round.scores[player.id] || 0)}${round.winnerId === player.id ? '<span class="round-winner">★</span>' : ""}</td>`).join("")}</tr>`,
        )
        .join("")
    : `<tr><td colspan="${game.players.length + 1}" class="muted">Add a round to start the scoreboard.</td></tr>`;
  const headers = game.players
    .map((player) => `<th>${escape(player.name)}</th>`)
    .join("");
  const totals = game.players
    .map((player) => `<td>${scoreBadge(total(game, player.id))}</td>`)
    .join("");
  const amounts = game.players
    .map((player) => {
      const amount = total(game, player.id) * game.settings.pointRate;
      return `<td class="${amount >= 0 ? "positive" : "negative"}">${money(amount)}</td>`;
    })
    .join("");
  const mobileRounds = game.rounds.length
    ? [...game.rounds]
        .reverse()
        .map(
          (round) => `
      <div class="mobile-round-card">
        <div class="mobile-round-header"><strong>Round ${round.number}</strong><span>${escape(game.players.find((player) => player.id === round.winnerId)?.name || "Winner")} won</span></div>
        ${game.players
          .map(
            (player) => `
          <div class="mobile-score-row">
            <span>${escape(player.name)}${round.winnerId === player.id ? ' <span class="round-winner">★</span>' : ""}</span>
            ${scoreBadge(round.scores[player.id] || 0)}
          </div>
        `,
          )
          .join("")}
      </div>
    `,
        )
        .join("")
    : `<div class="empty">Add a round to start the scoreboard.</div>`;
  const mobileTotals = game.players
    .map(
      (player) => `
      <div class="mobile-score-row"><strong>${escape(player.name)}</strong>${scoreBadge(total(game, player.id))}</div>
      <div class="mobile-amount-row"><span>Total amount</span><strong class="${total(game, player.id) >= 0 ? "positive" : "negative"}">${money(total(game, player.id) * game.settings.pointRate)}</strong></div>
    `,
    )
    .join("");

  return `
    <div class="desktop-score-table">
      <table class="score-table">
        <thead><tr><th>Game</th>${headers}</tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td>TOTAL</td>${totals}</tr>
          <tr><td>TOTAL AMOUNT</td>${amounts}</tr>
        </tfoot>
      </table>
    </div>
    <div class="mobile-scoreboard">
      <div class="mobile-total-card">
        <h3>Live totals</h3>
        ${mobileTotals}
      </div>
      ${mobileRounds}
    </div>
  `;
}

export function scoreboardView() {
  const game = getGame();
  if (!game) return `<div class="empty">Game unavailable</div>`;
  const rounds = [...game.rounds]
    .reverse()
    .map(
      (round) => `
    <button class="card round-row" data-action="open-round" data-id="${round.id}">
      <span class="round-number">${round.number}</span>
      <span class="round-row-main">
        <h3>Round ${round.number} · ${escape(game.players.find((player) => player.id === round.winnerId)?.name || "Winner")} won</h3>
        <p>${new Date(round.createdAt).toLocaleDateString()} · View details</p>
      </span>
      <span class="chevron">›</span>
    </button>
  `,
    )
    .join("");

  return `
    <button class="back-link" data-action="navigate" data-view="home">← Back to home</button>
    <div class="board-header">
      <div class="board-title"><div><h1>${escape(game.name)}</h1><div class="board-meta">${game.players.length} players · ${money(game.settings.pointRate)} per point</div></div><button class="delete-game-icon scoreboard-delete" data-action="delete-game" title="Delete ${escape(game.name)}" aria-label="Delete ${escape(game.name)}">🗑</button></div>
      <div class="board-actions">
        <button class="button secondary" data-action="share">Share</button>
        <button class="button success" data-action="add-round">＋ Add Round</button>
      </div>
    </div>
    <div class="score-card">${scoreTable(game)}</div>
    <section class="rounds">
      <div class="section-title"><h2>Rounds</h2></div>
      ${game.rounds.length ? `<div class="card-grid">${rounds}</div>` : `<div class="empty">No rounds yet. Add the first round to begin.</div>`}
    </section>
  `;
}
