import { escape, getGame, scoreClass, state } from "../core.js";

export function detailView() {
  const game = getGame();
  const round = game?.rounds.find((item) => item.id === state.roundId);
  if (!game || !round) return `<div class="empty">Round unavailable</div>`;
  const players = game.players
    .map((player) => {
      const entry = round.entries.find((item) => item.playerId === player.id);
      const score = round.scores[player.id] || 0;
      return `
      <div class="detail-row">
        <span class="avatar">${player.id === round.winnerId ? "♛" : escape(player.name.charAt(0).toUpperCase())}</span>
        <div class="detail-info">
          <strong>${escape(player.name)} ${player.id === round.winnerId ? '<span class="winner-label">WINNER</span>' : ""}</strong>
          <div class="pills">
            <span class="pill ${entry?.maalPoints ? "good" : "bad"}">Maal ${entry?.maalPoints || 0}</span>
            <span class="pill">${entry?.status === "seen" ? "Seen" : "Unseen"}</span>
            <span class="pill ${entry?.dubli ? "good" : ""}">Dubli ${entry?.dubli ? "Yes" : "No"}</span>
          </div>
        </div>
        <span class="big-score ${scoreClass(score)}">${score > 0 ? "+" : ""}${score}</span>
      </div>
    `;
    })
    .join("");

  return `
    <button class="back-link" data-action="navigate" data-view="scoreboard">← Back to scoreboard</button>
    <div class="page-heading">
      <div>
        <p class="eyebrow">Round ${round.number}</p>
        <h1>Round details</h1>
        <p class="muted">${new Date(round.createdAt).toLocaleDateString()} · ${escape(game.players.find((player) => player.id === round.winnerId)?.name || "Winner")} won</p>
      </div>
    </div>
    <div class="detail-card">
      <div class="detail-actions">
        <button class="button secondary" data-action="edit-round"><span class="action-icon">⚙</span> Fix maal</button>
        <button class="button danger" data-action="delete-round"><span class="action-icon">🗑</span> Delete round</button>
      </div>
      <div class="card">${players}</div>
    </div>
  `;
}
