# simplefinder.com — referral landing & app links

Static assets for `https://simplefinder.com/referral/{code}` and universal / app links.

## Contents

| File | Host path | Notes |
|------|-----------|--------|
| `referral/index.html` | `/referral/` and `/referral/:code` (needs rewrite) | Store buttons + QR codes; set real App Store URL in the script |
| `.well-known/apple-app-site-association` | `/.well-known/apple-app-site-association` | iOS Universal Links; `Content-Type: application/json` |
| `.well-known/assetlinks.json` | `/.well-known/assetlinks.json` | Android App Links; replace `sha256_cert_fingerprints` with release keystore SHA-256 |
| `_redirects` | Netlify | Rewrites `/referral/*` to `referral/index.html` |
| `vercel.json` | Vercel | Same rewrites |

## Deploy

1. Replace the App Store URL placeholder in `referral/index.html` (`IOS` variable).
2. Fill `assetlinks.json` with your **release** signing certificate SHA-256 (from Play Console or `keytool`).
3. Upload the site root so `.well-known` and `referral/` are served at the domain root.
4. Validate: [Apple AASA](https://search.developer.apple.com/appsearch-validation-tool/), [Google Statement List Generator](https://developers.google.com/digital-asset-links/tools/generator).

## samplefinder-admin

When the `samplefinder-admin` repo is available, deploy the updated **Mobile API** function from `appwrite/functions/Mobile API/` per your team workflow so server and console stay in sync.
