# 🔧 Install CocoaPods Properly

## The Issue:
CocoaPods components are installed, but the main `cocoapods` gem (with the `pod` command) is missing.

## Solution:

**Run this command in Terminal:**

```bash
sudo gem install cocoapods
```

**Enter your Mac password when prompted.**

This will install the complete CocoaPods package including the `pod` command.

---

## After Installation:

**Check it worked:**
```bash
pod --version
```
Should show something like: `1.12.0` (or similar version)

**Then install iOS dependencies:**
```bash
cd /Users/michellechoi/coachMe/ios/App
pod install
```

---

## If `sudo gem install cocoapods` doesn't work:

You might need to use Homebrew instead:

```bash
# Install Homebrew (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install CocoaPods via Homebrew
brew install cocoapods
```

---

**Run `sudo gem install cocoapods` in Terminal now!**

