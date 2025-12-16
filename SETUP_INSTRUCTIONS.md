# Detailed Setup Instructions

This guide walks you through setting up the authentication backend step by step.

## Prerequisites

Before starting, make sure you have:
- Node.js installed (version 14 or higher)
- A Supabase account (free at https://supabase.com)
- Your Supabase project created and linked

---

## Step 1: Set Up Environment Variables

### 1.1 Create the `.env.local` file

The `.env.local` file stores your Supabase credentials securely. It's already in `.gitignore` so it won't be committed to git.

**In your terminal, run:**

```bash
# Navigate to your project directory (if not already there)
cd /Users/lukeockwood/Desktop/_

# Copy the example file to create your actual environment file
cp env.example .env.local
```

**Or manually:**
1. Create a new file named `.env.local` in your project root
2. Copy the contents from `env.example` into it

### 1.2 Get Your Supabase Credentials

You need to get your Supabase project URL and API keys from your Supabase dashboard.

#### Option A: Using the Supabase Dashboard (Recommended)

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Sign in to your account
   - Select your project (or create a new one if you haven't)

2. **Find Your Project URL**
   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **API** in the settings menu
   - Under **Project URL**, copy the URL
     - It looks like: `https://xxxxxxxxxxxxx.supabase.co`
     - In your case, based on your config: `https://duvgezlejkrdffqcmupx.supabase.co`

3. **Find Your API Keys**
   - Still in **Settings > API**
   - Under **Project API keys**, you'll see several keys:
     - **`anon` `public`** - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **`service_role` `secret`** - This is your `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)

4. **Copy the values:**
   - Click the **eye icon** or **copy button** next to the `anon public` key to reveal and copy it
   - It's a long string starting with `eyJ...`

#### Option B: Using Supabase CLI

If you're already linked to your project, you can check your connection:

```bash
# Check your linked Supabase project
npx supabase status
```

This will show your project details, but you'll still need to get the keys from the dashboard.

### 1.3 Fill In Your `.env.local` File

Open `.env.local` in your code editor and replace the placeholder values:

```env
# Your Supabase project URL (replace with your actual URL)
NEXT_PUBLIC_SUPABASE_URL=https://duvgezlejkrdffqcmupx.supabase.co

# Your Supabase anonymous/public key (replace with your actual key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dmdlemxlamtyZGZmcWNtdXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MjAxNTU3NTk5OX0.your-actual-key-here

# Optional: Service role key (only if you need admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dmdlemxlamtyZGZmcWNtdXB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDE1NTc1OTk5fQ.your-actual-key-here

# Optional: Site URL for email redirects (change for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important Notes:**
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The `NEXT_PUBLIC_` prefix means these variables are exposed to the browser (safe for anon key)
- The `service_role` key should NEVER be exposed to the browser - only use it server-side

### 1.4 Verify Your Environment Variables

Test that your environment variables are set correctly:

```bash
# On macOS/Linux
cat .env.local

# Verify the file exists
ls -la .env.local
```

You should see your actual Supabase URL and keys (not the placeholder values).

---

## Step 2: Set Up Your Server Framework

Your API endpoints are designed to work with **Next.js** (recommended for Vercel deployment). However, they can work with other frameworks too.

### 2.1 Option A: Using Next.js (Recommended for Vercel)

Next.js is the easiest option since you're deploying to Vercel. The API routes will work automatically.

#### Install Next.js and React:

```bash
# Install Next.js and React dependencies
npm install next react react-dom

# Install TypeScript support (optional but recommended)
npm install --save-dev typescript @types/react @types/node
```

#### Update Your `package.json`:

Your `package.json` should include these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.87.3",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

#### Create `next.config.js` (optional, for custom configuration):

```bash
# Create a basic Next.js config file
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
EOF
```

#### Test Your Next.js Setup:

```bash
# Start the development server
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Your API endpoints will be available at:
- `http://localhost:3000/api/auth/signup`
- `http://localhost:3000/api/auth/login`
- `http://localhost:3000/api/auth/logout`

### 2.2 Option B: Using Express.js (Alternative)

If you prefer Express.js instead of Next.js, you'll need to adapt the endpoints:

1. **Install Express:**
   ```bash
   npm install express
   ```

2. **Create a server file** (e.g., `server.js`):
   ```javascript
   const express = require('express');
   const app = express();
   app.use(express.json());
   
   // Import your auth routes
   const signupRoute = require('./api/auth/signup');
   const loginRoute = require('./api/auth/login');
   const logoutRoute = require('./api/auth/logout');
   
   app.post('/api/auth/signup', signupRoute);
   app.post('/api/auth/login', loginRoute);
   app.post('/api/auth/logout', logoutRoute);
   
   app.listen(3000, () => {
     console.log('Server running on http://localhost:3000');
   });
   ```

3. **Update the handlers** to work with Express's `(req, res)` format (they're already compatible!)

### 2.3 Option C: Using Vercel Serverless Functions Directly

If deploying to Vercel without Next.js, the file structure you have is already correct:
- `api/auth/signup.js` → becomes `/api/auth/signup` endpoint
- `api/auth/login.js` → becomes `/api/auth/login` endpoint
- `api/auth/logout.js` → becomes `/api/auth/logout` endpoint

Vercel will automatically detect and deploy these as serverless functions.

**To test locally with Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Run locally
vercel dev
```

---

## Step 3: Apply Database Migrations

This step creates the database tables (`user_profiles`, `budgets`, `budget_tabs`) in your Supabase database.

### 3.1 Verify Your Supabase Link

First, make sure you're linked to your Supabase project:

```bash
# Check your Supabase project status
npx supabase status
```

You should see output showing:
- Your project reference ID
- API URL
- Database connection info

If you see "No linked project found", link it:

```bash
# Link to your remote Supabase project
npx supabase link --project-ref duvgezlejkrdffqcmupx
```

You'll be prompted to enter your database password (found in Supabase Dashboard > Settings > Database).

### 3.2 Review Your Migrations

Before applying, let's see what migrations you have:

```bash
# List all migration files
ls -la supabase/migrations/
```

You should see:
- `20251215181451_create_user_profiles.sql`
- `20251216160058_create_budgets.sql`
- `20251216160148_add_user_profiles_budget_fk.sql`

These migrations will run in order (by timestamp) and create:
1. `user_profiles` table with all columns
2. `budgets` and `budget_tabs` tables
3. Foreign key constraint between `user_profiles` and `budgets`

### 3.3 Push Migrations to Supabase

**Important:** This will modify your database. Make sure you're pushing to the correct project!

```bash
# Push all migrations to your remote Supabase database
npx supabase db push
```

**What happens:**
1. Supabase CLI connects to your remote database
2. It checks which migrations have already been applied
3. It applies any new migrations in order
4. You'll see output showing each migration being applied

**Expected output:**
```
Applying migration 20251215181451_create_user_profiles.sql...
Applying migration 20251216160058_create_budgets.sql...
Applying migration 20251216160148_add_user_profiles_budget_fk.sql...
Migration complete!
```

### 3.4 Verify Tables Were Created

#### Option A: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Click on **Table Editor** in the left sidebar
3. You should see these tables:
   - `user_profiles`
   - `budgets`
   - `budget_tabs`

#### Option B: Using Supabase CLI

```bash
# Generate TypeScript types (this will also verify the schema)
npx supabase gen types typescript --linked > types/database.types.ts
```

If this command succeeds, your tables exist!

#### Option C: Using SQL Query

In Supabase Dashboard > SQL Editor, run:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'budgets', 'budget_tabs');
```

You should see all three tables listed.

### 3.5 Verify Triggers and Functions

The migrations also create database triggers. Verify they exist:

```sql
-- Check triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

You should see triggers like:
- `on_auth_user_created` (for auto-creating profiles)
- `set_updated_at` (for updating timestamps)

### 3.6 Troubleshooting Migration Issues

**If migrations fail:**

1. **Check your database password:**
   ```bash
   # Re-link if needed
   npx supabase link --project-ref duvgezlejkrdffqcmupx
   ```

2. **Check for conflicts:**
   - If tables already exist, you might need to reset (⚠️ **WARNING: This deletes all data**):
     ```bash
     npx supabase db reset --linked
     ```

3. **View migration status:**
   ```bash
   # See which migrations have been applied
   npx supabase migration list
   ```

4. **Manually apply migrations:**
   - Go to Supabase Dashboard > SQL Editor
   - Copy and paste the SQL from each migration file
   - Run them one at a time

---

## Testing Your Setup

After completing all three steps, test that everything works:

### 1. Test Environment Variables

Create a test file `test-env.js`:

```javascript
// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
```

Run it:
```bash
npm install dotenv  # if not already installed
node test-env.js
```

### 2. Test API Endpoints

With your server running (`npm run dev`), test the signup endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "full_name": "Test User"
  }'
```

You should get a response with user data and a session token.

### 3. Verify Database

Check that a profile was created:
- Go to Supabase Dashboard > Table Editor > `user_profiles`
- You should see a new row with the test user's data

---

## Summary Checklist

- [ ] Step 1: Created `.env.local` file with Supabase credentials
- [ ] Step 2: Installed Next.js (or configured alternative server)
- [ ] Step 3: Applied database migrations successfully
- [ ] Verified tables exist in Supabase Dashboard
- [ ] Tested API endpoints with curl or Postman
- [ ] Verified user profile creation works

Once all steps are complete, your authentication backend is ready to use! 🎉

