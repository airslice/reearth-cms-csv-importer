# Vercel Deployment Guide (Recommended)

This is the **recommended deployment method** for the Re:Earth CMS CSV Importer. Vercel provides an all-in-one solution that handles both static hosting and API proxy with zero configuration.

## Why Vercel?

✅ **All-in-One**: Static hosting + Serverless functions in one platform
✅ **Zero Config**: Just connect GitHub and deploy
✅ **Auto Deploy**: Every git push automatically redeploys
✅ **Free Tier**: 100GB bandwidth, unlimited requests
✅ **Instant Setup**: Deploy in under 2 minutes
✅ **No CORS Issues**: Built-in proxy handles everything

## Prerequisites

- GitHub account (you already have this ✅)
- Vercel account (free) - Sign up at [vercel.com](https://vercel.com)

## Quick Deploy (2 Minutes)

### Option 1: One-Click Deploy ⚡

**Click this button:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/airslice/reearth-cms-csv-importer)

That's it! Vercel will:
1. Clone your repository
2. Install dependencies
3. Build the application
4. Deploy static files + serverless function
5. Give you a live URL

### Option 2: Deploy from Dashboard

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "Add New Project"**
4. **Select your repository**: `reearth-cms-csv-importer`
5. **Click "Deploy"**

Vercel auto-detects:
- Framework: Vite ✅
- Build command: `npm ci --legacy-peer-deps && npm run build` ✅
- Output directory: `dist` ✅
- Serverless functions: `api/` folder ✅

**Done!** Your app is live at:
```
https://reearth-cms-csv-importer.vercel.app
```
(or a custom URL Vercel assigns)

### Option 3: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (run from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? reearth-cms-csv-importer
# - In which directory? ./ (press Enter)
# - Override settings? No

# Deploy to production
vercel --prod
```

## How It Works

### Architecture

```
User Browser
    ↓
