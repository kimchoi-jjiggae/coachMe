# 🔧 Fix CocoaPods Installation

## The Problem:
CocoaPods didn't fully install because:
1. Ruby version is too old (2.6.10, needs 3.1.0+)
2. `pod` command not in PATH

## Solution Options:

### Option 1: Install via Homebrew (Easiest - Recommended!)

**In Terminal, run:**
```bash
brew install cocoapods
```

**Then install iOS dependencies:**
```bash
cd /Users/michellechoi/coachMe/ios/App
pod install
```

**If you don't have Homebrew, install it first:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

### Option 2: Install with Sudo (Requires Password)

**In Terminal, run:**
```bash
sudo gem install cocoapods
```

**Enter your Mac password when prompted.**

**Then install iOS dependencies:**
```bash
cd /Users/michellechoi/coachMe/ios/App
pod install
```

---

### Option 3: Use Bundler (Advanced)

If the above don't work, we can use Bundler to manage Ruby gems.

---

## After Installing CocoaPods:

1. **Install dependencies:**
   ```bash
   cd /Users/michellechoi/coachMe/ios/App
   pod install
   ```

2. **In Xcode:**
   - Close Xcode completely
   - Reopen: `open /Users/michellechoi/coachMe/ios/App/App.xcworkspace`
   - Press `Cmd+Shift+K` (Clean Build Folder)
   - Press `Cmd+R` (Run)

---

## Check if it worked:

**After `pod install`, you should see:**
```
✅ Pod installation complete!
```

**Then try building in Xcode again.**

---

**Which option do you want to try? I recommend Option 1 (Homebrew) if you have it!**

