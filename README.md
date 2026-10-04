# Marriage Hisab Kitab — Web

Marriage Hisab Kitab is a vanilla JavaScript browser version of the iOS Marriage point calculator for the Nepali Marriage card game.

It has no third-party runtime dependencies, build bundler, server API, or account system. Game data is stored locally in the browser with `localStorage`.

## Features

- Home, Games history, Config, Rules, New Game, Scoreboard, Round Details, and round editor pages
- 2–8 players with configurable default names and point rate
- Seen/Unseen status, Dubli, Maal stepper, and winner selection
- Matching iOS round-scoring logic
- Live round scores, cumulative totals, and dollar amounts
- Round editing and deletion
- Game deletion and scoreboard sharing/copying
- Responsive desktop and mobile layouts
- Installable as a PWA on supported desktop and mobile browsers
- Offline app-shell caching through a service worker

## Code structure

```text
app.js                 Application controller and event handlers
js/core.js             Shared state, persistence, navigation, and helpers
js/modals.js           New Game and confirmation modal markup
js/views/               One module per application view
styles/styles.css      Application styles
manifest.webmanifest   PWA install metadata and icons
sw.js                  Offline service worker
```

## Requirements

- macOS, Linux, or Windows
- Python 3 for the local static server
- Node.js for the JavaScript syntax check used by `just build`
- `just` command runner

## Run on localhost

From the web app folder:

```bash
cd "/Users/<user>Marriage-Hisab-Kitab"
just run
```

`just run` opens [http://localhost:8000](http://localhost:8000) automatically in the default macOS browser. Stop the server with `Ctrl+C`.

You can also use the alias:

```bash
just serve
```

## Install on a device

The app is a Progressive Web App. Install prompts require `localhost` during development or HTTPS when deployed.

- Chrome, Edge, and other Chromium browsers: open the app, then use the Install icon in the address bar or the in-app **Install** button.
- Firefox: use the browser’s site/application installation option when available. Firefox support varies by platform and version.
- Safari on macOS: use **File > Add to Dock**.
- Safari on iPhone or iPad: open the HTTPS site in Safari, tap **Share**, then **Add to Home Screen**.
- Android Chrome: open the site and choose **Install app** or **Add to Home screen**.
- Windows: install from Edge/Chrome’s address-bar install icon; the app opens as a standalone window.

The service worker caches the app shell for repeat visits and offline startup. Game data remains local to each browser/device and is not synchronized between devices.

## Build and validate

This is a static frontend, so the build command runs validation checks instead of producing a compiled bundle:

```bash
just build
```

The build confirms the required files exist, validates `app.js` with Node.js, and stops any process already using port `8000`. To run only the checks without touching the port:

```bash
just check
```

List all available commands:

```bash
just
```
