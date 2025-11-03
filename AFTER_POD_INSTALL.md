# ✅ After CocoaPods Installs

## Step 1: Verify Installation

**Run in Terminal:**
```bash
pod --version
```

**Should show:** `1.11.3`

---

## Step 2: Install iOS Dependencies

**Run in Terminal:**
```bash
cd /Users/michellechoi/coachMe/ios/App
pod install
```

**You should see:**
```
Analyzing dependencies
Downloading dependencies
Installing Capacitor (7.x.x)
Installing CapacitorApp (7.x.x)
...
Pod installation complete! There are X dependencies from the Podfile.
```

---

## Step 3: Build in Xcode

1. **Close Xcode completely** (if it's open)

2. **Reopen the workspace:**
   ```bash
   open /Users/michellechoi/coachMe/ios/App/App.xcworkspace
   ```
   **Important:** Open the `.xcworkspace` file, NOT `.xcodeproj`!

3. **Clean build folder:**
   - Press `Cmd+Shift+K` (Clean Build Folder)

4. **Build the app:**
   - Make sure your iPhone is selected in device dropdown
   - Press `Cmd+R` (Run)

---

## If pod install fails:

**Common issues:**
- "Could not find a valid gem" → Try Homebrew method instead
- Permission errors → Make sure you used `sudo`
- Network errors → Check internet connection

---

**After you run `sudo gem install cocoapods -v 1.11.3`, let me know:**
- ✅ Did it install successfully?
- ✅ Does `pod --version` work?
- ✅ Did `pod install` complete?

**Then we'll build in Xcode! 🚀**

