# RupeeSplit Android / Google Play readiness

Package ID: com.rupeesplit.app

## Current implementation status

- The React/Vite application is retained; Android packaging is being introduced with Capacitor.
- Web build now uses a Node script instead of the Unix-only cp command so it can run on Windows and Linux.
- GitHub Actions checks TypeScript, production build, and the existing PWA verification script on pull requests and pushes.
- Capacitor Android project generation (npx cap add android) is not committed automatically by this change.

## Release blockers to resolve before Play submission

1. **Firestore authorization:** the current rules allow unauthenticated reads and writes to trip documents and their subcollections. Do not deploy these rules or use real personal/financial data until access is redesigned and tested. The current trip model has no trusted owner UID/member UID, and joining by invite code currently queries the trips collection directly; simply adding request.auth != null would still let every signed-in user access other users' trips. Implement a verified invite redemption/membership model (for example, a trusted backend or a dedicated invite token exchange) and emulator tests before enabling production cloud sync.
2. **Demo authentication:** the current login UI includes a local demo-user bypass, and cached local profile data can be restored without a Firebase session. Remove this bypass and gate cloud actions on a real Firebase Auth user before production.
3. **Native Google sign-in:** signInWithPopup is browser-oriented and should not be assumed to work in a Capacitor Android WebView. Integrate and test a supported native Google sign-in flow that exchanges a credential with Firebase Auth.
4. **Android project and signing:** generate the Android project, configure target SDK 36 or the currently required Play target, app icons/splash screen, and secure release signing from GitHub Actions secrets. Never commit keystores, passwords, OAuth client secrets, or API keys.
5. **Feature validation:** receipt scanning and voice parsing must be tested on-device; do not advertise simulated parsing as reliable OCR/voice transcription.

## Local commands

    npm install
    npm run lint
    npm run build
    npm run test:pwa
    npx cap add android   # only once, after dependencies install
    npx cap sync android
    npx cap open android

A successful web CI run does not by itself mean an Android App Bundle is signed or ready for Play Console.
