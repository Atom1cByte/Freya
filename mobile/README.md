# Freya — iPhone App

Dynamic iOS control — no hardcoded app list. Freya reads your screen and acts via **WebDriverAgent** + optional **GPT-4o vision**.

## How it works

```
You: "Open Spotify and play Blinding Lights"
         ↓
    Agent loop (up to 30 steps)
         ↓
  1. Read accessibility tree + screenshot
  2. LLM plans next tap/type/swipe
  3. WDA executes on device
  4. Repeat until done
```

**Opening any app** uses iOS Spotlight search — no bundle IDs hardcoded in Freya.

## Requirements

1. **Development build** (`expo run:ios --device`) — not Expo Go
2. **WebDriverAgent** running on your iPhone (port 8100)
3. **`EXPO_PUBLIC_OPENAI_API_KEY`** — strongly recommended for multi-step tasks (play a song, navigate Roblox, etc.)

Heuristic mode handles simple `open X` via Spotlight without an API key. Complex goals need the LLM.

## Setup

```powershell
cd mobile
npm install
npx expo prebuild --platform ios
npx expo run:ios --device
```

### WebDriverAgent

1. Clone https://github.com/appium/WebDriverAgent
2. Open in Xcode, sign with your Apple ID
3. Run **WebDriverAgentRunner** on your device
4. Freya Settings → WDA URL (`http://<device-ip>:8100` or `127.0.0.1:8100` with USB forwarding)

### API key

Create `mobile/.env`:

```
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

## Example prompts

- `Open Roblox`
- `Open Spotify and play Blinding Lights`
- `Open YouTube and search lo-fi beats`
- `What matters today?` (reads real Calendar via EventKit)

Sensitive actions (send, buy, pay) require approval first.

## Architecture

| Layer | Role |
|-------|------|
| `lib/agent/runner.ts` | Observe → plan → act loop |
| `lib/agent/step-planner.ts` | GPT-4o + screenshot → next step |
| `lib/agent/wda-client.ts` | Tap, type, swipe, Spotlight, page source |
| `modules/freya-orchestrator` | EventKit calendar/reminders (API, not GUI) |

## Limits

- Apple blocks system-wide touch injection in App Store apps — WDA runs as a signed test runner on your device
- Freya sees and controls whatever is on screen; it doesn't ship with per-app scripts
- SMS/email sends still need your finger on Send
