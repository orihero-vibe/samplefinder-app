# Privacy Policy & Terms Implementation Checklist

## ✅ Completed

- [x] Created static legal content file (`/src/constants/LegalContent.ts`)
- [x] Updated `TermsModal.tsx` to use static content with database fallback
- [x] Updated `PrivacyModal.tsx` to use static content with database fallback
- [x] Exported legal content from constants index
- [x] Fixed authorization errors during signup
- [x] No linter errors

## 🎯 Required Actions (Choose One Path)

### Path A: Simple Static Implementation (Recommended for Quick Fix)

- [ ] Edit `/src/constants/LegalContent.ts`
  - [ ] Replace `TERMS_AND_CONDITIONS` placeholder with your actual terms
  - [ ] Replace `PRIVACY_POLICY` placeholder with your actual privacy policy
- [ ] Test signup flow
  - [ ] Open sign up screen
  - [ ] Click "Terms & Conditions" link
  - [ ] Verify content displays without errors
  - [ ] Click "Privacy Policy" link  
  - [ ] Verify content displays without errors
- [ ] Done! ✨

### Path B: Database-Driven Implementation (For Dynamic Updates)

- [ ] **Step 1: Configure Appwrite Permissions**
  - [ ] Open Appwrite Console
  - [ ] Go to: Databases → [Your Database] → `settings` table
  - [ ] Click Settings → Permissions
  - [ ] Add permission: Role `guests`, enable only `read`
  - [ ] Save changes

- [ ] **Step 2: Add Content to Database**
  - [ ] Add row:
    - key: `termsAndCondition`
    - value: [Your full terms text]
    - description: "Terms and Conditions for user signup"

- [ ] **Step 3: Update Static Fallback**
  - [ ] Edit `/src/constants/LegalContent.ts`
  - [ ] Replace placeholders with actual content (used as fallback)

- [ ] **Step 4: Test Both Scenarios**
  - [ ] Test with internet: Should fetch from database
  - [ ] Test offline (airplane mode): Should use static fallback
  - [ ] Verify no authorization errors

## 📋 Testing Checklist

- [ ] Authorization error is gone
- [ ] Terms & Conditions link appears inline in the text at bottom of signup
- [ ] Clicking "Terms & Conditions" opens the modal
- [ ] Modal displays content from Appwrite (or static fallback)
- [ ] Accept button works correctly
- [ ] Signup flow completes successfully after accepting
- [ ] Test offline mode (should still show static content)

## 🔍 Verification

Run this command to check if the error is gone:
```bash
yarn ios  # or yarn android
```

Look for these log messages:
- ❌ Should NOT see: "Error fetching terms and conditions"
- ❌ Should NOT see: "The current user is not authorized"
- ✅ Should see: Content loading successfully

## 📞 If You Need Help

1. Check `/PRIVACY_TERMS_IMPLEMENTATION.md` for detailed guide
2. Review console logs for specific errors
3. Verify import statements are correct
4. Ensure legal content is properly formatted (no syntax errors)

## 🎉 Success Criteria

- Users can view Terms & Conditions during signup
- Users can view Privacy Policy during signup
- No authorization errors in console
- Signup flow works end-to-end
