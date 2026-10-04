import { escape, state } from "../core.js";

function gameCards() {
  if (!state.games.length) {
    return `<div class="empty">No games yet. Start a new game to begin.</div>`;
  }

  const cards = state.games
    .slice(0, 6)
    .map(
      (game) => `
    <div class="card game-card">
      <button class="game-card-main" data-action="open-game" data-id="${game.id}">
        <span class="game-icon">▶</span>
        <span>
          <h3>${escape(game.name)}</h3>
          <p>${game.players.length} players · ${game.rounds.length} rounds</p>
        </span>
      </button>
      <span class="chevron">›</span>
    </div>
  `,
    )
    .join("");

  return `<div class="card-grid">${cards}</div>`;
}

export function homeView() {
  return `
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">Sathi ho ajja ta jitne ho</p>
        <h1>MARRIAGE<span>HISAB KITAB</span></h1>
        <p>Keep every maal, round, and winning score together. Built for the Nepali Marriage card game.</p>
        <button class="button" data-action="new-game">＋ New Game</button>
      </div>
    </section>
    <section class="section">
      <div class="section-title">
        <h2>Games</h2>
        <button class="button secondary" data-action="navigate" data-view="games">View all</button>
      </div>
      ${gameCards()}
    </section>
  `;
}
