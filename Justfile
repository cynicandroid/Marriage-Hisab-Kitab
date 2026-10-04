set shell := ["zsh", "-cu"]

port := "8000"

default:
    @just --list

# Run JavaScript syntax checks and verify required web files exist.
build: check free-port
    @echo "Marriage Hisab Kitab web build checks passed."

# Validate the frontend JavaScript and required files.
check:
    @test -f index.html
    @test -f styles/styles.css
    @test -f app.js
    @test -f manifest.webmanifest
    @test -f sw.js
    @test -f assets/icons/icon-192.png
    @test -f assets/icons/icon-512.png
    @test -f assets/icons/icon-maskable-512.png
    @test -f js/core.js
    @test -f js/modals.js
    @test -f js/views/home.js
    @test -f js/views/games.js
    @test -f js/views/config.js
    @test -f js/views/rules.js
    @test -f js/views/scoreboard.js
    @test -f js/views/round.js
    @test -f js/views/detail.js
    @test -f README.md
    @test -f Justfile
    @node --check app.js
    @node --check js/core.js
    @node --check js/modals.js
    @node --check js/views/home.js
    @node --check js/views/games.js
    @node --check js/views/config.js
    @node --check js/views/rules.js
    @node --check js/views/scoreboard.js
    @node --check js/views/round.js
    @node --check js/views/detail.js
    @node --check sw.js

# Stop any process currently listening on the development port.
free-port:
    @pids=$(lsof -ti tcp:{{port}} 2>/dev/null); if [ -n "${pids}" ]; then echo "Stopping process(es) on port {{port}}: ${pids}"; kill ${pids}; fi

# Start the app on http://localhost:8000 and open it in the default browser.
run: free-port
    @python3 -m http.server {{port}} >/tmp/marriage-game-web-server.log 2>&1 & server_pid=$!; trap 'kill $server_pid 2>/dev/null || true' EXIT INT TERM; sleep 0.5; open http://localhost:{{port}}; wait $server_pid

# Alias for run.
serve:
    @just run
