#!/usr/bin/env node
/**
 * Diagnose Apple Developer team visibility for EAS iOS builds.
 * Uses the same @expo/apple-utils APIs as eas-cli credentials/build.
 *
 * Usage (PowerShell):
 *   cd D:\Projects\Freya\mobile
 *   npm run debug:apple-teams
 *
 * Optional:
 *   $env:EXPO_APPLE_TEAM_ID = "AB12CD34EF"
 *   $env:EXPO_APP_STORE_DEBUG = "1"   # verbose Apple API logs
 */

const { Auth, Teams, JsonFileCache } = require('@expo/apple-utils');

function section(title) {
  console.log(`\n--- ${title} ---`);
}

function printEnv() {
  section('Environment');
  const vars = [
    'EXPO_APPLE_TEAM_ID',
    'EXPO_APPLE_ID',
    'EXPO_APPLE_PROVIDER_ID',
    'EXPO_APPLE_TEAM_TYPE',
    'EXPO_ASC_KEY_ID',
    'EXPO_ASC_ISSUER_ID',
    'EXPO_ASC_API_KEY_PATH',
    'EXPO_APP_STORE_DEBUG',
  ];
  for (const name of vars) {
    const value = process.env[name];
    console.log(`  ${name.padEnd(26)} ${value ?? '(not set)'}`);
  }
}

async function printCachedAppleId() {
  section('Cached Apple ID (from prior EAS / apple-utils login)');
  try {
    const cached = await JsonFileCache.getCacheAsync(
      JsonFileCache.usernameCachePath()
    );
    console.log(`  Last Apple ID: ${cached?.username ?? '(none cached)'}`);
  } catch {
    console.log('  (could not read cache)');
  }
  console.log(
    `  Session dir:   ${process.env.USERPROFILE ?? process.env.HOME}\\.app-store\\auth`
  );
}

function formatTeam(team) {
  const membership = team.memberships?.[0];
  return {
    teamId: team.teamId,
    name: team.name,
    type: team.type,
    status: team.status,
    membershipStatus: membership?.status ?? '(none)',
    membershipExpires: membership?.dateExpire ?? '(none)',
    roles: team.currentTeamMember?.roles?.join(', ') ?? '(none)',
  };
}

function printTeams(teams) {
  section(`Teams returned by Apple Developer Portal (${teams.length})`);
  if (teams.length === 0) {
    console.log('  (empty list — this is the root cause of EAS build failures)');
    return;
  }
  teams.forEach((team, index) => {
    const row = formatTeam(team);
    console.log(`\n  [${index + 1}] ${row.name}`);
    console.log(`      Team ID:           ${row.teamId}`);
    console.log(`      Type:              ${row.type}`);
    console.log(`      Team status:       ${row.status}`);
    console.log(`      Membership status: ${row.membershipStatus}`);
    console.log(`      Membership expiry: ${row.membershipExpires}`);
    console.log(`      Your roles:        ${row.roles}`);
  });
}

