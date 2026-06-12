# Freya on Windows → iPhone

You **cannot** run `expo prebuild --platform ios` or `expo run:ios` on Windows. Apple requires macOS for local iOS builds. Use **EAS Build** (Expo's cloud) instead.

Your `.env` is loading correctly (`env: load .env` in the terminal output).

## Step 1 — Log in to Expo (free account)

**Do not use `--browser` on Windows** — it often crashes when opening the login URL.

### Option A — Username + password in terminal (easiest)

```powershell
cd D:\Projects\Freya\mobile
npx expo login
```

Type your email and password when prompted (no browser).

### Option B — Access token (if terminal login fails)

1. Open https://expo.dev/settings/access-tokens in your browser (log in manually).
2. Create a token, copy it.
3. In PowerShell **for this session**:

```powershell
$env:EXPO_TOKEN = "your-token-here"
npx expo whoami
```

To persist, add `EXPO_TOKEN` to your user environment variables in Windows Settings.

### Option C — Manual browser + SSO link

If you must use browser login, open the URL yourself in Chrome/Edge **before** the CLI crashes:

```powershell
Start-Process "https://expo.dev/login"
```

Then use Option A or B instead — browser callback on Windows is unreliable.

## Step 2 — Link the project to Expo

Install deps first (includes `eas-cli`):

```powershell
npm install
```

Then:

```powershell
npm run eas init
```

Or: `npx eas-cli init` (not `npx eas init` — that package name is wrong).

Say **yes** when it asks to create a project. This adds a `projectId` to your app config.

## Step 3 — Register your iPhone

```powershell
npm run eas device:create
```

Or: `npx eas-cli device:create`

Scan the QR code **on your iPhone** to register it for internal (dev) installs.

## Step 4 — Add API key to EAS (for cloud builds only)

Your `mobile/.env` is for **local** `npm start` only. EAS cloud builds don't read `.env` — use a secret:

```powershell
npx eas-cli secret:create --name EXPO_PUBLIC_OPENAI_API_KEY --value "sk-your-key-here" --type string
```

Do **not** put the key in `eas.json` — EAS rejects empty env values there.

## Step 5 — Build the dev client in the cloud

```powershell
npm run build:ios
```

This takes ~15–25 minutes. When done, EAS gives you a link/QR code — open it **on your iPhone** to install the Freya dev app.

Apple will ask you to trust the developer certificate: **Settings → General → VPN & Device Management**.

## Step 6 — Run the dev server on Windows

With the dev client installed on your phone:

```powershell
npm start
```

Scan the QR code with your iPhone camera (or enter the URL shown). Phone and PC must be on the **same Wi‑Fi**.

---

## What won't work on Windows

| Command | Why |
|---------|-----|
| `npx expo prebuild --platform ios` | No iOS SDK on Windows |
| `npx expo run:ios --device` | Requires macOS + Xcode |
| Expo Go | Freya needs native modules (`freya-orchestrator`, dev client) |

## Apple Developer account

- **Physical iPhone dev builds** need an Apple ID (free works for limited device testing via EAS, or $99/yr Apple Developer for smoother signing).
- EAS walks you through credentials on first build — choose **Let EAS handle credentials**.

## Optional — Android on Windows

You can test the UI shell on Android (no WDA/iOS automation):

```powershell
npx expo prebuild --platform android
npx expo run:android
```

Native iOS orchestration still requires the iPhone dev build from Step 5.
