export function rulesView() {
  const rules = [
    [
      "▤",
      "Cards",
      "Three standard decks plus jokers are used. Each player receives 21 cards.",
    ],
    [
      "♙",
      "Players",
      "The standard game supports 2–5 players. This scorekeeper can track larger house games too.",
    ],
    [
      "◎",
      "Goal",
      "Arrange your hand into valid sets, reveal the joker, and be first to complete the game.",
    ],
    [
      "↗",
      "Pure Sequence",
      "Three or more consecutive cards in the same suit.",
    ],
    ["▦", "Trial", "Three cards of the same rank in different suits."],
    ["♦", "Tunnella", "Three cards with the same suit and rank."],
    [
      "⌁",
      "Marriage",
      "A same-suit sequence of three or more cards with Tiplu in the middle.",
    ],
    ["▱", "Dublee", "A pair of cards with the same suit and rank."],
    [
      "♥",
      "Tiplu",
      "The card that exactly matches the selected Maal/joker card.",
    ],
    [
      "★",
      "Round scoring",
      "Record each player’s Maal, Seen or Unseen status, and winner. The scoreboard applies your configured point rules.",
    ],
  ];
  const ruleItems = rules
    .map(
      (rule) => `
    <div class="rule">
      <span class="rule-icon">${rule[0]}</span>
      <div><h3>${rule[1]}</h3><p>${rule[2]}</p></div>
    </div>
  `,
    )
    .join("");

  return `
    <div class="page-heading">
      <div><p class="eyebrow">How to play</p><h1>Marriage Rules</h1></div>
    </div>
    <div class="card developer-card">
      <strong>Developer: Saroj Poudyal</strong>
      <p>“Sathi... Banche Po Jindagi”</p>
    </div>
    <div class="card">
      <p class="muted">A quick guide to the 21-card Marriage game. Build valid sets, reveal the Maal, then finish your hand first.</p>
      <div class="rule-list" style="margin-top:20px">${ruleItems}</div>
    </div>
    <div class="card disclaimer-card">
      <h2>Disclaimer</h2>
      <p>This is a free app shared under the GNU General Public License. You are free to fork, modify, and edit it for your own use.</p>
      <p>This app is for fun and entertainment only. Do not use real money. Any virtual money shown is purely for bragging rights and has no real-world value.</p>
    </div>
  `;
}
