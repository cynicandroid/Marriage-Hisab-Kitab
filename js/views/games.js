import { dateLabel, escape, state } from "../core.js";

export function gamesView() {
  const cards = state.games
    .map(
      (game) => `
    <div class="card game-card">
      <button class="game-card-main" data-action="open-game" data-id="${game.id}">
        <span class="game-icon">▶</span>
        <span>
          <h3>${escape(game.name)}</h3>
          <p>${game.players.length} players · ${game.rounds.length} rounds · ${dateLabel(game.createdAt)}</p>
        </span>
      </button>
      <span class="chevron">›</span>
    </div>
  `,
    )
    .join("");

  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">History</p>
        <h1>Games</h1>
      </div>
      <button class="button primary" data-action="new-game">＋ New Game</button>
    </div>
    ${state.games.length ? `<div class="card-grid">${cards}</div>` : `<div class="empty">No games yet. Start a new game to begin.</div>`}
  `;
}
