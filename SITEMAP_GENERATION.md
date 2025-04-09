# Sitemap Generation for Akii

This document explains how the automated sitemap generation works for the Akii website.

## How It Works

### 1. Build-time Sitemap Generation

When the site is built (e.g., during `npm run build`), the sitemap is automatically generated via:

- The `postbuild` script in `package.json` runs `scripts/generate-sitemap.js`
- This script creates both `sitemap.xml` and `robots.txt` in the `dist` directory
- The script scans for blog posts in the `Blog.tsx` file to include them in the sitemap

### 2. Automated Rebuilds (Every 12 Hours)

To ensure the sitemap stays current, the site is automatically rebuilt every 12 hours:

- A Vercel cron job is configured in `vercel.json` to run every 12 hours
- The cron job calls the `/api/rebuild-sitemap` endpoint
- This endpoint triggers a new deployment using a Vercel Deploy Hook

## Setup Requirements

For the automated rebuilds to work, you must configure the following:

1. Create a Deploy Hook in Vercel:
   - Go to your Vercel project → Settings → Git → Deploy Hooks
   - Create a new hook named "Sitemap Update" for your production branch
   - Copy the provided URL

2. Add the Deploy Hook as an environment variable in Vercel:
   - Go to your Vercel project → Settings → Environment Variables
   - Add `VERCEL_DEPLOY_HOOK` with the value of your deploy hook URL

3. (Optional) Add a security token:
   - Add `REBUILD_SECRET` environment variable with a random secure token
   - Use this token when manually triggering rebuilds

## Manual Trigger

You can manually trigger a rebuild by making a GET request to:

```
https://www.akii.com/api/rebuild-sitemap
```

If you've set up the optional security token, include the header:
```
x-rebuild-token: your-secret-token
```

## Adding New Routes

To add new routes to the sitemap:

1. Edit the `staticRoutes` array in `scripts/generate-sitemap.js`
2. For blog posts, they're automatically detected from `Blog.tsx`

## Troubleshooting

If the sitemap is not updating:

1. Check Vercel logs for cron job and API route errors
2. Verify the Deploy Hook is correctly configured
3. Ensure the `VERCEL_DEPLOY_HOOK` environment variable is set
4. Try manually triggering a rebuild 