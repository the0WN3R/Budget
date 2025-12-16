# Quick Setup Guide - TL;DR Version

## Step 1: Environment Variables (5 minutes)

```bash
# 1. Copy the example file
cp env.example .env.local

# 2. Edit .env.local and add your Supabase credentials
# Get them from: https://supabase.com/dashboard → Settings → API
```

**What you need:**
- Project URL: `https://duvgezlejkrdffqcmupx.supabase.co` (you already have this)
- Anon Key: Get from Supabase Dashboard → Settings → API → `anon public` key

**Fill in `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://duvgezlejkrdffqcmupx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 2: Install Next.js (2 minutes)

```bash
# Install Next.js and React
npm install next react react-dom

# Add scripts to package.json (or run this to update it)
npm pkg set scripts.dev="next dev"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"
```

**Test it:**
```bash
npm run dev
# Visit http://localhost:3000
```

---

## Step 3: Apply Database Migrations (2 minutes)

```bash
# Make sure you're linked (should already be)
npx supabase status

# Push migrations to create tables
npx supabase db push
```

**Verify:**
- Go to https://supabase.com/dashboard → Table Editor
- You should see: `user_profiles`, `budgets`, `budget_tabs`

---

## Test Everything Works

```bash
# Start your server
npm run dev

# In another terminal, test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456","full_name":"Test User"}'
```

If you get a response with user data, you're all set! ✅

---

**Full detailed instructions:** See `SETUP_INSTRUCTIONS.md` for troubleshooting and more options.

