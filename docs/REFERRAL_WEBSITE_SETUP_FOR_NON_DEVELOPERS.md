# Setting up simplefinder.com for “Refer a friend” links  
### A step-by-step guide for people who are not developers

This guide explains **what needs to happen on your website** so that when someone shares a SampleFinder referral link, phones can open the app when it is installed—or send people to the App Store or Google Play when it is not—and still count the referral correctly.

Your technical teammate has already prepared **template files** in the project folder  
`web/referral-landing/`.  
This document tells you **what those files are for**, **what to fill in**, **where they must live on simplefinder.com**, and **how to check that it worked**.

---

## 1. What you are trying to achieve (in everyday words)

- A user taps a link like **https://simplefinder.com/referral/ABCD** (the letters are their short referral code).
- **If SampleFinder is already on their phone**, the phone should **open the app** and remember that code so points can be awarded after the new person signs up and verifies email.
- **If the app is not installed**, they should see a **simple webpage** with:
  - Buttons to download from the **App Store** (iPhone) or **Google Play** (Android), and  
  - **QR codes** they can scan with another device to get the same store links.

Apple and Google do not do this automatically. You have to **publish a few specific files** on simplefinder.com and **configure the page** so links behave correctly. That is what this guide walks through.

---

## 2. Roles: who does what

| Role | Typical tasks |
|------|----------------|
| **You (project owner / ops)** | Decide priorities, approve store links, coordinate with whoever controls the domain, confirm the site “feels right” after go-live. |
| **Person who manages simplefinder.com** (hosting company, freelancer, or in-house web person) | Uploads files, turns on the “rewrite” rules explained below, sets file types where needed. |
| **Your app developer** | Provides the **real App Store link** for your app, the **Android signing fingerprint** (explained later), and deploys app updates if Apple/Google still do not open the app (that part is in the app build, not only the website). |

You can forward **this entire document** to the person who will touch the website and ask them to follow the checklist in section 6.

---

## 3. Words you might see (simple glossary)

- **Domain** — Your website address, e.g. simplefinder.com.  
- **Hosting / host** — The service or company where simplefinder.com’s files are stored and served to visitors.  
- **Universal Links (Apple)** — Apple’s name for “this website link is allowed to open this specific app.” Requires a small file on your site that Apple checks.  
- **App Links (Android)** — Google’s version of the same idea. Requires another small file on your site.  
- **Landing page** — The normal webpage people see in a browser if the app does not open. Ours includes store buttons and QR codes.  
- **Rewrite rule** — A setting on the server that says “when someone asks for `/referral/SOMETHING`, show them the same page as `/referral/index.html` so the address bar can still show the code.” Without this, long links might show an error on some hosts.

---

## 4. What is in the `web/referral-landing` folder (no code, just meaning)

Your developer placed these for you:

1. **`referral/index.html`**  
   The **visitor-facing page**: short explanation, App Store button, Play Store button, two QR codes.  
   **You must put the real App Store URL in here** (see section 5). The Play Store link is usually already set to your Android package name; confirm with your developer.

2. **`.well-known/apple-app-site-association`**  
   A **permission file for Apple**. It tells iPhones: “links on simplefinder.com that start with `/referral/` may open the SampleFinder app.”  
   It must be reachable at exactly:  
   `https://simplefinder.com/.well-known/apple-app-site-association`  
   (no `.html` on the end.)

3. **`.well-known/assetlinks.json`**  
   A **permission file for Android**. Same idea for Google Play devices.  
   It must be reachable at:  
   `https://simplefinder.com/.well-known/assetlinks.json`  
   **You must insert one technical value** your developer gives you: the **release app signing fingerprint** (section 5).

4. **`_redirects`**  
   Used if you host on **Netlify**. Tells Netlify to serve the landing page for any path like `/referral/ANYCODE`.

5. **`vercel.json`**  
   Used if you host on **Vercel**. Same idea as `_redirects`, different product.

6. **`README.md`** (in that folder)  
   Short technical notes for developers; you can ignore it if you are using this guide.

---

## 5. Information to collect before you start

Ask your app developer for:

1. **Final App Store URL**  
   Example shape: `https://apps.apple.com/app/id…`  
   This goes into the landing page file so the “App Store” button and iPhone QR code are correct.

2. **Google Play listing URL**  
   Usually looks like a long link containing `id=com.samplefinder.app`. Confirm it matches the **production** app.

3. **Android release signing SHA-256 fingerprint**  
   This is a long string of letters and numbers (sometimes shown with colons). It proves the app in the Play Store is the same app your website is vouching for.  
   **Only the production (“release”) app matters** for real users—not test builds.

4. **Where simplefinder.com is hosted**  
   Examples: Netlify, Vercel, Cloudflare Pages, AWS, GoDaddy Website Builder, WordPress on a VPS, etc.  
   The exact clicks differ, but the **goals** are always: upload files to the right paths, add rewrite rules if needed, set one file’s type for Apple.

