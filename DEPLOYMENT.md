# Voice Journal Deployment Guide

## 🚀 GitHub Pages + Vercel Setup

This guide shows how to get AI title generation working on GitHub Pages using Vercel serverless functions.

## 📋 Prerequisites

1. **GitHub Account** (for GitHub Pages)
2. **Vercel Account** (for AI API)
3. **OpenAI API Key** (for AI titles)

## 🔧 Setup Steps

### Step 1: Deploy to Vercel (for AI API)

1. **Fork this repository** to your GitHub account
2. **Go to [Vercel](https://vercel.com)** and sign in with GitHub
3. **Import your forked repository**
4. **Set environment variable**:
   - Go to Project Settings → Environment Variables
   - Add: `OPENAI_API_KEY` = `your_openai_api_key_here`
5. **Deploy** - Vercel will automatically deploy

### Step 2: Update API URL (if needed)

If your Vercel deployment has a different URL, update it in `journal-app.js`:

```javascript
// Line 697: Update this URL to your Vercel deployment
apiUrl = 'https://your-vercel-app.vercel.app/api/generate-title';
```

### Step 3: Enable GitHub Pages

1. **Go to your GitHub repository**
2. **Settings → Pages**
3. **Source**: Deploy from a branch
4. **Branch**: `main` / `root`
5. **Save**

## 🎯 How It Works

### Architecture:
```
GitHub Pages (Frontend) 
    ↓
Vercel Serverless Function (API)
    ↓
OpenAI API (AI Titles)
```

### Features:
- ✅ **GitHub Pages**: Free static hosting
- ✅ **Vercel Functions**: Serverless AI API
- ✅ **Secure**: API key never exposed
- ✅ **Fast**: Global CDN
- ✅ **Free**: Both platforms are free

## 🔍 Testing

### Test GitHub Pages:
1. Visit: `https://yourusername.github.io/coachMe/`
2. Write a journal entry
3. Click "📝 Generate Title"
4. Should get AI-generated title!

### Test Vercel API directly:
```bash
curl -X POST https://your-vercel-app.vercel.app/api/generate-title \
  -H "Content-Type: application/json" \
  -d '{"content":"I had a great day today"}'
```

## 🛠️ Troubleshooting

### AI Titles Not Working:
1. **Check Vercel deployment** - Make sure it's deployed
2. **Check environment variables** - Verify `OPENAI_API_KEY` is set
3. **Check API URL** - Update the URL in `journal-app.js` if needed
4. **Check browser console** - Look for error messages

### Common Issues:
- **CORS errors**: Vercel function should handle CORS automatically
- **API key not set**: Check Vercel environment variables
- **Rate limits**: OpenAI has usage limits, check your account

## 📊 Cost Estimation

### GitHub Pages:
- ✅ **Free** - Unlimited static hosting

### Vercel:
- ✅ **Free tier** - 100GB bandwidth, 100GB-hours execution
- 💰 **Pro tier** - $20/month for higher limits

### OpenAI:
- 💰 **Pay-per-use** - ~$0.002 per title generation
- 💰 **Estimated cost** - $1-5/month for personal use

## 🎉 Success!

Once deployed, you'll have:
- **GitHub Pages**: Your journal app hosted for free
- **Vercel API**: AI title generation working
- **Secure**: API key protected on server
- **Fast**: Global CDN for both frontend and API

## 🔄 Updates

To update the app:
1. **Push changes** to GitHub
2. **GitHub Pages** updates automatically
3. **Vercel** redeploys automatically

Both deployments stay in sync! 🚀