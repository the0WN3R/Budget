# Installation Commands for Supabase on Mac

## Option 1: Install Homebrew + Node.js (Recommended)

### Step 1: Install Homebrew
Run this command in your terminal (it will ask for your password):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, you may need to add Homebrew to your PATH. The installer will tell you the exact command, but it's usually:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Step 2: Install Node.js
Once Homebrew is installed, run:
```bash
brew install node
```

**Note:** You don't need `sudo` with Homebrew - it manages its own permissions.

### Step 3: Install Supabase
```bash
cd /Users/lukeockwood/Desktop/_
npm install @supabase/supabase-js
```

---

## Option 2: Install Node.js Directly (No Homebrew needed)

If you prefer not to install Homebrew:

1. Go to https://nodejs.org/
2. Download the **LTS (Long Term Support)** version for macOS
3. Run the downloaded `.pkg` file and follow the installer
4. Restart your terminal
5. Verify installation:
   ```bash
   node --version
   npm --version
   ```
6. Then install Supabase:
   ```bash
   cd /Users/lukeockwood/Desktop/_
   npm install @supabase/supabase-js
   ```

---

## Quick Summary

**The error you saw (`sudo: brew: command not found`) means Homebrew isn't installed yet.**

Choose one approach:
- **Option 1**: Install Homebrew first, then Node.js
- **Option 2**: Download Node.js installer from nodejs.org

Both methods will get you `npm`, which you can then use to install Supabase packages.

