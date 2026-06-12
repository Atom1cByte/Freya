# Expo / EAS login on Windows

There is **no** `eas login --browser`. Use one of these instead.

Always run commands from **`D:\Projects\Freya\mobile`**, not the repo root.

---

## Recommended: access token (no password prompt)

1. Open https://expo.dev/signup and create an account (or log in).
2. Open https://expo.dev/settings/access-tokens
3. Click **Create token**, copy it.
4. In PowerShell:

```powershell
cd D:\Projects\Freya\mobile
$env:EXPO_TOKEN = "paste-your-token-here"
npm run whoami
```

You should see your Expo username. Then:

```powershell
npm run init
npm run device:register
npm run build:ios
```

To avoid setting the token every session, add `EXPO_TOKEN` as a Windows user environment variable (Settings → System → About → Advanced system settings → Environment Variables).

---

## Option B: SSO (GitHub / Google)

```powershell
cd D:\Projects\Freya\mobile
npm run login:sso
```

---

## Option C: email + password in terminal

```powershell
cd D:\Projects\Freya\mobile
npm run login:eas
```

Type email and password when prompted. **Do not** use `--browser` (not supported on EAS CLI).

---

## Commands cheat sheet

| Goal | Command (from `mobile/`) |
|------|---------------------------|
| Check login | `npm run whoami` |
| Link project | `npm run init` |
| Register iPhone | `npm run device:register` |
| Build dev app | `npm run build:ios` |
| Dev server | `npm start` |

Use `npx eas-cli ...` — **not** bare `eas` (not on PATH unless installed globally).

---

## OpenAI key (separate from Expo login)

| Where | Purpose |
|-------|---------|
| `mobile/.env` → `EXPO_PUBLIC_OPENAI_API_KEY` | Local `npm start` |
| EAS secret | Cloud build |

```powershell
npx eas-cli secret:create --name EXPO_PUBLIC_OPENAI_API_KEY --value "sk-..." --type string
```
