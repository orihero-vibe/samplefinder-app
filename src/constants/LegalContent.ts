/**
 * OFFLINE FALLBACK ONLY — not the legal text users normally see, and
 * deliberately NOT a copy of it.
 *
 * Legal content is dynamic and admin-managed. PrivacyModal and TermsModal fetch
 * getSetting('privacy_policy') / getSetting('termsAndCondition') from the
 * Appwrite `settings` collection; the constants below render only when the row
 * is missing or that fetch fails.
 *
 * The canonical documents are the published pages at the URLs in LEGAL_URLS.
 * They are what A2P/TCR reviewers and the App Store read, and what goes in the
 * A2P campaign's Privacy Policy / Terms URL fields.
 *
 * These fallbacks point at those URLs rather than restating the policies,
 * on purpose: a second, differently-worded copy of a legal document is both a
 * legal risk and an A2P rejection cause on its own — Twilio treats conflicting
 * statements across policies as grounds to reject a campaign (error 30908).
 * Keep these as pointers. Do not paste policy text back in here.
 *
 * See samplefinder-admin/legal/README.md for the update workflow.
 */

/**
 * The published legal pages. Canonical for the app, the App Store listing and
 * A2P 10DLC campaign registration.
 */
export const LEGAL_URLS = {
  privacyPolicy: 'https://samplefinder.com/privacy-policy/',
  termsAndConditions: 'https://samplefinder.com/terms-and-conditions/',
} as const;

export const TERMS_AND_CONDITIONS = `
Terms & Conditions

We couldn't load the latest Terms & Conditions right now.

You can always read the current version here:

${LEGAL_URLS.termsAndConditions}

It covers your account, eligibility, acceptable use, and how we communicate with
you by email and text message.

Questions: support@samplefinder.com
`;

export const PRIVACY_POLICY = `
Privacy Policy

We couldn't load the latest Privacy Policy right now.

You can always read the current version here:

${LEGAL_URLS.privacyPolicy}

It covers what we collect, how we use it, and our text messaging practices —
including that your mobile number is used solely to send one-time verification
codes, that message and data rates may apply, and how to reply HELP for help or
STOP to opt out.

Questions: privacy@samplefinder.com
`;
