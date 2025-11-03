# 🔧 Fix Build Errors in Xcode

## Step 1: See the Exact Error

**In Xcode:**
1. **Press `Cmd+4`** (or click Issue Navigator icon in left sidebar)
2. **Look for red error messages**
3. **Click on each error** to see details
4. **Copy the error message** (or take screenshot)

**Also check the build log:**
1. **View → Navigators → Show Report Navigator** (or `Cmd+9`)
2. **Click on the failed build**
3. **Look for red error messages**

---

## Common Build Errors & Fixes:

### Error 1: "No such module 'Capacitor'"
**Fix:**
```bash
cd /Users/michellechoi/coachMe/ios/App
pod install
```
Then rebuild in Xcode.

### Error 2: "CocoaPods not installed"
**Fix:**
```bash
sudo gem install cocoapods
cd /Users/michellechoi/coachMe/ios/App
pod install
```

### Error 3: "Command PhaseScriptExecution failed"
**Fix:**
- Clean build folder: **Product → Clean Build Folder** (`Cmd+Shift+K`)
- Delete derived data:
  ```bash
  rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
  ```
- Rebuild

### Error 4: "Module not found" or "Missing files"
**Fix:**
```bash
cd /Users/michellechoi/coachMe
npx cap sync ios
```
Then rebuild.

### Error 5: "Signing for App requires a development team"
**Fix:**
- Go to **Signing & Capabilities**
- Select your team
- Make sure "Automatically manage signing" is checked

### Error 6: "Cannot find type 'UIViewController'"
**Fix:**
- Check Xcode version (needs Xcode 12+)
- Update Xcode if outdated

### Error 7: TypeScript or config errors
**Fix:**
```bash
cd /Users/michellechoi/coachMe
npm install
npx cap sync ios
```

---

## Quick Fix Checklist:

1. **Clean Build:**
   - Product → Clean Build Folder (`Cmd+Shift+K`)

2. **Sync Capacitor:**
   ```bash
   cd /Users/michellechoi/coachMe
   npx cap sync ios
   ```

3. **Install Pods:**
   ```bash
   cd /Users/michellechoi/coachMe/ios/App
   pod install
   ```

4. **Close and reopen Xcode workspace:**
   ```bash
   open /Users/michellechoi/coachMe/ios/App/App.xcworkspace
   ```

5. **Try building again**

---

## Share the Error:

**Please share:**
- The exact error message from Issue Navigator
- Which step fails (Compiling, Linking, Code Signing, etc.)
- Screenshot of error if possible

**Then I can give you the exact fix!**

