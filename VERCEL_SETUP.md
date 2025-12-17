# Vercel Deployment Setup Guide

This guide helps you configure your Budget App on Vercel correctly.

## Critical: Environment Variables

The error "Unexpected end of JSON input" usually means environment variables aren't set on Vercel.

### Step 1: Add Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `ownersbudget` (or whatever you named it)
3. Click on **Settings** in the top navigation
4. Click on **Environment Variables** in the left sidebar
5. Add these three environment variables:

#### Required Variables:

**Variable 1:**
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Your Supabase project URL (e.g., `https://duvgezlejkrdffqcmupx.supabase.co`)
- **Environment:** Select all (Production, Preview, Development)

**Variable 2:**
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon/public key
- **Environment:** Select all (Production, Preview, Development)

**Variable 3 (Optional):**
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Your Supabase service role key (for admin operations)
- **Environment:** Select all (Production, Preview, Development)

### Step 2: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → Use for `SUPABASE_SERVICE_ROLE_KEY` (optional)

### Step 3: Redeploy

After adding environment variables:

1. Go to your Vercel project dashboard
2. Click on the **Deployments** tab
3. Click the **⋯** (three dots) next to your latest deployment
4. Click **Redeploy**
5. Make sure **Use existing Build Cache** is **unchecked**
6. Click **Redeploy**

This will rebuild with the new environment variables.

## Troubleshooting

### Error: "Unexpected end of JSON input"

**Causes:**
- Environment variables not set on Vercel
- API endpoint returning HTML (error page) instead of JSON
- Supabase connection failing

**Solutions:**
1. ✅ Verify environment variables are set in Vercel dashboard
2. ✅ Check that variable names are exactly correct (case-sensitive)
3. ✅ Redeploy after adding variables
4. ✅ Check Vercel deployment logs for errors

### Check Deployment Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on your latest deployment
3. Click on **Build Logs** or **Function Logs**
4. Look for errors about missing environment variables or Supabase connection

### Test Your API Endpoints

After deploying, test the API:

```bash
curl https://ownersbudget.vercel.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

You should get a JSON response (even if it's an error, it should be JSON, not HTML).

## Environment Variable Checklist

Before deploying, make sure:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set (starts with `https://`)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set (long string starting with `eyJ...`)
- [ ] Variables are set for **Production**, **Preview**, and **Development** environments
- [ ] You've redeployed after adding variables
- [ ] Build logs show no errors about missing environment variables

## Common Mistakes

1. ❌ **Typo in variable name** - Must be exactly `NEXT_PUBLIC_SUPABASE_URL` (case-sensitive)
2. ❌ **Wrong environment selected** - Make sure Production is selected
3. ❌ **Forgot to redeploy** - Variables only take effect after redeploy
4. ❌ **Using `.env.local` values** - Those don't work on Vercel, must add in dashboard

## Need Help?

Check Vercel logs first - they'll tell you exactly what's wrong!