Vercel (your-app.vercel.app)
    ├── Static Files (HTML, JS, CSS) → dist/
    └── API Proxy (/api/*) → api/[...path].js
           ↓
    Re:Earth CMS API (https://api.cms.reearth.io)
```

### Request Flow

1. **Static files** (HTML, JS, CSS) are served from Vercel's global CDN
2. **API calls** to `/api/*` are handled by the serverless function
3. **Serverless function** forwards requests to Re:Earth CMS API
4. **CORS headers** are added automatically
5. **Response** is sent back to browser

### Files

- **`api/[...path].js`** - Serverless function (catches all `/api/*` routes)
- **`vercel.json`** - Configuration (build command, headers)
- **`dist/`** - Built static files (auto-generated)

## Automatic Deployments

Once connected to Vercel:

- ✅ **Push to `main`** → Production deployment
- ✅ **Push to other branches** → Preview deployment
- ✅ **Pull requests** → Automatic preview with unique URL
- ✅ **Comments on PRs** → Vercel bot posts preview link

## Environment Variables (Optional)

If you need custom configuration:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add variables:
   ```
   VITE_API_BASE_URL=https://custom-api.com
   ```
3. Redeploy (automatic on next push)

## Custom Domain (Optional)

### Add Your Own Domain

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `csv-importer.example.com`)
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

**Example DNS records:**
```
Type: CNAME
Name: csv-importer
Value: cname.vercel-dns.com
```

**Your app will be available at:**
```
https://csv-importer.example.com
```

## Monitoring and Logs

### View Deployment Logs

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on any deployment
3. View build logs and runtime logs

### View Function Logs

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on a deployment
3. Go to **Functions** tab
4. Click on `/api/[...path]` to see logs

### Real-time Monitoring

1. Go to **Vercel Dashboard** → Your Project → **Analytics**
2. View:
   - Page views
   - Function invocations
   - Error rates
   - Performance metrics

## Troubleshooting

### Issue: Build fails with peer dependency errors

**Already fixed!** The `vercel.json` includes `--legacy-peer-deps` flag.

If you still see issues, manually set build command:
1. Vercel Dashboard → Settings → General → Build & Development Settings
2. Build Command: `npm ci --legacy-peer-deps && npm run build`

### Issue: API requests return 404

**Solution**: Make sure the `api/` folder is committed to git:
```bash
git add api/
git commit -m "Add Vercel serverless function"
git push
```

### Issue: CORS errors still appear

**Solution**:
1. Clear browser cache
2. Do a hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Check that requests go to `/api/*` (not directly to `api.cms.reearth.io`)
4. Verify in Network tab: requests should show your Vercel URL

### Issue: Function timeout

**Solution**: Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### Issue: Deployment taking too long

**Cause**: Installing dependencies on every deploy

**Solution**: Already optimized with:
- `vercel.json` specifies efficient build command
- `.npmrc` handles peer dependencies
- Vercel caches `node_modules/`

## Configuration Files

### `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm ci --legacy-peer-deps && npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

### `api/[...path].js`

Serverless function that:
- Catches all `/api/*` routes
- Forwards to `https://api.cms.reearth.io`
- Adds CORS headers
- Returns response

## Cost

### Vercel Hobby (Free) Tier

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Unlimited serverless function executions (with fair use limits)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments

### Expected Usage

For typical usage (100-1000 users/month):
- **Bandwidth**: ~5-10GB/month
- **Function executions**: ~50,000-500,000/month
- **Cost**: **$0.00/month** (well within free tier)

### When You Might Need Pro

Vercel Pro ($20/month) if you need:
- More than 100GB bandwidth/month
- Team collaboration features
- Advanced analytics
- Password protection
- Priority support

## Security

### Vercel Security Features

- ✅ **Automatic HTTPS** - All traffic encrypted
- ✅ **DDoS protection** - Built-in
- ✅ **Git-based deployments** - No manual file uploads
- ✅ **Isolated functions** - Each function runs in isolation
- ✅ **Environment variables** - Encrypted at rest

### Application Security

- ✅ **No API keys in code** - Users enter their own
- ✅ **SessionStorage** - Keys cleared on tab close
- ✅ **No data persistence** - No backend database
- ✅ **Rate limiting** - Implemented in application

## Comparison with Other Platforms

| Feature | Vercel | Netlify | GitHub Pages | Google Cloud |
|---------|--------|---------|--------------|--------------|
| Static hosting | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Serverless functions | ✅ Built-in | ✅ Built-in | ❌ No | ⚠️ Separate |
| Auto-deploy from Git | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Need setup |
| Setup complexity | ⭐ Easy | ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Complex |
| CORS solution | ✅ Built-in | ✅ Built-in | ❌ No | ⚠️ Separate deploy |
| Free tier bandwidth | 100GB | 100GB | Unlimited | 1GB |
| Custom domains | ✅ Free | ✅ Free | ✅ Free | ✅ Free |
| **Best for this app** | ✅ **YES** | ✅ Yes | ❌ No | ⚠️ More work |

## Migration from GitHub Pages

Already deployed to GitHub Pages? Here's how to switch:

### Step 1: Deploy to Vercel

Follow the "Quick Deploy" section above.

### Step 2: Test Vercel Deployment

1. Open your Vercel URL
2. Test the CSV import flow
3. Verify no CORS errors

### Step 3: Update Links (Optional)

If you want to keep using your GitHub Pages domain:

1. Keep Vercel as the live site
2. Or add a redirect from GitHub Pages to Vercel

### Step 4: Disable GitHub Pages (Optional)

If switching completely to Vercel:

1. Go to GitHub repository → **Settings** → **Pages**
2. Set **Source** to "None"
3. (Or keep both live - doesn't cost anything)

## Performance Optimization

### Already Optimized

- ✅ **Code splitting** - Lazy-loaded wizard steps
- ✅ **Tree shaking** - Unused code removed
- ✅ **Minification** - JS/CSS compressed
- ✅ **Gzip compression** - Enabled by default
- ✅ **Global CDN** - Static files served from nearest edge

### Additional Optimizations (Optional)

1. **Enable Image Optimization** (if you add images):
   ```json
   // vercel.json
   {
     "images": {
       "domains": ["yourdomain.com"]
     }
   }
   ```

2. **Add Cache Headers** (already configured):
   ```json
   {
     "headers": [{
       "source": "/assets/(.*)",
       "headers": [{
         "key": "Cache-Control",
         "value": "public, max-age=31536000, immutable"
       }]
     }]
   }
   ```

## Local Development with Vercel

Test serverless functions locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Start local development server
vercel dev

# App runs at http://localhost:3000
# Serverless functions work locally
```

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## FAQ

### Q: Do I need a credit card?
**A:** No! The free tier requires no payment method.

### Q: Can I use my own domain?
**A:** Yes! Add a custom domain for free in settings.

### Q: What happens if I exceed free tier?
**A:** Vercel will notify you. You can upgrade or optimize.

### Q: Is the serverless function always running?
**A:** No, it's "serverless" - only runs when needed. Zero cost when idle.

### Q: Can I see function logs?
**A:** Yes! Real-time logs in the Vercel Dashboard.

### Q: How long does deployment take?
**A:** Usually 30-60 seconds.

### Q: Can I deploy from a different branch?
**A:** Yes! Configure in Settings → Git.

## Next Steps

After deploying:

1. ✅ **Test the application** with real data
2. ✅ **Add a custom domain** (optional)
3. ✅ **Share your app** with the team
4. ✅ **Monitor usage** in Vercel Dashboard

---

**🎉 Congratulations!** Your Re:Earth CMS CSV Importer is now live and fully functional with zero CORS issues.
