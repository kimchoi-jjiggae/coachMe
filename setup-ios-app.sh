#!/bin/bash

# Voice Journal iOS App Setup Script
# This script converts your web app into a native iOS app

echo "📱 Setting up Voice Journal iOS App..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script requires macOS with Xcode installed"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed. Please install Xcode from the App Store"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Capacitor CLI globally
echo "📦 Installing Capacitor CLI..."
npm install -g @capacitor/cli

# Install iOS dependencies
echo "📦 Installing iOS dependencies..."
npm install @capacitor/core @capacitor/ios @capacitor/local-notifications @capacitor/push-notifications @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar

# Initialize Capacitor (if not already initialized)
if [ ! -f "capacitor.config.ts" ]; then
    echo "🔧 Initializing Capacitor..."
    npx cap init "Voice Journal" "com.michellechoi.voicejournal"
else
    echo "✅ Capacitor already initialized"
fi

# Add iOS platform
echo "📱 Adding iOS platform..."
npx cap add ios

# Copy web assets to iOS
echo "📋 Copying web assets to iOS..."
npx cap copy

# Sync iOS project
echo "🔄 Syncing iOS project..."
npx cap sync ios

# Add notification permissions to Info.plist
echo "🔔 Configuring notification permissions..."
IOS_INFO_PLIST="ios/App/App/Info.plist"

# Backup original file
cp "$IOS_INFO_PLIST" "$IOS_INFO_PLIST.backup"

# Add notification permissions
cat > temp_info_plist.py << 'EOF'
import plistlib
import sys

# Read the existing plist
with open('ios/App/App/Info.plist', 'rb') as f:
    plist = plistlib.load(f)

# Add notification permissions
if 'UIBackgroundModes' not in plist:
    plist['UIBackgroundModes'] = []

if 'background-processing' not in plist['UIBackgroundModes']:
    plist['UIBackgroundModes'].append('background-processing')

if 'remote-notifications' not in plist['UIBackgroundModes']:
    plist['UIBackgroundModes'].append('remote-notifications')

# Add notification usage description
plist['NSUserNotificationsUsageDescription'] = 'Voice Journal needs notification access to remind you to write daily entries.'

# Write the updated plist
with open('ios/App/App/Info.plist', 'wb') as f:
    plistlib.dump(plist, f)

print("✅ Notification permissions added to Info.plist")
EOF

python3 temp_info_plist.py
rm temp_info_plist.py

# Create app icons (placeholder)
echo "🎨 Setting up app icons..."
mkdir -p ios/App/App/Assets.xcassets/AppIcon.appiconset

# Create a simple app icon configuration
cat > ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json << 'EOF'
{
  "images" : [
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "✅ iOS app setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Run: npx cap open ios"
echo "2. In Xcode, select your development team"
echo "3. Build and run on simulator or device"
echo "4. Test notifications!"
echo ""
echo "📱 Your iOS app is ready for development!"
echo "📁 iOS project location: ios/App/App.xcworkspace"
echo ""
echo "🔔 To test notifications:"
echo "1. Run the app on device or simulator"
echo "2. Grant notification permissions"
echo "3. Go to settings and schedule a reminder"
echo "4. Notifications should work natively!"
