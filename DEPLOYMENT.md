# Voice Journal - Deployment Guide

This guide shows how to deploy the Voice Journal PWA with environment-based configuration.

## 🔧 Configuration Methods

### Method 1: Environment File (Recommended)
Update `env-config.js` with your actual API keys:

```javascript
const ENV_CONFIG = {
    OPENAI_API_KEY: 'your_actual_openai_key_here',
    SUPABASE_URL: 'your_actual_supabase_url_here',
    SUPABASE_ANON_KEY: 'your_actual_supabase_key_here',
    // ... other settings
};
```

### Method 2: Environment Variables (For Advanced Deployments)
Set environment variables in your deployment platform:

```bash
OPENAI_API_KEY=your_actual_openai_key_here
SUPABASE_URL=your_actual_supabase_url_here
SUPABASE_ANON_KEY=your_actual_supabase_key_here
```

## 🚀 Deployment Platforms

### GitHub Pages
1. **Update `env-config.js`** with your actual API keys
2. **Push to GitHub** - GitHub Pages will automatically deploy
3. **Access your app** at `https://yourusername.github.io/coachMe/`

### Netlify
1. **Connect your GitHub repository** to Netlify
2. **Set environment variables** in Netlify dashboard:
   - `OPENAI_API_KEY`
   - `SUPABASE_URL` 
   - `SUPABASE_ANON_KEY`
3. **Deploy automatically** on every push

### Vercel
1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on every push

### Firebase Hosting
1. **Install Firebase CLI**: `npm install -g firebase-tools`
2. **Initialize Firebase**: `firebase init hosting`
3. **Set environment variables** in Firebase console
4. **Deploy**: `firebase deploy`

## 🔐 Security Best Practices

### For Production
1. **Never commit real API keys** to version control
2. **Use environment variables** in your deployment platform
3. **Rotate API keys** regularly
4. **Monitor API usage** to prevent abuse

### For Development
1. **Use `.env.local`** file (not committed to git)
2. **Keep API keys secure** on your local machine
3. **Use different keys** for development and production

## 📱 PWA Configuration

### Manifest Settings
The app includes a `manifest.json` for PWA installation:
- **App name**: Voice Journal
- **Icons**: Multiple sizes for different devices
- **Theme**: Purple gradient
- **Display**: Standalone (full-screen app)

### Service Worker
The app includes a service worker for:
- **Offline functionality**
- **Caching** of static assets
- **Background sync** capabilities

## 🛠️ Customization

### Changing API Keys
1. **Edit `env-config.js`** with your new keys
2. **Redeploy** your application
3. **Clear browser cache** if needed

### Adding New Features
1. **Update the configuration** in `env-config.js`
2. **Modify the app logic** in `app.js` or `journal-app.js`
3. **Test locally** before deploying
4. **Push changes** to trigger deployment

## 🔍 Troubleshooting

### Configuration Not Loading
1. **Check browser console** for errors
2. **Verify API keys** are correct
3. **Clear browser cache** and reload
4. **Check network connectivity**

### Supabase Not Working
1. **Verify Supabase URL** and key are correct
2. **Check Supabase dashboard** for errors
3. **Test connection** using the diagnostic tools
4. **Check RLS policies** in Supabase

### PWA Not Installing
1. **Use HTTPS** (required for PWA)
2. **Check manifest.json** is accessible
3. **Verify service worker** is registered
4. **Test on mobile device**

## 📞 Support

If you encounter issues:
1. **Check the browser console** for error messages
2. **Use the diagnostic tools** in the app
3. **Verify your API keys** are correct
4. **Test with a fresh browser session**

## 🎯 Quick Start

1. **Clone the repository**
2. **Update `env-config.js`** with your API keys
3. **Deploy to your preferred platform**
4. **Access your Voice Journal PWA!**

---

**Happy journaling! 🎙️📝✨**
