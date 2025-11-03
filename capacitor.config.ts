import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.michellechoi.voicejournal',
  appName: 'Voice Journal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#6366f1",
      sound: "default",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
    backgroundColor: "#ffffff",
    allowsLinkPreview: false,
    handleApplicationNotifications: true
  }
};

export default config;
