# QA matrix: SAM-417 and SAM-418

Use this checklist when validating [SAM-417](https://buildbolder.atlassian.net/jira/software/projects/SAM/boards/424?selectedIssue=SAM-417) and [SAM-418](https://buildbolder.atlassian.net/jira/software/projects/SAM/boards/424?selectedIssue=SAM-418) against staging/production.

For each row, record: **profile / bell list** (in-app JSON on user profile), **OS tray** (system notification), and **notes** (timezone, permissions, Appwrite Messaging logs).

## Prerequisites

- Real device; push enabled; `EXPO_PUBLIC_APPWRITE_FCM_PROVIDER_ID` matches Appwrite Messaging FCM provider.
- Mobile API env: `APPWRITE_NOTIFICATION_FUNCTION_ID` set so `/apply-referral` can invoke the Notification function.
- Database: `user_profiles` includes optional string attribute **`usedReferralCode`** (for idempotent referral apply).

## SAM-418 (system / lifecycle pushes)

| Scenario | Code path | Bell list | OS tray | Test notes |
|----------|-----------|-----------|---------|------------|
| Referral points earned | Sign up with optional referral code → verify email → `POST /apply-referral` → `/send-referral-points-notification` | Referrer: appended by server on successful push | Referrer: FCM/APNs | Invitee must complete email verification; referrer gets +100 points; `usedReferralCode` on invitee. |
| 30-day inactive | Notification function cron: `checkAndSendInactivityNotifications` | Often **no** row (push-only path) | Yes if Messaging OK | Based on Auth `accessedAt`; repeat gated by `lastInactivityNotifAt`. |
| Birthday + points | Cron: `checkAndSendBirthdayNotifications` | Often **no** row | Yes if Messaging OK | Eastern calendar vs `dob`; `birthdayNotifYear` dedupe. |
| Sampling anniversary + points | Cron: `checkAndSendAnniversaryNotifications` | Often **no** row | Yes if Messaging OK | Join date vs `$createdAt`; `anniversaryNotifYear`. |
| Client `createUserNotification` + push | Various app flows calling `createUserNotification` | Always (saved first) | Only if `/send-user-push` succeeds | Push failure is logged only; bell can show without tray. |

## SAM-417 (scheduled app campaigns)

| Scenario | Code path | Bell list | OS tray | Test notes |
|----------|-----------|-----------|---------|------------|
| Trivia Tuesday | Cron: `checkAndSendTriviaTuesday` | **No** (push-only) | Yes if Messaging OK | Tuesday **08:00–09:59 America/New_York** only. |
| New event near you (50 mi, 7 days, favorite) | Cron: `checkAndSendNearbyFavoriteSampling` | **No** (push-only) | Yes if Messaging OK | Same morning ET window; needs location + favorites. |
| Sampling today | Cron: `checkAndSendSamplingToday` | **No** (push-only) | Yes if Messaging OK | Uses **saved** `savedEventIds`, “today” in **ET**, not OS calendar. |
| Local event reminders | `eventReminders.ts` (Expo local) | Synced to bell with `skipPush` patterns | Local tray | Not the same as server “Sampling today”. |

## Android-specific

- App registers notification channel **`default`** (General, high importance) on init; confirm tray behavior when Messaging payload omits `android.channel_id`.
- If tray is still missing, inspect FCM payload in Appwrite Messaging and align channel IDs if the provider adds a custom channel.

## Cron / timezone

- Notification function schedule (e.g. every 15 minutes per deployment docs): campaigns that use the **morning ET** gate only fire in that window—plan tests accordingly.
