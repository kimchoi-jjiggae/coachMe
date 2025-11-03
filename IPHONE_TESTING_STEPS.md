# 📱 iPhone Testing - Step by Step

## ✅ Quick Checklist:

- [ ] Connect iPhone via USB
- [ ] Trust computer on iPhone
- [ ] Fix signing errors in Xcode
- [ ] Build and install app
- [ ] Test all features

---

## 📋 Step 1: Connect iPhone

1. **Plug iPhone into Mac** with USB cable
2. **Unlock iPhone** with Face ID/Touch ID
3. **If you see "Trust This Computer" popup:**
   - Tap **"Trust"**
   - Enter passcode if prompted

---

## 📋 Step 2: Fix Signing in Xcode

**In Xcode (should still be open):**

1. **Select your iPhone** from device dropdown (top toolbar, next to ▶️ button)
   - Look for your iPhone name (e.g., "Michelle's iPhone")
   - It should appear in the list once connected

2. **If you don't see your iPhone:**
   - Make sure iPhone is unlocked
   - Try unplugging and replugging USB
   - Check USB cable (use a data cable, not charge-only)

3. **In Signing & Capabilities tab:**
   - Make sure **"Automatically manage signing"** is checked ✅
   - Make sure **Team** is selected (Michelle Choi Personal Team)
   - **Click "Try Again"** button next to the red error
   - Wait for Xcode to register device and create profile

4. **You should see:**
   - ✅ Green checkmark (errors gone!)
   - ✅ Provisioning Profile: "Xcode Managed Profile"
   - ✅ Signing Certificate: "Apple Development"

**If errors persist:**
- Make sure iPhone appears in device dropdown
- Try clicking "Try Again" again
- Restart Xcode if needed

---

## 📋 Step 3: Build & Install

1. **Select your iPhone** from device dropdown (top toolbar)
   - Should show: "Michelle's iPhone" or your iPhone name

2. **Press ▶️ Run button** (or press `Cmd+R`)
   - Xcode will build the app (first time takes 2-5 minutes)
   - You'll see progress in top bar: "Building..." → "Running..."

3. **First time only - Grant permissions on iPhone:**
   - You'll see "Untrusted Developer" message
   - On iPhone: Go to **Settings → General → VPN & Device Management**
   - Tap your Apple ID email
   - Tap **"Trust [Your Name]"**
   - Tap **"Trust"** again

4. **App installs on iPhone automatically!**
   - Look for "Voice Journal" icon on home screen

---

## 📋 Step 4: Grant App Permissions

**When you open the app for the first time:**

1. **Microphone Permission:**
   - Tap **"Allow"** when asked
   - Needed for voice recording

2. **Notification Permission:**
   - Tap **"Allow"** when asked
   - Needed for daily reminders

**You can also grant later:**
- iPhone Settings → Voice Journal → Permissions

---

## 📋 Step 5: Test Everything!

### Test Voice Recording:
1. **Tap "Click to start voice input" button**
2. **Speak into microphone**
3. **See text appear** in real-time
4. **Tap "Stop"** when done

### Test Saving Entries:
1. **Type or record a journal entry**
2. **Tap "Save Entry"**
3. **See entry appear** in saved entries list

### Test Notifications:
1. **Tap "Settings"** (or go to settings page)
2. **Set daily reminder time**
3. **Toggle notifications ON**
4. **Set time (e.g., 9:00 AM)**
5. **Tap "Save Settings"**
6. **Wait for notification** at that time!

### Test Loading Entries:
1. **Close and reopen app**
2. **Your saved entries should appear**
3. **Tap entry to edit**

---

## ✅ Success Checklist:

- [ ] App installed on iPhone
- [ ] App opens without errors
- [ ] Voice recording works
- [ ] Can save entries
- [ ] Entries persist after closing app
- [ ] Notifications work (set reminder, test with 1-minute reminder)
- [ ] Can edit entries
- [ ] App looks good on iPhone screen

---

## 🔧 Troubleshooting

### "Untrusted Developer" Error:
**Fix:** Settings → General → VPN & Device Management → Trust your Apple ID

### App Crashes on Launch:
**Fix:** Check Xcode console for errors, share error message

### Voice Recording Not Working:
**Fix:** Settings → Voice Journal → Microphone → Allow

### Notifications Not Working:
**Fix:** Settings → Voice Journal → Notifications → Allow

### "No such file or directory" Error:
**Fix:** Run `npx cap sync ios` in Terminal, then rebuild

### Build Fails:
**Fix:** 
- Clean build: Product → Clean Build Folder (`Cmd+Shift+K`)
- Check Xcode errors (red X icons)
- Share error message

---

## 🎉 You're Done!

**Once app is installed:**
- ✅ Works like a native app
- ✅ Notifications work properly
- ✅ Stays on iPhone (resigns every 7 days automatically)
- ✅ Everything works offline

**To update app:**
- Make changes in code
- Press ▶️ Run again in Xcode
- Updates automatically on iPhone

---

**Connect your iPhone and let's get this installed! 📱✨**

