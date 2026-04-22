# GitHub Pages Deployment Guide

This guide explains how to deploy the Re:Earth CMS CSV Importer to GitHub Pages.

## Prerequisites

- Git repository hosted on GitHub
- GitHub account with access to the repository

## Configuration Changes Made

### 1. Vite Configuration (`vite.config.ts`)
Added `base` path for GitHub Pages:
```typescript
base: '/reearth-cms-csv-importer/'
```

**Note**: If you deploy to a different repository name or to a user/organization site (`username.github.io`), update this value:
- For project site: `base: '/your-repo-name/'`
- For user/org site: `base: '/'`

### 2. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
Automated deployment workflow that:
- Triggers on push to `main` branch
- Builds the application with `npm run build`
- Deploys the `dist` folder to GitHub Pages
- Can be manually triggered via GitHub Actions UI

### 3. Jekyll Bypass (`public/.nojekyll`)
Empty file that prevents GitHub Pages from processing the site with Jekyll.

## Deployment Steps

### Step 1: Enable GitHub Pages
1. Go to your GitHub repository
2. Navigate to **Settings** > **Pages**
3. Under **Source**, select:
   - Source: **GitHub Actions** (recommended)
   - Or if not available, select **Deploy from a branch** and choose `gh-pages` branch

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Add GitHub Pages deployment configuration"
git push origin main
```

### Step 3: Verify Deployment
1. Go to **Actions** tab in your GitHub repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Once completed, your site will be available at:
   ```
   https://<username>.github.io/reearth-cms-csv-importer/
   ```

## Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

```bash
# Build the project
npm run build

# Install gh-pages package (if not installed)
npm install -D gh-pages

# Add deploy script to package.json
# "deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

## Troubleshooting

### Issue: Blank page or 404 errors
**Solution**: Verify the `base` path in `vite.config.ts` matches your repository name.

### Issue: Assets not loading
**Solution**: Ensure the `base` path includes leading and trailing slashes: `'/repo-name/'`

### Issue: Workflow fails
**Solution**:
1. Check that GitHub Pages is enabled in repository settings
2. Verify the workflow has proper permissions (Settings > Actions > General > Workflow permissions)
3. Ensure the default branch name matches the workflow trigger (`main` vs `master`)

### Issue: CORS errors in production
**Solution**: The app is configured to use the actual API URL (`https://api.cms.reearth.io`) in production. CORS errors should not occur if the API server is configured correctly. The development proxy is only used locally.

## Production vs Development

### Development Mode (`npm run dev`)
- Uses Vite proxy to bypass CORS
- API calls go through `http://localhost:5175/api/*`
- Hot module replacement enabled

### Production Build (`npm run build`)
- No proxy available
- API calls go directly to `https://api.cms.reearth.io`
- Optimized bundle with code splitting

## Updates and Redeployment

Any push to the `main` branch will automatically trigger a redeployment. You can also manually trigger deployment:
1. Go to **Actions** tab
2. Select "Deploy to GitHub Pages" workflow
3. Click **Run workflow**

## Environment Variables

Currently, the application doesn't use environment variables for the API endpoint. If you need to change the API base URL for production:

1. Create a `.env.production` file:
   ```
   VITE_API_BASE_URL=https://your-custom-api-url.com
   ```

2. Update `src/services/cmsApi.ts` to use the environment variable:
   ```typescript
   const baseURL = isDev
     ? window.location.origin
     : (config.baseUrl || import.meta.env.VITE_API_BASE_URL || 'https://api.cms.reearth.io');
   ```

## Security Considerations

- API keys and workspace IDs are entered by users and stored in browser sessionStorage
- No sensitive credentials are committed to the repository
- All API communication uses HTTPS
- Rate limiting is implemented to prevent API abuse

## Support

For issues related to:
- **Re:Earth CMS API**: Check the API documentation
- **GitHub Pages**: See [GitHub Pages documentation](https://docs.github.com/en/pages)
- **Vite**: See [Vite deployment guide](https://vitejs.dev/guide/static-deploy.html)
