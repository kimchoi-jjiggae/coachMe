// Email notification service using EmailJS
// This is a free service that can send emails from web apps

class EmailNotificationService {
    constructor() {
        // EmailJS configuration - you'll need to set this up
        this.serviceId = 'YOUR_EMAILJS_SERVICE_ID';
        this.templateId = 'YOUR_EMAILJS_TEMPLATE_ID';
        this.publicKey = 'YOUR_EMAILJS_PUBLIC_KEY';
        this.isConfigured = false;
    }
    
    // Initialize EmailJS
    async init() {
        try {
            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                console.log('EmailJS not loaded, loading from CDN...');
                await this.loadEmailJS();
            }
            
            // Initialize EmailJS
            emailjs.init(this.publicKey);
            this.isConfigured = true;
            console.log('EmailJS initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize EmailJS:', error);
            return false;
        }
    }
    
    // Load EmailJS from CDN
    async loadEmailJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Send daily reminder email
    async sendDailyReminder(settings) {
        if (!this.isConfigured) {
            throw new Error('EmailJS not configured. Please set up your EmailJS account first.');
        }
        
        try {
            const templateParams = {
                to_email: settings.email,
                to_name: 'Journal User',
                message: settings.message || 'Time for your daily journal reflection! 📝',
                reminder_time: settings.time || '20:00',
                journal_url: window.location.origin
            };
            
            const result = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams
            );
            
            console.log('Daily reminder email sent:', result);
            return result;
        } catch (error) {
            console.error('Failed to send daily reminder email:', error);
            throw error;
        }
    }
    
    // Test email
    async sendTestEmail(settings) {
        if (!this.isConfigured) {
            throw new Error('EmailJS not configured. Please set up your EmailJS account first.');
        }
        
        try {
            const templateParams = {
                to_email: settings.email,
                to_name: 'Journal User',
                message: 'This is a test email from your Voice Journal app! If you receive this, email notifications are working. 🎉',
                reminder_time: 'Test',
                journal_url: window.location.origin
            };
            
            const result = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams
            );
            
            console.log('Test email sent:', result);
            return result;
        } catch (error) {
            console.error('Failed to send test email:', error);
            throw error;
        }
    }
    
    // Schedule daily email reminders
    scheduleDailyReminder(settings) {
        if (!settings.enabled || !settings.email) {
            console.log('Email notifications disabled or no email provided');
            return;
        }
        
        const [hours, minutes] = settings.time.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        const delay = scheduledTime.getTime() - now.getTime();
        
        setTimeout(async () => {
            try {
                await this.sendDailyReminder(settings);
                console.log('Daily reminder email sent at:', new Date());
                
                // Schedule next day
                this.scheduleDailyReminder(settings);
            } catch (error) {
                console.error('Failed to send scheduled reminder:', error);
            }
        }, delay);
        
        console.log('Daily email reminder scheduled for:', scheduledTime);
    }
}

// Create global instance
window.emailNotificationService = new EmailNotificationService();
