# ⚡ Quick Fix - Install Older CocoaPods

## Your Ruby is too old (2.6.10), but we can install an older CocoaPods version!

**Run this in Terminal:**

```bash
sudo gem install cocoapods -v 1.11.3
```

**Enter your Mac password when prompted.**

This version works with Ruby 2.6!

---

## After Installation:

**Verify it worked:**
```bash
pod --version
```
Should show: `1.11.3`

**Then install dependencies:**
```bash
cd /Users/michellechoi/coachMe/ios/App
pod install
```

---

## If that doesn't work, use Homebrew:

**Install Homebrew first:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Then install CocoaPods:**
```bash
brew install cocoapods
```

Homebrew bundles its own Ruby, so version doesn't matter!

---

**Try `sudo gem install cocoapods -v 1.11.3` first - it's faster! 🚀**

