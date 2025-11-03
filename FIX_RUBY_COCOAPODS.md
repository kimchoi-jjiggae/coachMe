# 🔧 Fix Ruby Version for CocoaPods

## The Problem:
- Your system Ruby is 2.6.10 (too old)
- CocoaPods needs Ruby 3.1.0+
- Can't update system Ruby easily

## ✅ Solution: Install CocoaPods via Homebrew

Homebrew installs CocoaPods with its own Ruby, avoiding version conflicts.

### Step 1: Install Homebrew (if you don't have it)

**Run in Terminal:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. This takes 5-10 minutes.

### Step 2: Install CocoaPods via Homebrew

**Run in Terminal:**
```bash
brew install cocoapods
```

This installs CocoaPods with the correct Ruby version automatically!

### Step 3: Verify Installation

**Check it worked:**
```bash
pod --version
```

Should show: `1.12.0` (or similar)

### Step 4: Install iOS Dependencies

```bash
cd /Users/michellechoi/coachMe/ios/App
pod install
```

---

## Alternative: Install Older CocoaPods Version

If you can't/don't want to use Homebrew, try installing an older CocoaPods version that works with Ruby 2.6:

```bash
sudo gem install cocoapods -v 1.11.3
```

But **Homebrew is recommended** - it's cleaner and avoids Ruby version issues!

---

## After pod install:

1. **Close Xcode completely**
2. **Reopen the workspace:**
   ```bash
   open /Users/michellechoi/coachMe/ios/App/App.xcworkspace
   ```
3. **Clean build:** `Cmd+Shift+K`
4. **Build:** `Cmd+R`

---

**Start with Homebrew - it's the easiest solution! 🚀**

