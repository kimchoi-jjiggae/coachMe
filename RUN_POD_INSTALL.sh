#!/bin/bash
# Run this script to install iOS dependencies

echo "Installing iOS dependencies with CocoaPods..."
echo ""

cd /Users/michellechoi/coachMe/ios/App

# Try to find pod command
if command -v pod &> /dev/null; then
    pod install
elif [ -f /usr/local/bin/pod ]; then
    /usr/local/bin/pod install
elif [ -f ~/.gem/ruby/2.6.0/bin/pod ]; then
    ~/.gem/ruby/2.6.0/bin/pod install
else
    echo "❌ pod command not found!"
    echo ""
    echo "Please run this command in Terminal:"
    echo "cd /Users/michellechoi/coachMe/ios/App && pod install"
    echo ""
    echo "Or install CocoaPods first:"
    echo "sudo gem install cocoapods"
fi

echo ""
echo "✅ Done! Go back to Xcode and try building again."

