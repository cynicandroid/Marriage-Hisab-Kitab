function ruleItem(icon, title, copy) {
  return `
    <div class="rule">
      <span class="rule-icon">${icon}</span>
      <div><h3>${title}</h3><p>${copy}</p></div>
    </div>
  `;
}

function marriageRules() {
  return `
    <div class="card">
      <p class="muted">Marriage is a 21-card Nepali rummy game. House rules vary, so confirm the scoring options before starting a game.</p>
      <div class="rule-list" style="margin-top:20px">
        ${ruleItem("▤", "Setup", "Use three standard decks. Each player receives 21 cards. The remaining cards form the stock, and players draw one card and discard one card on each turn.")}
        ${ruleItem("◎", "The goal", "Be the first player to meld your whole hand and make a final discard. The game is not won merely by laying down the first sets: you must complete the hand and finish the round.")}
        ${ruleItem("↗", "Show to see the Maal", "Build and show three pure melds—pure sequences or qualifying tunnelas—or, where your table allows it, seven Dublees. The first player to show reveals the Tiplu, which determines the wild cards and Maal for everyone.")}
        ${ruleItem("♠", "Tiplu and wild cards", "The Tiplu is the hidden card turned after the first qualifying show. Its rank and suit, plus the Poplu and Jhiplu beside it, become Maal and wild cards. Many tables also use Alter, printed Jokers, and a Master card; agree on those options before playing.")}
        ${ruleItem("♦", "Maal", "Count each player's Maal from their hand and exposed melds. Common values include Tiplu 3, Poplu/Jhiplu 2, Alter 5, printed Joker 5, and Master 10, with higher values for multiples or special combinations. Exact values vary by table.")}
        ${ruleItem("▦", "Finish the hand", "After seeing the Maal, use the wild cards to complete your melds. A normal finish accounts for all 13 remaining cards as melds plus one final discard. A Dublee player may finish with an eighth Dublee when that rule is enabled.")}
        ${ruleItem("★", "Scoring", "The winner receives the configured win charge from each opponent—normally 3 from a Seen player and 10 from an Unseen player. Maal is then settled between players, and the running game totals determine the match winner.")}
        ${ruleItem("⚙", "House rules", "Murder makes an Unseen player's Maal count as zero; Kidnap gives that Maal to the winner; some tables count it for everyone. Alter, Dublee, Tunnela, Better, and bonus rules can also differ, so use the agreed table rule consistently.")}
      </div>
    </div>
  `;
}

function callBreakRules() {
  return `
    <div class="card">
      <p class="muted">Call-Break is a four-player trick-taking game played with one standard 52-card deck. Spades are always trump.</p>
      <div class="rule-list" style="margin-top:20px">
        ${ruleItem("♠", "Deal and call", "Deal 13 cards to each player. Before play, each player calls the number of tricks they expect to win. The app records calls from 1 to 8.")}
        ${ruleItem("♣", "Play the tricks", "Players follow the suit led when possible. If they cannot follow suit, they may play another suit or trump with a spade. The highest card of the led suit wins unless a spade is played; the highest spade wins.")}
        ${ruleItem("↗", "Score the round", "Meeting your call scores the call plus 0.1 for every trick above it. Missing your call subtracts the full call. All four players' trick counts must total 13.")}
        ${ruleItem("★", "Win the match", "Scores carry forward across the configured number of rounds. After the final round, the player with the highest running total wins.")}
      </div>
    </div>
  `;
}

export function rulesView() {
  return `
    <div class="page-heading">
      <div><p class="eyebrow">How to play</p><h1>Game Rules</h1></div>
    </div>
    <div class="card developer-card">
      <strong>Developer: Saroj Poudyal</strong>
      <p>“Sathi... Banche Po Jindagi”</p>
    </div>
    <section class="section">
      <div class="section-title"><h2>Marriage</h2></div>
      ${marriageRules()}
    </section>
    <section class="section">
      <div class="section-title"><h2>Call-Break</h2></div>
      ${callBreakRules()}
    </section>
    <div class="card disclaimer-card">
      <h2>License and disclaimer</h2>
      <p>This is a free app shared under the GNU General Public License. You are free to fork, modify, and edit it for your own use.</p>
      <p>Marriage rules differ between families and regions. Agree on the Maal values, bonuses, and Murder or Kidnap rule before starting. This app records the score; it does not enforce how cards are dealt or played.</p>
      <p>This is for fun and entertainment only. Any virtual money shown has no real-world value.</p>
    </div>
  `;
}
