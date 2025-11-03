#!/bin/bash
# Install CocoaPods - Run this in Terminal

echo "Installing CocoaPods..."
sudo gem install cocoapods

echo ""
echo "CocoaPods installed! Now installing iOS dependencies..."
cd /Users/michellechoi/coachMe/ios/App
pod install

echo ""
echo "✅ Done! Go back to Xcode and try building again."

