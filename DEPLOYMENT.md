# Deployment & Debugging Guide

The build succeeded locally. If your Vercel deployment is failing, it is likely due to missing environment variables or runtime constraints.

## 1. Required Environment Variables

You must configure these variables in your Vercel project settings (Settings > Environment Variables).

### Backend (Lovable Cloud / Supabase)
These are mandatory for database, auth, and cloud sync features.
- `VITE_SUPABASE_URL`: The URL of your project.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: The anon/public key.
- `SUPABASE_URL`: (Server-side) Same as above.
- `SUPABASE_PUBLISHABLE_KEY`: (Server-side) Same as above.
- `SUPABASE_SERVICE_ROLE_KEY`: **CRITICAL** - This is required for admin server functions.

### AI Assistant (Lovable AI Gateway)
- `LOVABLE_API_KEY`: Required for the AI cartography features.

## 2. Server Runtime Limits

This app uses TanStack Start, which runs on the Edge/Serverless runtime.
- **Memory**: Drawing complex maps might hit Vercel's default memory limits on free tiers.
- **Execution Time**: AI generation tasks can take 10-30 seconds. Ensure your Vercel function timeout is set high enough (Pro plan may be needed for very long generations).

## 3. Hydration Deadlocks

If you see a black screen or "Something went wrong" after deployment:
1. **Check Browser Console**: Look for `Supabase configuration missing` warnings.
2. **SSR vs Client**: The editor uses browser-only Canvas APIs. We have wrapped these in safety checks, but if a third-party library is imported at the top level and expects `window` to exist, the build will fail or crash during SSR.

## 4. Troubleshooting Steps

1. **Verify Vercel Logs**: Go to your Vercel Dashboard > Deployments > [Latest] > Logs.
2. **Look for `[Supabase] Missing configuration`**: This means your environment variables aren't being picked up.
3. **Look for `[unenv] X is not implemented`**: This happens if a package tries to use Node.js-only features (like `fs` or `child_process`) in the Edge runtime.

## 5. Local Reproduction
Run this command to simulate a production build before pushing:
```bash
npm run build
```
If this fails, the error message will pinpoint the file and line number.
