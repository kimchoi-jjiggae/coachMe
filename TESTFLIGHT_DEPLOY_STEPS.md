# 🚀 TestFlight Deployment - Step-by-Step Guide

## ✅ Pre-Flight Checklist

Before starting, ensure:
- [ ] Xcode is open with your project (`ios/App/App.xcworkspace`)
- [ ] You have an Apple ID (free account works!)
- [ ] Your project is synced (`npx cap sync ios` - already done!)

---

## 📋 Step 1: Configure Signing & Capabilities in Xcode

**In Xcode (should be open now):**

1. **Click the blue "App" project** in the left sidebar (Project Navigator - press `Cmd+1` if needed)
2. **Select "App" under TARGETS** (in the center panel)
3. **Click "Signing & Capabilities" tab**

### Configure Signing:
4. **Check "Automatically manage signing"**
5. **Select your Team:**
   - If you see "Add Account..." → Click it
   - Sign in with your Apple ID
   - Select your team from dropdown

### Set Bundle Identifier:
6. **Bundle Identifier:** Should be `com.michellechoi.voicejournal` (already set!)
   - If it's different or shows an error, change it to something unique like `com.michellechoi.voicejournal2024`

### Add Capabilities:
7. **Click "+ Capability" button** (top left of the Capabilities section)
8. **Add "Background Modes":**
   - Check ✅ "Background processing"
   - Check ✅ "Remote notifications"

---

## 📋 Step 2: Update Build Version

**Still in Xcode → Signing & Capabilities:**

1. **Click "General" tab** (next to Signing & Capabilities)
2. **Find "Identity" section:**
   - **Version:** `1.0` (or `1.0.0`)
   - **Build:** `1` (increment this each time you upload a new build)

---

## 📋 Step 3: Test Build (Optional but Recommended)

**Before archiving, test it works:**

1. **Select "Any iOS Device"** from the device dropdown (top toolbar, next to the ▶️ button)
   - NOT a simulator - must be a real device or "Any iOS Device"
2. **Press `Cmd+B`** to build
3. **Wait for "Build Succeeded"** ✅

**If you get errors:**
- CocoaPods: Run `cd ios/App && pod install` in Terminal
- Missing certificates: Make sure you selected a team in Step 1
- Build errors: Share the error message

---

## 📋 Step 4: Create Archive

1. **Product → Archive** (top menu)
   - OR press `Cmd+Shift+B` then click "Archive"
2. **Wait 2-5 minutes** for the archive to build
3. **Organizer window will open automatically** showing your archive

**If you see "No devices connected":**
- This is OK! Just select "Any iOS Device" and archive again

---

## 📋 Step 5: Upload to App Store Connect

**In the Organizer window (opened after archive):**

1. **Select your archive** (latest one, should be today's date)
2. **Click "Distribute App"** button
3. **Select distribution method:**
   - Choose **"App Store Connect"**
   - Click **Next**
4. **Select upload options:**
   - Choose **"Upload"**
   - Click **Next**
5. **Distribution options:**
   - Leave defaults (Include bitcode, etc.)
   - Click **Next**
6. **App Store Connect information:**
   - Leave defaults
   - Click **Next**
7. **Review and upload:**
   - Review the summary
   - Click **Upload**
8. **Wait 5-10 minutes** for upload to complete
   - You'll see a progress bar

---

## 📋 Step 6: Create App in App Store Connect

**Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)**

### Sign In:
1. **Sign in with your Apple ID** (same one used in Xcode)

### Create New App:
2. **Click "My Apps"** (top navigation)
3. **Click the "+" button** → **"New App"**
4. **Fill in app information:**
   - **Platform:** iOS
   - **Name:** Voice Journal
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** Select `com.michellechoi.voicejournal` (or create new one)
   - **SKU:** `voice-journal-ios` (unique identifier, can be anything)
   - **User Access:** Full Access (or Limited if you prefer)
   - Click **Create**

### Fill App Information:
5. **App Information tab:**
   - **Category:** Productivity or Health & Fitness
   - **Privacy Policy URL:** (optional for TestFlight)
   
6. **Pricing and Availability:**
   - Set to **Free** ✅
   - Select countries (default: All countries)

**You don't need to complete App Store listing for TestFlight!**

---

## 📋 Step 7: Process Build in TestFlight

**Back in App Store Connect:**

1. **Wait for build to process** (15-60 minutes)
   - Go to **"TestFlight" tab** in your app
   - You'll see your build with status "Processing..."
   - Status will change to "Ready to Test" when done

2. **Add Build Information** (when ready):
   - **What to Test:** "Voice Journal app for daily journaling with voice input"
   - **Notes:** "Initial TestFlight build. Test voice recording, saving entries, and notifications."

---

## 📋 Step 8: Add Testers

**In TestFlight tab:**

### Internal Testing (Immediate):
1. **Click "Internal Testing"** (left sidebar)
2. **Click "+" to create a group** (or use default "Internal Testers")
3. **Add yourself:**
   - Click **"Add Internal Testers"**
   - Enter your email (must be in your App Store Connect team)
   - Click **"Add"**
4. **Select your build** (the one marked "Ready to Test")
5. **Click "Save"**

**You'll get an email with TestFlight invite!**

### External Testing (Optional - for friends/family):
1. **Click "External Testing"** (left sidebar)
2. **Click "+" to create a group**
3. **Add testers:**
   - Enter their email addresses
   - They'll get an email invite
4. **Select your build**
5. **Submit for Beta App Review** (required for external testers)
   - Takes 24-48 hours for approval
   - Internal testers can test immediately!

---

## 📋 Step 9: Install TestFlight App & Your App

**On your iPhone:**

1. **Download TestFlight** from App Store (if you don't have it)
2. **Open the email invite** from Apple
3. **Click "Start Testing"** or open link in TestFlight app
4. **Install your Voice Journal app**
5. **Open the app** and test!

---

## ✅ Success Checklist

- [ ] Archive created successfully in Xcode
- [ ] Upload completed without errors
- [ ] App appears in App Store Connect
- [ ] Build processed (status: "Ready to Test")
- [ ] Testers added (internal or external)
- [ ] TestFlight invite received
- [ ] App installed on iPhone via TestFlight
- [ ] App opens and works correctly
- [ ] Voice recording works
- [ ] Notifications work

---

## 🚨 Common Issues & Quick Fixes

### "No development team selected"
**Fix:** Go to Xcode → Preferences → Accounts → Add Apple ID → Select team

### "Bundle identifier already exists"
**Fix:** Change to unique ID like `com.michellechoi.voicejournal2024`

### "Archive button is grayed out"
**Fix:** Select "Any iOS Device" (not a simulator) from device dropdown

### "Upload failed - missing compliance"
**Fix:** In App Store Connect → App Privacy → Answer privacy questions

### "Build stuck on Processing"
**Fix:** Wait 60+ minutes. If still stuck, check email for rejection reasons.

### "CocoaPods errors during build"
**Fix:** Run `cd ios/App && pod install` then rebuild

---

## 📱 What's Next?

Once your app is on TestFlight:

1. **Test thoroughly** - Voice recording, saving, notifications
2. **Gather feedback** from testers
3. **Fix any bugs** and upload new builds
4. **When ready:** Submit to App Store for public release (requires full App Store listing)

---

## 🎉 You're Done!

**Your Voice Journal app will be available via TestFlight shortly!**

Testers can:
- ✅ Download from TestFlight
- ✅ Get automatic updates
- ✅ Test native iOS notifications
- ✅ Use voice recording reliably
- ✅ Share feedback with you

**Questions? Check the errors in Xcode or App Store Connect - they usually have helpful solutions!**