---

## 6. Master checklist (do in order)

Use this as a work order for whoever configures the site.

### Step A — Prepare the files

- [ ] Open `referral/index.html` with any text editor (or ask your developer to edit it).  
- [ ] Replace the **placeholder App Store link** with your **real** App Store URL.  
- [ ] Confirm the **Google Play** link is correct for production.  
- [ ] Open `.well-known/assetlinks.json`.  
- [ ] Replace the placeholder fingerprint line with the **SHA-256** your developer provided.  
- [ ] Do **not** change `apple-app-site-association` unless your developer changes the app’s bundle ID or team ID (rare).

### Step B — Put files on simplefinder.com at the correct addresses

After upload, a normal web browser should be able to open:

- [ ] `https://simplefinder.com/referral/` (or any `https://simplefinder.com/referral/TESTCODE` once rewrites work — see Step C)  
- [ ] `https://simplefinder.com/.well-known/apple-app-site-association`  
- [ ] `https://simplefinder.com/.well-known/assetlinks.json`  

**Important:** The two `.well-known` files must sit **at the root of simplefinder.com**, not inside `/referral/`, unless your developer explicitly configured otherwise (unusual).

### Step C — Enable “friendly” referral URLs (rewrites)

When someone visits `https://simplefinder.com/referral/ABCD`, many simple hosts look for a **folder** named `ABCD` and fail. You want the server to **always serve** `referral/index.html` for any path under `/referral/`.

- [ ] If you use **Netlify**: upload the `_redirects` file to the **publish root** of the site (same level as `referral` and `.well-known`).  
- [ ] If you use **Vercel**: include `vercel.json` at the project root the way Vercel expects.  
- [ ] If you use **another host**: ask the host or your developer to “**rewrite** `/referral/*` to `/referral/index.html`” (or the equivalent in their control panel).

### Step D — Apple’s file must be served as JSON

Some hosts serve unknown files incorrectly. Apple expects the **apple-app-site-association** file to be treated as **JSON** (content type `application/json`).

- [ ] After upload, ask your developer—or use an online “HTTP header checker”—to confirm the response type is acceptable. If Apple’s validator fails, the host may need a small configuration change (your developer can fix this quickly).

### Step E — Wait for caches

Apple and Google **cache** these permission files. After you change them:

- [ ] Wait **up to 24–48 hours** before assuming a fix failed.  
- [ ] You can still test the **landing page** and buttons immediately.

### Step F — Validate with official tools (developer can run these)

- [ ] Apple: App Search / Universal Links validation (your developer has the link).  
- [ ] Google: Digital Asset Links statement checker (your developer has the link).  

If validation passes, phones are much more likely to open the app from the link.

### Step G — Real-world smoke test

On a **real iPhone** with the **production** app installed from the App Store:

- [ ] Tap a referral link in Notes or Messages.  
- [ ] The app should open (or you should be offered to open it).

On a **real Android** with the **production** app installed from Play:

- [ ] Same test.

On a phone **without** the app:

- [ ] The **landing page** should appear with working store buttons and scannable QR codes.

---

## 7. What you should **not** worry about (developer handles in the app)

- Storing the referral code on the phone until the user verifies email.  
- Awarding points in Appwrite and the “claim referral” server function.  
- The exact text in the share sheet inside the app.

The website’s job is: **trust**, **routing**, and **fallback** (pretty page + stores + QR).

---

## 8. If something goes wrong

| Symptom | Plain-language cause | What to try |
|--------|------------------------|-------------|
| Link opens the website but never the app | Apple/Google file missing, wrong path, wrong fingerprint, or cache | Re-check Step B and D; wait for cache; confirm production app is installed |
| “Page not found” for `/referral/ABC123` | Rewrite rules not enabled | Step C |
| Buttons go to wrong store or wrong app | Placeholder URL not replaced | Step A |
| Android never opens app from link | `assetlinks.json` fingerprint wrong or not release key | Step A + developer |
| Everything works on iPhone but not Android (or the reverse) | Only one platform configured correctly | Fix the failing platform’s file |

When in doubt, send your host support and your app developer **the exact URL** that fails and **what you expected** vs **what happened**.

---

## 9. Summary in one paragraph

Publish the **landing page** and two **permission files** from `web/referral-landing` to simplefinder.com in the right places, **fill in** the real App Store link and Android fingerprint, turn on **rewrites** for `/referral/*`, confirm Apple’s file is served as JSON, then **validate** with Apple’s and Google’s tools and test on real phones. After that, referral links can open the app when installed and otherwise guide people to the stores while keeping the experience clear and professional.

---

## 10. Where to find the technical details

For engineers implementing the full flow (app, database, functions), see:

- `docs/REFERRAL_DEEP_LINKING.md`  
- `web/referral-landing/README.md`

This non-developer guide is only about **simplefinder.com** and the files in **`web/referral-landing`**.
