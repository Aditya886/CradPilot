#!/bin/bash
set -e

# CredPilot iOS IPA Build Script
echo "=========================================="
echo "🚀 Building CredPilot iOS IPA"
echo "=========================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 1. Check CocoaPods
echo "📦 Verifying CocoaPods dependencies..."
if [ ! -d "ios/Pods" ] || [ ! -f "ios/Podfile.lock" ]; then
    echo "Running pod install..."
    cd ios && pod install && cd ..
fi

# 2. Archive
echo "⚙️  Building release archive..."
mkdir -p ios/build
xcodebuild archive \
    -workspace ios/CredPilot.xcworkspace \
    -scheme CredPilot \
    -configuration Release \
    -sdk iphoneos \
    -archivePath ios/build/CredPilot.xcarchive \
    -derivedDataPath ios/build/DerivedData \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGN_IDENTITY=""

# 3. Package IPA
echo "📦 Packaging IPA..."
rm -rf ios/build/Payload
mkdir -p ios/build/Payload
cp -R ios/build/CredPilot.xcarchive/Products/Applications/CredPilot.app ios/build/Payload/CredPilot.app

cd ios/build
zip -q -r -y CredPilot.ipa Payload
cd "$ROOT_DIR"
cp ios/build/CredPilot.ipa ./CredPilot.ipa

echo "=========================================="
echo "✅ iOS IPA created successfully!"
echo "📍 Location: $(pwd)/CredPilot.ipa"
echo "📏 Size: $(ls -lh CredPilot.ipa | awk '{print $5}')"
echo "=========================================="
