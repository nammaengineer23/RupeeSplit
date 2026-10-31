#!/bin/bash
set -e

echo "=== Step 1: Installing Java 21 & tools if missing ==="
if ! command -v java >/dev/null 2>&1 || ! command -v keytool >/dev/null 2>&1; then
    apt-get update -qq
    apt-get install -y -qq openjdk-21-jdk-headless wget unzip
fi

JAVA_BIN="$(which java)"
JAVA_DIR="$(dirname "$(dirname "$(readlink -f "$JAVA_BIN")")")"
export JAVA_HOME="$JAVA_DIR"
export PATH="$JAVA_HOME/bin:$PATH"
echo "Java Home: $JAVA_HOME"
java -version

echo "=== Step 2: Preparing Android SDK in /app/applet/.android-sdk ==="
SDK_DIR="/app/applet/.android-sdk"
mkdir -p "$SDK_DIR/cmdline-tools"

if [ ! -f "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" ]; then
    echo "Downloading Android commandline tools..."
    cd /tmp
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip
    unzip -q cmdline-tools.zip -d "$SDK_DIR/cmdline-tools"
    rm -rf "$SDK_DIR/cmdline-tools/latest"
    mv "$SDK_DIR/cmdline-tools/cmdline-tools" "$SDK_DIR/cmdline-tools/latest"
    rm -f cmdline-tools.zip
fi

export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"
export PATH="$PATH:$SDK_DIR/cmdline-tools/latest/bin:$SDK_DIR/platform-tools"

echo "Accepting licenses..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true

if [ ! -d "$SDK_DIR/platforms/android-36" ] || [ ! -d "$SDK_DIR/build-tools/36.0.0" ]; then
    echo "Installing platform-tools, platforms;android-36 and build-tools;36.0.0..."
    sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" > /dev/null 2>&1
fi

echo "sdk.dir=$SDK_DIR" > /app/applet/android/local.properties

echo "=== Step 3: Web Build & Capacitor Sync ==="
cd /app/applet
npm run build
npx cap sync android

echo "=== Step 4: Building Signed Release APK ==="
cd /app/applet/android
chmod +x ./gradlew
./gradlew assembleRelease --no-daemon -Dorg.gradle.parallel=false -Dorg.gradle.workers.max=1

echo "=== Step 5: Building Signed Release AAB (App Bundle for Play Store) ==="
./gradlew bundleRelease --no-daemon -Dorg.gradle.parallel=false -Dorg.gradle.workers.max=1

echo "=== Step 6: Copying artifacts to /.aistudio/artifacts/brain/e017beee-0d91-44f5-b93a-e93c10724bf2/ ==="
ARTIFACT_DIR="/.aistudio/artifacts/brain/e017beee-0d91-44f5-b93a-e93c10724bf2"
mkdir -p "$ARTIFACT_DIR"

cp /app/applet/android/app/build/outputs/apk/release/app-release.apk "$ARTIFACT_DIR/app-release.apk"
cp /app/applet/android/app/build/outputs/bundle/release/app-release.aab "$ARTIFACT_DIR/app-release.aab"
cp /app/applet/android/app/build/outputs/apk/release/app-release.apk /app/applet/public/RupeeSplit.apk

echo "=== Artifacts Generated Successfully ==="
ls -lh "$ARTIFACT_DIR"/app-release.*

echo "=== Keystore Fingerprints for Firebase & Play Console ==="
keytool -list -v -keystore /app/applet/android/rupeesplit-release.keystore -alias rupeesplit -storepass rupeesplit2026 | grep -E "SHA1:|SHA256:"
