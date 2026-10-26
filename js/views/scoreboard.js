import { escape, getGame, money, scoreBadge, state, total } from "../core.js";

function callBreakScore(score) {
  const value = Math.ceil(((Number(score) || 0) - 1e-9) * 10) / 10;
  const sign = value > 0 ? "+" : "";
  return `<span class="call-break-score ${value < 0 ? "negative" : value > 0 ? "positive" : "zero"}">${sign}${value}</span>`;
}

function callBreakRanking(game) {
  return [...game.players]
    .sort((a, b) => total(game, b.id) - total(game, a.id))
    .map((player, index) => ({ player, rank: index + 1 }));
}

function callBreakScoreTable(game) {
  const headers = game.players.map((player) => `<th>${escape(player.name)}</th>`).join("");
  const ranking = callBreakRanking(game);
  const defaultRoundsComplete = game.rounds.filter((round) => round.status !== "calls").length >= (game.settings.numberOfRounds || 5);
  const rows = game.rounds.length
    ? [...game.rounds].reverse().map((round) => `<tr><td>${round.number}</td>${game.players.map((player) => {
        const entry = round.entries.find((item) => item.playerId === player.id);
        const result = round.status === "calls" ? '<span class="muted">—</span>' : callBreakScore(round.scores[player.id]);
        return `<td><span class="call-break-round-cell">${result}<span class="call-break-divider">/</span><span class="call-break-call">${entry?.call ?? "—"}</span></span></td>`;
      }).join("")}</tr>`).join("")
    : `<tr><td colspan="${game.players.length + 1}" class="muted">Add a round to start the scoreboard.</td></tr>`;
  const totals = game.players.map((player) => `<td>${callBreakScore(total(game, player.id))}</td>`).join("");

  const rankingCells = game.players.map((player) => {
    const rank = ranking.find((item) => item.player.id === player.id)?.rank;
    const suffix = rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
    const crown = defaultRoundsComplete && rank === 1 ? ' <span class="round-winner" title="Winner" aria-label="Winner">♛</span>' : "";
    return `<td>${rank}${suffix}${crown}</td>`;
  }).join("");
  return `<div class="call-break-score-table-wrap"><table class="score-table call-break-score-table"><thead><tr><th>#</th>${headers}</tr></thead><tbody>${rows}</tbody><tfoot><tr><td>TOTAL</td>${totals}</tr><tr class="call-break-ranking-row"><td>RANK</td>${rankingCells}</tr></tfoot></table></div>`;
}

function scoreTable(game) {
  if (game.type === "call-break") return callBreakScoreTable(game);
  const rows = game.rounds.length
    ? [...game.rounds]
        .reverse()
        .map(
          (round) =>
            `<tr><td>Round ${round.number}${round.status === "calls" ? ' <span class="muted">(Haats saved)</span>' : ""}</td>${game.players.map((player) => `<td>${round.status === "calls" ? '<span class="muted">—</span>' : `${scoreBadge(round.scores[player.id] || 0)}${round.winnerId === player.id ? '<span class="round-winner">★</span>' : ""}`}</td>`).join("")}</tr>`,
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
        <div class="mobile-round-header"><strong>Round ${round.number}</strong><span>${round.status === "calls" ? "Haats saved" : `${escape(game.players.find((player) => player.id === round.winnerId)?.name || "Winner")} won`}</span></div>
        ${game.players
          .map(
            (player) => `
          <div class="mobile-score-row">
            <span>${escape(player.name)}${round.winnerId === player.id ? ' <span class="round-winner">★</span>' : ""}</span>
            ${round.status === "calls" ? '<span class="muted">—</span>' : scoreBadge(round.scores[player.id] || 0)}
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
      <div class="mobile-total-row">
        <strong>${escape(player.name)}</strong>
        ${scoreBadge(total(game, player.id))}
        <strong class="${total(game, player.id) >= 0 ? "positive" : "negative"}">${money(total(game, player.id) * game.settings.pointRate)}</strong>
      </div>
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
        <div class="mobile-total-header"><span>Player</span><span>Points</span><span>Amount</span></div>
        ${mobileTotals}
      </div>
      ${mobileRounds}
    </div>
  `;
}

export function scoreboardView() {
  const game = getGame();
  if (!game) return `<div class="empty">Game unavailable</div>`;
  const pendingCallBreakRound = game.type === "call-break"
    ? game.rounds.find((round) => round.status === "calls")
    : null;
  const callBreakComplete = game.type === "call-break" && !game.settings.allowExtraRounds && game.rounds.filter((round) => round.status !== "calls").length >= (game.settings.numberOfRounds || 5);
  const rounds = [...game.rounds]
    .reverse()
    .map(
      (round) => `
    <button class="card round-row" data-action="${round.status === "calls" ? "calculate-call-break-round" : "open-round"}" data-id="${round.id}">
      <span class="round-number">${round.number}</span>
      <span class="round-row-main">
        <h3>${game.type === "call-break" ? `Round ${round.number}` : `Round ${round.number} · ${escape(game.players.find((player) => player.id === round.winnerId)?.name || "Winner")} won`}</h3>
        <p>${new Date(round.createdAt).toLocaleDateString()} · ${round.status === "calls" ? "Enter wins" : "View details"}</p>
      </span>
      <span class="chevron">›</span>
    </button>
  `,
    )
    .join("");

  return `
    <button class="back-link" data-action="navigate" data-view="home">← Back to home</button>
    <div class="board-header">
      <div class="board-title"><div><h1>${escape(game.name)}</h1><div class="board-meta">${game.players.length} players · ${game.type === "call-break" ? `${game.settings.numberOfRounds} rounds` : `${money(game.settings.pointRate)} per point`}</div></div><button class="delete-game-icon scoreboard-delete" data-action="delete-game" title="Delete ${escape(game.name)}" aria-label="Delete ${escape(game.name)}">🗑</button></div>
      <div class="board-actions">
        <button class="button secondary" data-action="share">Share</button>
        ${pendingCallBreakRound
          ? `<button class="button success" data-action="calculate-call-break-round" data-id="${pendingCallBreakRound.id}">Calculate</button>`
          : callBreakComplete
            ? '<button class="button success" data-action="keep-playing">Keep Playing</button>'
            : '<button class="button success" data-action="add-round">＋ New Round</button>'}
      </div>
    </div>
    <div class="score-card">${scoreTable(game)}</div>
    <section class="rounds">
      <div class="section-title"><h2>Rounds</h2></div>
      ${game.rounds.length ? `<div class="card-grid">${rounds}</div>` : `<div class="empty">No rounds yet. Add the first round to begin.</div>`}
    </section>
    ${game.type === "call-break" ? "" : '<div class="game-footer-actions"><button class="button success" data-action="edit-game"><span class="action-icon">✎</span> Add new Players to this Game</button></div>'}
  `;
}
