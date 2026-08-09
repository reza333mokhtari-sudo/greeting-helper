# Vercel Deployment & Debugging Guide

This project is built using **TanStack Start v1** and is optimized for deployment on **Vercel** using the **Edge Runtime**.

## 1. Vercel Project Configuration

When importing your repository to Vercel, use these settings:

- **Framework Preset**: `Other` (TanStack Start is auto-detected by Vite, but select "Other" if prompt fails)
- **Build Command**: `npm run build`
- **Output Directory**: `.output`
- **Install Command**: `npm install`

## 2. Required Environment Variables

Configure these in the Vercel Dashboard (**Settings > Environment Variables**).

### Lovable Cloud (Supabase) Integration
These are required for database access, authentication, and cloud syncing.
- `VITE_SUPABASE_URL`: `https://wliwiswcollinbaomzqr.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_RgebDk1weJQL8DCgUNttxQ_FWT2p2rW`
- `SUPABASE_URL`: (Same as VITE_SUPABASE_URL)
- `SUPABASE_PUBLISHABLE_KEY`: (Same as VITE_SUPABASE_PUBLISHABLE_KEY)
- `SUPABASE_SERVICE_ROLE_KEY`: **CRITICAL** - Required for server functions to bypass RLS for admin tasks. Found in your Lovable Cloud / Supabase settings.

### AI Assistant (Lovable AI Gateway)
- `LOVABLE_API_KEY`: Required for AI Cartographer and Grok/O3 integration.

## 3. Deployment Troubleshooting

### Black Screen / Hydration Error
- **Cause**: TanStack Start SSR fails if environment variables are missing at build time.
- **Fix**: Ensure all `VITE_` variables are set in Vercel **before** triggering a new deployment.

### Server Function 404/500
- **Cause**: Incorrect Nitro preset or missing `SUPABASE_SERVICE_ROLE_KEY`.
- **Fix**: The build automatically targets the correct runtime. Check the "Functions" tab in Vercel for specific runtime logs.

### AI Timeout
- **Execution Time**: AI generation can exceed 10s.
- **Fix**: If you encounter timeouts, increase the "Function Max Duration" in `vercel.json` or Vercel settings (requires Pro plan for >10s).

## 4. Local Production Test
Always run this before pushing to verify the build is stable:
```bash
npm run build && npm run preview
```
