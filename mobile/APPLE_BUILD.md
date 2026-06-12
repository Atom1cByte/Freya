# Apple / EAS build: "no team associated with your Apple account"

This error almost never means EAS is broken. It means **Apple's Developer Portal API returns zero teams** for the Apple ID you logged in with.

**App Store Connect "Admin" ≠ Apple Developer Program team member.**

---

## Step 1 — Verify the right portal

Open https://developer.apple.com/account (NOT App Store Connect) while logged in as `jaisalsinkhurana@gmail.com`.

| What you see | Meaning |
|--------------|---------|
| **Membership → Active** + a **Team ID** (10 chars, e.g. `AB12CD34EF`) | You can proceed — go to Step 2 |
| **"Purchase your membership"** or enrollment pending | Paid program not active yet (can take **up to 48 hours** after paying) |
| You only see Apps/TestFlight stuff at appstoreconnect.apple.com but developer.apple.com has no active membership | You're an **App Store Connect user**, not enrolled in the **Developer Program** under this Apple ID |

### Common "I'm admin but EAS says no team" case

You're **Admin in App Store Connect** on a company account, but:

- The **$99/year Apple Developer Program** is enrolled under the **Account Holder's** Apple ID (your boss/founder), not yours
- Invited App Store Connect users are **not** automatically members of the Developer Program team for certificate generation

**Fix:** Either:
1. The **Account Holder** runs EAS credential setup once (Step 4), or
2. Your org adds you in [App Store Connect → Users and Access](https://appstoreconnect.apple.com/access/users) with **"Access to Certificates, Identifiers, and Profiles"** enabled, and your Apple ID is on the Developer Program team

Apple doc: https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/

---

## Step 2 — Accept pending agreements

The **Account Holder** (or you, if you're the holder) must log in at https://developer.apple.com/account and accept any **pending license agreements**. Until accepted, team APIs often return empty.

---

## Step 3 — Run the team debug script (recommended)

This uses the **same `@expo/apple-utils` APIs as EAS** and prints exactly what Apple returns for your Apple ID:

```powershell
cd D:\Projects\Freya\mobile
npm run debug:apple-teams
```

What to look for:

| Script output | Meaning |
|---------------|---------|
| **Teams returned: 0** | Your Apple ID has no Developer Program team — `EXPO_APPLE_TEAM_ID` cannot fix this |
| **Teams listed, but not `NXS4B9HC6S`** | That Team ID belongs to another Apple ID (usually the Account Holder) |
| **Your Team ID appears in the list** | Account is fine — clear stale session (Step 4) and rebuild |

Verbose Apple API logs:

```powershell
$env:EXPO_APP_STORE_DEBUG = "1"
npm run debug:apple-teams
```

---

## Step 4 — Clear stale Apple session and retry with Team ID

EAS cached an expired session (`Session expired Local session` in your log).

```powershell
cd D:\Projects\Freya\mobile

# Clear cached Apple login
Remove-Item -Recurse -Force "$env:USERPROFILE\.app-store\auth" -ErrorAction SilentlyContinue

$env:EXPO_TOKEN = "your-expo-token"
$env:EXPO_APPLE_TEAM_ID = "YOUR_10_CHAR_TEAM_ID"   # from developer.apple.com → Membership

npm run build:ios
```

Find Team ID: **developer.apple.com → Account → Membership details** (top right or membership section).

---

## Step 5 — Account Holder sets up credentials (team workflow)

If you're not the Account Holder:

1. Account Holder runs on their machine (or you share screen):

```powershell
cd D:\Projects\Freya\mobile
$env:EXPO_TOKEN = "expo-token-for-project"
npx eas-cli credentials
```

Select **iOS** → **development** → let EAS create distribution cert + ad hoc profile for `com.freya.app`.

2. You run the build and answer **No** to Apple login:

```
? Do you want to log in to your Apple account? › No
```

EAS uses credentials already stored on the Expo project.

---

## Step 6 — ASC API Key (federated / SSO Apple IDs)

If your Apple ID uses **Sign in with Apple SSO** at work (no password for Developer Portal), password login will fail.

Create an **App Store Connect API Key** (Admin role) and use:

https://docs.expo.dev/app-store-connect/api-keys/

Then pass it to EAS (see Expo docs: "Provide an ASC API Token for your Apple Team").

---

## Step 7 — Simulator build (UI only, no physical iPhone)

If you only need to test the JS shell while sorting Apple account issues:

```powershell
npm run build:ios:sim
```

Install on **iOS Simulator** via EAS. This does **not** replace a device build for WDA on a real iPhone, but unblocks UI testing.

---

## Step 8 — Still stuck after 48h + agreements signed

Contact **Apple Developer Support**: https://developer.apple.com/contact/

Tell them: *"developer.apple.com/account shows no team for my Apple ID in API, but I'm Admin on App Store Connect team X."*

Known Apple-side issues: enrollment not fully activated, name mismatch in their database, pending verification.

---

## Quick checklist

- [ ] Logged into **developer.apple.com** (not just App Store Connect)
- [ ] Membership status = **Active**
- [ ] Copied **Team ID** into `EXPO_APPLE_TEAM_ID`
- [ ] Cleared `%USERPROFILE%\.app-store\auth`
- [ ] All **license agreements** accepted
- [ ] If org account: Account Holder ran `eas credentials` OR you have Certificates/Profiles access
