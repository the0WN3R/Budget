# Installing Supabase on macOS

## Step 1: Install Node.js (Choose one method)

### Option A: Install using Homebrew (Recommended)
1. First, install Homebrew if you don't have it:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   (You'll need to enter your password when prompted)

2. Install Node.js:
   ```bash
   brew install node
   ```

### Option B: Install using official installer
1. Go to https://nodejs.org/
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer and follow the prompts

### Option C: Install using nvm (Node Version Manager)
1. Install nvm:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Restart your terminal, then install Node.js:
   ```bash
   nvm install --lts
   nvm use --lts
   ```

## Step 2: Verify Node.js Installation
After installing Node.js, verify it works:
```bash
node --version
npm --version
```

## Step 3: Initialize Your Project (if starting new project)
```bash
cd /Users/lukeockwood/Desktop/_
npm init -y
```

## Step 4: Install Supabase Packages

### For JavaScript/TypeScript projects:
```bash
npm install @supabase/supabase-js
```

### For React projects:
```bash
npm install @supabase/supabase-js
# or if using React hooks
npm install @supabase/supabase-js @supabase/auth-helpers-react
```

### For Next.js projects:
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### For React Native:
```bash
npm install @supabase/supabase-js react-native-url-polyfill
```

## Step 5: Set Up Supabase Client

Create a file to initialize your Supabase client (e.g., `lib/supabase.js` or `utils/supabase.ts`):

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Step 6: Environment Variables

Create a `.env.local` or `.env` file in your project root:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project dashboard under Settings > API.

## Quick Start Command Summary

If you already have Node.js installed:
```bash
# Navigate to your project
cd /Users/lukeockwood/Desktop/_

# Initialize npm project (if needed)
npm init -y

# Install Supabase
npm install @supabase/supabase-js

# Or use yarn/pnpm if you prefer
yarn add @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
```



