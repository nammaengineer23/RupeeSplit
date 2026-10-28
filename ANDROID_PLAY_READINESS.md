# RupeeSplit Android / Google Play readiness

Package ID: `com.rupeesplit.app`

## Requirement comparison (verified from source; not a release approval)

| Requirement | Current source evidence | Status / remaining work |
|---|---|---|
| Preserve the existing RupeeSplit functionality and visual design | Existing React components cover trips, friends, expenses, settlements, analytics, kitty, export, invites, receipt scanner, voice input and UPI flows. | Web UI/components exist. Compare against supplied Google AI Studio screenshots and verify every flow on a phone before claiming visual parity. Some AI/receipt/voice paths may be simulated; verify actual behavior. |
| Native Kotlin + Jetpack Compose | The application is React + TypeScript + Vite, packaged using Capacitor. | **Not met.** This branch does not constitute a native Kotlin/Compose rewrite. A separate native app implementation is required to meet this requirement literally. |
| Android application ID `com.rupeesplit.app` | `capacitor.config.ts` declares this ID. | Configured for Capacitor. Verify generated Android manifest/applicationId in the built artifact. |
| Create/manage trips and friends; record shared expenses | Existing trip, friend and expense components and data types exist. | Source presence verified; full end-to-end scenarios are not yet certified. |
| Different payers and unequal shares | Expense model supports SINGLE, MULTI and KITTY payer modes and EQUAL, UNEQUAL and PERCENTAGE split types. | Model/UI exists; add automated tests for all payer/split combinations and invalid totals. |
| Totals and settlement recommendations | `src/utils/settlement.ts` calculates balances and simplifies debts. | **Needs correction/testing:** the balance calculation rounds to two decimal places, but `simplifyDebts` rounds amounts to whole rupees and only emits settlements of at least ₹1. This can lose paise and produce inaccurate recommendations. |
| Indian rupees and monetary rounding | Expense types say amounts are INR; currency formatting utilities exist. | Default and edge-case behavior should be tested, including paise, uneven splits, and totals that do not divide evenly. |
| Expense history/details, loading, validation and error states | Expense list/modal components and Firestore error handlers exist. | Present in source in part; verify all empty, loading, offline and error paths on device. |
| Shared persistent storage | Firebase Auth and Cloud Firestore client/service modules exist. | Integration code exists, but safe multi-user access is **not configured**. |
| Private trips and account isolation | `firestore.rules` currently permits unauthenticated trip reads/writes and subcollection access. | **Critical security blocker. Do not use real personal/financial data.** Implement trusted ownership/membership and secure invite redemption, then test denial of unrelated-user access in the Firestore emulator. |
| Authentication and account isolation | Google popup sign-in exists, but the auth context also permits demo sign-in and restores a cached profile without a verified Firebase session. | **Not release-ready.** Remove demo bypass and treat only a valid Firebase Auth session as authenticated. Capacitor Android needs a supported native Google sign-in flow verified on device. |
| Secrets and API keys | Firebase client configuration is imported into the app; Android signing secrets are supplied via GitHub Actions secrets. | Firebase client config is not a server secret, but Firestore rules must enforce authorization. Never embed private server credentials or keystores in the app/repository. Audit any AI/service keys and move privileged calls to a trusted backend. |
| Offline/network behavior | Firestore listeners have error callbacks and an offline indicator component exists. | Not fully verified; test reads/writes offline, reconnect behavior, duplicate writes and clear unsaved/error status. Do not imply local/demo data was saved to cloud. |
| Android target API 36+ | Release workflow installs Android 36 and sets target SDK 36 while building. | Workflow configuration exists; verify generated artifact metadata and current Play Console requirements before upload. |
| Versioning, navigation and accessibility | Package version currently says `0.0.0`; Capacitor wrapping is configured. | Set a deliberate user-facing version and unique Android versionCode; verify system back behavior, screen reader labels, touch targets and keyboard/focus behavior. |
| Signed APK/AAB | Android release workflow builds and uploads both artifacts. | An earlier commit produced artifacts. The latest contact-picker changes require a successful new workflow and a physical-device test. |
| Tests and release summary | TypeScript/build/PWA checks and Android build workflow exist. | These are build checks, not proof of calculation correctness, Firestore security, account isolation, or device UX. Add unit tests, Firestore emulator security tests, and on-device end-to-end checks. |

## Critical release blockers

1. **Architecture mismatch:** the requested deliverable is Kotlin + Jetpack Compose. This branch currently packages the original React application using Capacitor. Do not label it a native Kotlin app. A native rewrite must reproduce the existing screens and behaviors against the original source/screenshots.
2. **Firestore security:** the current rules permit unauthenticated access to trips and subcollections. The trip model does not currently provide trusted owner/member UID authorization. Do not deploy these rules or use real personal/financial data until an authenticated membership and invite-redemption design is implemented and emulator-tested.
3. **Authentication:** remove demo-user bypass and cached-profile-as-authentication behavior. Require a real Firebase Auth session for cloud operations and implement/test native Google sign-in for Android.
4. **Money correctness:** update settlement simplification to preserve paise (integer paise arithmetic is preferred) and add tests for uneven splits, multiple payers, zero balances, and settlement conservation.
5. **Feature verification:** verify receipt scanning, voice input, UPI settlement, contacts, offline handling, account isolation, trip sharing and all original screens on physical Android devices. Clearly distinguish generated suggestions from verified payment/receipt data.
6. **Release validation:** confirm application ID, versionCode/versionName, target SDK, signing, APK installation, AAB metadata, accessibility, Android back behavior and Play Console requirements. No automatic Play publishing is configured or intended.

## Current automated checks

- TypeScript check, production web build and PWA verification are CI checks; passing them does not prove Android runtime behavior or security.
- Android CI is configured to build and upload a signed APK and AAB. Check the latest workflow run for the latest commit before distributing artifacts.
- A prior successful Android workflow produced `rupeesplit-release-apk` and `rupeesplit-release-aab` artifacts for an earlier commit. Those artifacts do not include later changes.
- No claim is made here that Firestore account-isolation tests, expense-calculation tests, native Kotlin/Compose tests, or full physical-device end-to-end tests have passed.

## Existing project commands

```sh
npm install
npm run lint
npm run build
npm run test:pwa
npx cap add android
npx cap sync android
npx cap open android
```

These commands build the existing React/Capacitor application, not a Kotlin/Jetpack Compose implementation.
