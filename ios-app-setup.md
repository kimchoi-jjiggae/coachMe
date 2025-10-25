# 📱 iOS App Setup Guide

Convert your Voice Journal web app into a native iOS app with proper notifications!

## 🚀 Quick Setup (Capacitor)

### Prerequisites:
- **Mac with Xcode** (required for iOS development)
- **Apple Developer Account** (free for testing, $99/year for App Store)
- **Node.js** installed

### Step 1: Install Capacitor
```bash
# Install Capacitor CLI globally
npm install -g @capacitor/cli

# Initialize Capacitor in your project
npx cap init "Voice Journal" "com.yourname.voicejournal"
```

### Step 2: Add iOS Platform
```bash
# Add iOS platform
npx cap add ios

# Install iOS dependencies
npm install @capacitor/ios
```

### Step 3: Configure for iOS
```bash
# Copy web assets to iOS
npx cap copy

# Open in Xcode
npx cap open ios
```

## 🔔 iOS Notifications Setup

### 1. Add Notification Plugin
```bash
npm install @capacitor/local-notifications
npx cap sync
```

### 2. Update iOS Configuration
Add to `ios/App/App/Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>background-processing</string>
    <string>remote-notifications</string>
</array>
```

### 3. Add Notification Code
Create `ios-notifications.js`:
```javascript
import { LocalNotifications } from '@capacitor/local-notifications';

// Request notification permission
async function requestNotificationPermission() {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
}

// Schedule daily notification
async function scheduleDailyNotification(time, message) {
    const [hours, minutes] = time.split(':').map(Number);
    
    await LocalNotifications.schedule({
        notifications: [{
            title: 'Voice Journal Reminder',
            body: message,
            id: 1,
            schedule: {
                every: 'day',
                at: new Date(new Date().setHours(hours, minutes, 0, 0))
            },
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: null
        }]
    });
}
```

## 📱 Xcode Configuration

### 1. Open Project in Xcode
```bash
npx cap open ios
```

### 2. Configure App Settings
- **Bundle Identifier:** `com.yourname.voicejournal`
- **Display Name:** Voice Journal
- **Version:** 1.0.0
- **Build:** 1

### 3. Add App Icons
- **App Icon Set:** Add your app icons to `ios/App/App/Assets.xcassets/AppIcon.appiconset`
- **Sizes needed:** 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

### 4. Configure Notifications
- **Capabilities:** Enable "Push Notifications" and "Background Modes"
- **Background Modes:** Enable "Background processing" and "Remote notifications"

## 🧪 Testing

### 1. Test on Simulator
```bash
# Run on iOS Simulator
npx cap run ios
```

### 2. Test on Device
- **Connect iPhone via USB**
- **Select your device in Xcode**
- **Click Run button**

### 3. Test Notifications
- **Grant notification permission**
- **Test daily reminders**
- **Verify background notifications**

## 📦 Deployment

### Option 1: TestFlight (Free)
1. **Archive app in Xcode**
2. **Upload to App Store Connect**
3. **Add to TestFlight**
4. **Invite testers**

### Option 2: App Store ($99/year)
1. **Complete app review process**
2. **Submit for App Store review**
3. **Publish when approved**

### Option 3: Enterprise Distribution
1. **Enterprise Developer Account ($299/year)**
2. **Distribute internally**
3. **No App Store review needed**

## 🔧 Configuration Files

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.voicejournal',
  appName: 'Voice Journal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    }
  }
};

export default config;
```

### package.json additions
```json
{
  "scripts": {
    "build": "npm run build:web",
    "build:web": "echo 'Building web assets...'",
    "ios": "npx cap run ios",
    "ios:build": "npm run build && npx cap copy && npx cap open ios"
  },
  "dependencies": {
    "@capacitor/core": "^5.0.0",
    "@capacitor/ios": "^5.0.0",
    "@capacitor/local-notifications": "^5.0.0"
  }
}
```

## 🎯 Benefits of Native iOS App

### ✅ Native Notifications
- **Proper iOS notification system**
- **Background notifications work reliably**
- **Rich notification features**

### ✅ App Store Distribution
- **Professional app presence**
- **Easy installation for users**
- **Automatic updates**

### ✅ Native Features
- **Better performance**
- **Native UI elements**
- **Access to device APIs**

### ✅ Offline Support
- **Works without internet**
- **Local data storage**
- **Background sync**

## 🚀 Next Steps

1. **Set up development environment**
2. **Follow the setup guide above**
3. **Test on iOS Simulator**
4. **Deploy to TestFlight for testing**
5. **Submit to App Store when ready**

## 💰 Costs

- **Development:** Free
- **Testing:** Free (TestFlight)
- **App Store:** $99/year (if you want to publish)
- **Enterprise:** $299/year (for internal distribution)

**Would you like me to help you set up any specific part of this process?** 📱✨
