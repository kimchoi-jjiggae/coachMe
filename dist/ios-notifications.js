// iOS Native Notifications for Voice Journal
// This file handles native iOS notifications using Capacitor

class IOSNotificationService {
    constructor() {
        this.isIOS = false;
        this.notificationsAvailable = false;
        this.initialized = false;
    }

    // Initialize the notification service
    async init() {
        try {
            // Check if we're running in Capacitor iOS
            if (window.Capacitor && window.Capacitor.getPlatform() === 'ios') {
                this.isIOS = true;
                
                // Import Capacitor plugins
                const { LocalNotifications } = await import('@capacitor/local-notifications');
                const { PushNotifications } = await import('@capacitor/push-notifications');
                
                this.LocalNotifications = LocalNotifications;
                this.PushNotifications = PushNotifications;
                
                // Request permissions
                await this.requestPermissions();
                
                this.notificationsAvailable = true;
                this.initialized = true;
                
                console.log('iOS Notifications initialized successfully');
                return true;
            } else {
                console.log('Not running on iOS, using web notifications');
                return false;
            }
        } catch (error) {
            console.error('Failed to initialize iOS notifications:', error);
            return false;
        }
    }

    // Request notification permissions
    async requestPermissions() {
        if (!this.isIOS || !this.LocalNotifications) return false;

        try {
            // Request local notification permissions
            const localResult = await this.LocalNotifications.requestPermissions();
            
            // Request push notification permissions
            const pushResult = await this.PushNotifications.requestPermissions();
            
            const granted = localResult.display === 'granted' && pushResult.receive === 'granted';
            
            if (granted) {
                console.log('iOS notification permissions granted');
            } else {
                console.log('iOS notification permissions denied');
            }
            
            return granted;
        } catch (error) {
            console.error('Failed to request iOS notification permissions:', error);
            return false;
        }
    }

    // Schedule daily reminder
    async scheduleDailyReminder(settings) {
        if (!this.isIOS || !this.LocalNotifications || !settings.enabled) {
            console.log('iOS notifications not available or disabled');
            return false;
        }

        try {
            // Cancel existing notifications
            await this.LocalNotifications.cancel({ notifications: [{ id: 1 }] });

            // Parse time
            const [hours, minutes] = settings.time.split(':').map(Number);
            const now = new Date();
            const scheduledTime = new Date();
            scheduledTime.setHours(hours, minutes, 0, 0);

            // If time has passed today, schedule for tomorrow
            if (scheduledTime <= now) {
                scheduledTime.setDate(scheduledTime.getDate() + 1);
            }

            // Schedule the notification
            await this.LocalNotifications.schedule({
                notifications: [{
                    title: 'Voice Journal Reminder',
                    body: settings.message || 'Time for your daily journal reflection! 📝',
                    id: 1,
                    schedule: {
                        every: 'day',
                        at: scheduledTime
                    },
                    sound: 'default',
                    attachments: undefined,
                    actionTypeId: '',
                    extra: {
                        url: window.location.origin
                    }
                }]
            });

            console.log('Daily reminder scheduled for:', scheduledTime);
            return true;
        } catch (error) {
            console.error('Failed to schedule daily reminder:', error);
            return false;
        }
    }

    // Send test notification
    async sendTestNotification() {
        if (!this.isIOS || !this.LocalNotifications) {
            throw new Error('iOS notifications not available');
        }

        try {
            await this.LocalNotifications.schedule({
                notifications: [{
                    title: 'Voice Journal Test',
                    body: 'This is a test notification! If you see this, iOS notifications are working. 🎉',
                    id: 999,
                    schedule: {
                        at: new Date(Date.now() + 1000) // 1 second from now
                    },
                    sound: 'default'
                }]
            });

            console.log('Test notification sent');
            return true;
        } catch (error) {
            console.error('Failed to send test notification:', error);
            throw error;
        }
    }

    // Cancel all notifications
    async cancelAllNotifications() {
        if (!this.isIOS || !this.LocalNotifications) return false;

        try {
            await this.LocalNotifications.cancel({ notifications: [{ id: 1 }] });
            console.log('All notifications cancelled');
            return true;
        } catch (error) {
            console.error('Failed to cancel notifications:', error);
            return false;
        }
    }

    // Check if notifications are available
    isAvailable() {
        return this.isIOS && this.notificationsAvailable && this.initialized;
    }

    // Get permission status
    async getPermissionStatus() {
        if (!this.isIOS || !this.LocalNotifications) {
            return 'not-available';
        }

        try {
            const result = await this.LocalNotifications.checkPermissions();
            return result.display;
        } catch (error) {
            console.error('Failed to check permission status:', error);
            return 'unknown';
        }
    }
}

// Create global instance
window.iosNotificationService = new IOSNotificationService();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.iosNotificationService.init();
});
