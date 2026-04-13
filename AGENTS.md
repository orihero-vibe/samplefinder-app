# Agent guide — SampleFinder

This document orients coding agents and humans who work on this repository. Prefer it over guessing layout or stack details.

## What this is

- **SampleFinder** — Expo (SDK 54) + React Native (0.81) app, **TypeScript strict**, **New Architecture** enabled in `app.json`.
- **Backend**: Appwrite via `react-native-appwrite` (`src/lib/appwrite.ts`). Env: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID` (and any others declared for `@env` — see `babel.config.js` / `react-native-dotenv`).
- **Appwrite server (configs + functions)** live in the companion repo **`samplefinder-admin`**, under `appwrite/`. If this app repo and admin sit as sibling folders (same parent directory), that path is **`../samplefinder-admin/appwrite`**. Example on this machine: `/Users/mirzaqosimov01/Work/2026/samplefinder-admin/appwrite`. Open or add that folder to the workspace when editing collections, rules, or Appwrite Functions—not this mobile repo.
- **Push**: Firebase / FCM (see `FIREBASE_FCM_SETUP.md`). **Maps**: `react-native-maps` (Android key in `app.json` — treat as sensitive in forks).
- **State**: Zustand stores under `src/stores/`.

## Commands agents should use

| Goal | Command |
|------|---------|
| Dev server | `npm run start` |
| Typecheck (no emit) | `npm run typecheck` |
| iOS native run | `npm run ios` |
| Android native run | `npm run android` |
| Regenerate native projects | `npm run prebuild` (Expo prebuild) |

EAS profiles live in `eas.json` (`development`, `preview`, `production`). Icon pipeline: `npm run update-icons`.

After non-trivial TS changes, run **`npm run typecheck`** before considering work done.

## Repository map

| Area | Role |
|------|------|
| `App.tsx` | Root: fonts, splash, trivia/tier modals, notifications setup |
| `src/navigation/` | `AppNavigator`, stacks, tab bar |
| `src/screens/` | Feature screens; often `useFooScreen.ts` + `styles.ts` + `components/` |
| `src/lib/database/` | Appwrite data access, types, exports via `index.ts` |
| `src/lib/notifications*` | Push / token refresh / reminders |
| `src/components/` | Shared UI and wrappers (`ScreenWrapper`, modals, etc.) |
| `src/constants/`, `src/utils/` | Shared constants and helpers |
| `app.*.js` | Expo config plugins (splash, deeplinks, Firebase, etc.) |

## Import conventions

- Path alias **`@/`** → `src/` (see `tsconfig.json` paths and `babel.config.js` `module-resolver`).
- Env values: **`import { … } from '@env'`** (`.env` at repo root; not committed if secrets).

## Patterns to match

- **Screens**: Logic in `use*Screen.ts`; presentational pieces in `components/`; styles in colocated `styles.ts` when that pattern already exists in the same feature folder.
- **Data**: Add or extend functions in `src/lib/database/` and re-export from `src/lib/database/index.ts` when appropriate.
- **Types**: Prefer types from `src/lib/database/types.ts` or feature-local types consistent with existing files.
- **Do not** introduce server-side Appwrite API keys in the client; client uses session-based access as the app already does.

## Human docs

- `CHECKLIST.md` — release / task checklist if present.
- `FIREBASE_FCM_SETUP.md` — FCM wiring.
- `PRIVACY_TERMS_IMPLEMENTATION.md` — legal / consent context.

## Security note for agents

Do not paste real `.env` values, plist/json secrets, or production keys into chat or commits. Use placeholders in examples.