function diagnose(teams, envTeamId) {
  section('Diagnosis');

  if (teams.length === 0) {
    console.log(`
Apple's Developer Portal API returned ZERO teams for the Apple ID you logged in with.

That produces EAS errors like:
  "You have no team associated with your Apple account"
  "Valid team IDs are:" (empty)

Setting EXPO_APPLE_TEAM_ID does NOT bypass this — Apple must list the team on your account.

Most common causes:
  1. App Store Connect Admin ≠ Apple Developer Program member
     (ASC access at appstoreconnect.apple.com is not enough for signing)
  2. Paid membership not active yet (can take up to 48h after enrolling)
  3. Pending license agreements on developer.apple.com (Account Holder must accept)
  4. Team NXS4B9HC6S belongs to a different Apple ID (Account Holder)

Fix options:
  A. Log into https://developer.apple.com/account with THIS Apple ID
     → Membership must show Active + Team ID
  B. Account Holder runs: npm run credentials  (once)
     You run build and answer "No" to Apple login
  C. Account Holder adds you with "Access to Certificates, Identifiers, and Profiles"
  D. Use App Store Connect API key auth (see mobile/APPLE_BUILD.md Step 5)
`);
    return;
  }

  const ids = teams.map((t) => t.teamId);
  console.log(`Valid Team IDs for your login: ${ids.join(', ')}`);

  if (envTeamId) {
    if (ids.includes(envTeamId)) {
      console.log(`
EXPO_APPLE_TEAM_ID=${envTeamId} matches a team Apple returned. Signing should work.
If EAS still fails, clear stale session and retry:

  Remove-Item -Recurse -Force "$env:USERPROFILE\\.app-store\\auth" -ErrorAction SilentlyContinue
  npm run build:ios
`);
    } else {
      console.log(`
EXPO_APPLE_TEAM_ID=${envTeamId} is NOT linked to the Apple ID you just used.

You likely copied Team ID from App Store Connect or another person's account.
Use one of the Team IDs listed above, or log in with the Account Holder's Apple ID.
`);
    }
  } else if (teams.length === 1) {
    console.log(`
Only one team found. You can optionally set:
  $env:EXPO_APPLE_TEAM_ID = "${teams[0].teamId}"
`);
  } else {
    console.log(`
Multiple teams found. Set EXPO_APPLE_TEAM_ID to the team that owns com.freya.app:
  $env:EXPO_APPLE_TEAM_ID = "<pick from list above>"
`);
  }
}

async function loginAndFetchTeams({ forceTeamId }) {
  Auth.resetInMemoryData();

  const credentials = forceTeamId ? { teamId: forceTeamId } : {};

  section(
    forceTeamId
      ? `Apple login (forcing teamId=${forceTeamId}, same as EAS build)`
      : 'Apple login (no teamId forced — shows all teams Apple returns)'
  );
  console.log('You will be prompted for Apple ID, password, and 2FA...\n');

  let authState = null;
  let loginError = null;

  try {
    authState = await Auth.loginAsync(credentials, {
      autoResolveProvider: true,
    });
    console.log(`\nLogged in as: ${authState.username}`);
    if (authState.context?.teamId) {
      console.log(`Selected context teamId: ${authState.context.teamId}`);
    }
  } catch (error) {
    loginError = error;
    console.log(`\nLogin/team-selection error: ${error.message}`);
  }

  let teams = [];
  let teamsError = null;

  try {
    teams = await Teams.getTeamsAsync();
  } catch (error) {
    teamsError = error;
    console.log(`\nTeams.getTeamsAsync() error: ${error.message}`);
  }

  return { authState, teams, loginError, teamsError };
}

async function main() {
  console.log('\n=== Freya — Apple Developer Team Debug ===');
  console.log('Same API path as: npx eas-cli build --platform ios\n');

  printEnv();
  await printCachedAppleId();

  const envTeamId = process.env.EXPO_APPLE_TEAM_ID;

  // Pass 1: discover teams without forcing teamId (most useful when env team is wrong)
  const pass1 = await loginAndFetchTeams({ forceTeamId: undefined });
  printTeams(pass1.teams);
  diagnose(pass1.teams, envTeamId);

  // Pass 2: if user set EXPO_APPLE_TEAM_ID and pass1 found teams, show what EAS does when forced
  if (
    envTeamId &&
    pass1.teams.length > 0 &&
    !pass1.teams.some((t) => t.teamId === envTeamId)
  ) {
    section('Note');
    console.log(
      `Skipping second login — ${envTeamId} is not in your team list (see diagnosis above).`
    );
  } else if (envTeamId && pass1.teams.length === 0 && pass1.loginError) {
    section('Simulating EAS with EXPO_APPLE_TEAM_ID');
    console.log(
      `Re-running login with teamId=${envTeamId} to reproduce the exact EAS error...\n`
    );
    Auth.resetInMemoryData();
    try {
      await Auth.loginAsync({ teamId: envTeamId }, { autoResolveProvider: true });
    } catch (error) {
      console.log(`Expected EAS-style error: ${error.message}`);
    }
  }

  section('Next steps');
  console.log('  Full guide: mobile/APPLE_BUILD.md');
  console.log('  Simulator-only (no Apple signing): npm run build:ios:sim');
  console.log('');
}

main().catch((error) => {
  console.error('\nUnexpected error:', error);
  process.exit(1);
});
