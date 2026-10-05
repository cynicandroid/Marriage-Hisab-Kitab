import { currencies, escape, money, rates, state } from "../core.js";

function currencyPicker() {
  const selectedCurrency = state.prefs.currency || "USD";
  return `
    <div class="currency-picker" role="radiogroup" aria-label="Currency">
      ${currencies
        .map(
          (currency) => `
          <button type="button" class="currency-option ${selectedCurrency === currency.value ? "selected" : ""}" data-currency-option="${currency.value}" title="${currency.label}" aria-label="${currency.label}" aria-pressed="${selectedCurrency === currency.value}">
          <span>${currency.symbol}</span>
        </button>
      `,
        )
        .join("")}
    </div>
  `;
}

function settingPicker(pref, current, options) {
  const items = options
    .map(
      (option) => `
    <button
      type="button"
      class="setting-option ${String(option.value) === String(state.prefs[pref]) ? "selected" : ""}"
      data-setting-option="${pref}"
      data-value="${option.value}"
      data-label="${escape(option.label)}"
      role="option"
      aria-selected="${String(option.value) === String(state.prefs[pref])}"
    >
      <span>${escape(option.label)}</span>
      <span class="winner-option-check">${String(option.value) === String(state.prefs[pref]) ? "✓" : ""}</span>
    </button>
  `,
    )
    .join("");

  return `
    <div class="setting-picker">
      <button type="button" class="setting-picker-trigger" data-setting-trigger="${pref}" aria-haspopup="listbox" aria-expanded="false">
        <span class="setting-picker-value">${escape(current)}</span>
        <span class="winner-trigger-chevron">⌄</span>
      </button>
      <div class="setting-picker-menu" data-setting-menu="${pref}" role="listbox">
        ${items}
      </div>
    </div>
  `;
}

export function configView() {
  const dark = state.prefs.theme === "dark";
  const names = Array.from(
    { length: 5 },
    (_, index) => `
    <div class="field">
      <label for="pref-name-${index}">Player ${index + 1}</label>
      <input id="pref-name-${index}" data-pref-name="${index}" value="${escape(state.prefs.names[index] || `Player ${index + 1}`)}" />
    </div>
  `,
  ).join("");

  return `
    <div class="page-heading">
      <div><p class="eyebrow">Preferences</p><h1>Config</h1></div>
      <span class="save-note" id="save-note">Saved locally</span>
    </div>
    <div class="card settings-card">
      <div class="setting-row">
        <div><label>Appearance</label><small class="setting-help">Choose a comfortable viewing theme</small></div>
        <button type="button" class="theme-toggle" data-action="toggle-theme" aria-label="Switch to ${dark ? "light" : "dark"} theme">
          <span class="theme-toggle-icon">${dark ? "☀" : "☾"}</span><span>${dark ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>
      <div class="setting-row"><label>Default players</label>${settingPicker(
        "playerCount",
        `${state.prefs.playerCount} players`,
        Array.from({ length: 7 }, (_, index) => ({
          value: index + 2,
          label: `${index + 2} players`,
        })),
      )}</div>
      <div class="setting-row"><div><label>Currency</label><small class="setting-help">Choose the currency shown for amounts</small></div>${currencyPicker()}</div>
      <div class="setting-row"><label>Default point amount</label>${settingPicker(
        "pointRate",
        money(state.prefs.pointRate),
        rates.map((rate) => ({ value: rate, label: money(rate) })),
      )}</div>
      <div class="form-section">
        <h2>Default player names</h2>
        <div class="player-fields">${names}</div>
      </div>
    </div>
  `;
}
