# Referral Page Setup Guide

This document explains how the referral deep-link and fallback page system works, what the devops team needs to configure on the server, and what dependencies must exist in Appwrite for the page to function correctly.

---

## How It Works

```
User receives referral link (SMS, WhatsApp, share sheet, etc.)
↓
Link format: https://samplefinder.com/referral/JNKLOW
↓
┌────────────────────────────────────────────────────────────┐
│                     PLATFORM HANDLING                      │
├────────────────────────────────────────────────────────────┤
│ Mobile — app installed:                                    │
│   iOS:     apple-app-site-association intercepts URL       │
│   Android: assetlinks.json intercepts URL                  │
│   → App opens directly at SignUp screen, code pre-filled   │
│                                                            │
│ Mobile — app NOT installed:                                │
│   Browser opens the URL                                    │
│   → Server serves refer-fallback.html                      │
│   → Page auto-redirects to App Store / Google Play         │
│                                                            │
│ Desktop:                                                   │
│   Browser opens the URL                                    │
│   → Server serves refer-fallback.html                      │
│   → Page shows store badges + QR codes                     │
└────────────────────────────────────────────────────────────┘
↓
refer-fallback.html JS extracts the code from the URL path
↓
User downloads the app and enters the referral code at signup
↓
applyReferralAfterVerification() awards 100 points to both users
```

---

## Server Routing Fix

The file `refer-fallback.html` was deployed at:

```
https://samplefinder.com/referral/refer-fallback.html   ← WRONG
```

Real referral links look like:

```
https://samplefinder.com/referral/JNKLOW               ← CORRECT
```

The HTML page extracts the referral code from the URL path. When accessed at its literal filename, no code is found and the page shows `------`. The web server **must route all `/referral/[CODE]` requests to serve this HTML file**.

### Option A — Apache `.htaccess` (recommended for WordPress)

Add this rule **before** the `# BEGIN WordPress` block in `.htaccess`:

```apache
# SampleFinder referral deep-link fallback
RewriteEngine On
RewriteRule ^referral/([A-Z2-9]{6})/?$ /referral/refer-fallback.html [L,QSA]
```

### Option B — nginx location block

```nginx
location ~ ^/referral/[A-Z2-9]{6}/?$ {
    try_files /referral/refer-fallback.html =404;
}
```

### Option C — WordPress (no server config access)

If you cannot edit `.htaccess` or `nginx.conf`, use the **Redirection** plugin (or similar):

1. Install the Redirection plugin
2. Add a regex redirect: source `/referral/([A-Z2-9]{6})`, target `/referral/refer-fallback.html`
3. Set type to "Pass-through" (not 301/302 redirect, so the URL stays as `/referral/JNKLOW`)

---

## Appwrite Settings Collection (Devops Action Required)

The page fetches live store URLs from Appwrite so they can be updated without re-deploying the HTML. The following two documents **must exist** in the database:

- **Endpoint:** `https://nyc.cloud.appwrite.io/v1`
- **Project ID:** `691d4a54003b21bf0136`
- **Database ID:** `69217af50038b9005a61`
- **Collection:** `settings`

| Document `key` | Document `value` |
|---|---|
| `appstore_link` | Full App Store URL once the app is published, e.g. `https://apps.apple.com/app/samplefinder/id123456789` |
| `playstore_link` | Full Play Store URL once the app is published, e.g. `https://play.google.com/store/apps/details?id=com.samplefinder.app` |

Without these documents the page falls back to placeholder URLs that will 404.

---

## Referral Code Format

Codes are exactly **6 characters**, uppercase alphanumeric, excluding easily confused characters (no `0`, `1`, `O`, `I`):

```
Pattern: /^[A-Z2-9]{6}$/
Example: JNKLOW, 2BV4M9, X7KP3R
```

The URL path must carry the code directly:

```
https://samplefinder.com/referral/JNKLOW   ✓
https://samplefinder.com/referral/?code=JNKLOW   ✗  (query param — not supported)
```

---

## Open Graph / Social Sharing

To get proper link previews (thumbnail + title) when the referral link is shared on WhatsApp, iMessage, Telegram, Slack, etc.:

1. Create a `1200 × 630 px` branded image (e.g. app screenshot + "Join SampleFinder" text)
2. Host it publicly, e.g. `https://samplefinder.com/wp-content/uploads/referral-og.png`
3. Update the `og:image` meta tag in `refer-fallback.html`:

```html
<meta property="og:image" content="https://samplefinder.com/wp-content/uploads/referral-og.png" />
```

---

## Logo Assets

The correct white/reversed logo assets are already hosted on the website and used in the fallback page:

| Variant | URL |
|---|---|
| Stacked (used in fallback page) | `https://samplefinder.com/wp-content/uploads/2025/10/SampleFinder-Logo-stacked-rev.png` |
| Horizontal | `https://samplefinder.com/wp-content/uploads/2025/10/SampleFinder-Logo-horiz-rev-1.png` |

---

## Related Files

| File | Purpose |
|---|---|
| `docs/well-known/refer-fallback.html` | Web fallback landing page (this is what gets served) |
| `docs/well-known/apple-app-site-association` | iOS universal link configuration |
| `docs/well-known/assetlinks.json` | Android app link verification |
| `src/lib/deepLink.ts` | Deep link parsing & handling inside the app |
| `src/lib/referral.ts` | Referral code validation, storage, and application |
| `src/navigation/AppNavigator.tsx` | Routes deep links to the SignUp screen |
