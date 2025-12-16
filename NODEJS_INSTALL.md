# How to Install Node.js on macOS

## ✅ Current Status
**You already have Node.js installed!**
- Current version: v25.2.1
- You also have Homebrew installed at `/opt/homebrew/bin/brew`

---

## Installation Methods

### Method 1: Install via Homebrew (Recommended for Mac)

Since you already have Homebrew installed, this is the easiest method:

```bash
# Install the latest stable version
brew install node

# Or install a specific version
brew install node@20

# Update to the latest version (if already installed)
brew upgrade node
```

**Pros:**
- Easy to update (`brew upgrade node`)
- Can manage multiple versions
- Integrates well with macOS

---

### Method 2: Official Installer (Easiest for beginners)

1. Go to **https://nodejs.org/**
2. Download the **LTS (Long Term Support)** version for macOS
   - LTS = more stable, recommended for production
   - Current = latest features, but may have issues
3. Run the downloaded `.pkg` file
4. Follow the installer prompts
5. Restart your terminal

**Pros:**
- Simple point-and-click installation
- Official installer
- No command line needed

**Cons:**
- Manual updates (need to download new installer)
- Can't easily switch versions

---

### Method 3: Node Version Manager (nvm) - Best for developers

Allows you to install and switch between multiple Node.js versions:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal, then:
# Install the latest LTS version
nvm install --lts

# Install a specific version
nvm install 20.10.0

# Use a specific version
nvm use 20.10.0

# Set default version
nvm alias default 20.10.0

# List installed versions
nvm list

# List available versions
nvm list-remote
```

**Pros:**
- Can install multiple versions
- Easy to switch between versions
- Great for testing different Node.js versions
- Per-project version management

---

### Method 4: Using fnm (Fast Node Manager) - Alternative to nvm

```bash
# Install fnm via Homebrew
brew install fnm

# Add to your shell (add to ~/.zshrc)
echo 'eval "$(fnm env --use-on-cd)"' >> ~/.zshrc
source ~/.zshrc

# Install Node.js
fnm install --lts

# Use a specific version
fnm use 20

# Install multiple versions
fnm install 18
fnm install 20
fnm install 22
```

---

## Verify Installation

After installing, verify it worked:

```bash
# Check Node.js version
node --version

# Check npm version (npm comes with Node.js)
npm --version

# Check where Node.js is installed
which node

# Check Node.js path
which npm
```

---

## Update Node.js

### If installed via Homebrew:
```bash
brew upgrade node
```

### If installed via official installer:
- Download the new version from nodejs.org
- Run the installer (it will upgrade automatically)

### If installed via nvm:
```bash
nvm install node --reinstall-packages-from=node
# or for LTS:
nvm install --lts --reinstall-packages-from=current
```

---

## Recommended Setup for Your Project

Since you're working with Supabase and have Homebrew, here's what I recommend:

1. **Keep your current setup** (Node.js v25.2.1 via Homebrew)
2. **Or use nvm** if you need to test with different Node.js versions

Your current setup should work fine for Supabase development!

---

## Troubleshooting

### Command not found after installation?
- **Restart your terminal** after installation
- If using Homebrew, make sure it's in your PATH:
  ```bash
  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  eval "$(/opt/homebrew/bin/brew shellenv)"
  ```

### Permission errors?
- Don't use `sudo` with Homebrew or npm
- If you used `sudo npm install -g`, fix permissions:
  ```bash
  sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
  ```

### Multiple Node.js versions causing issues?
- Check which version you're using: `which node`
- If you have both Homebrew and nvm, they might conflict
- Choose one method and stick with it

---

## Quick Reference

| Method | Install Command | Update Command |
|--------|----------------|----------------|
| Homebrew | `brew install node` | `brew upgrade node` |
| Official | Download from nodejs.org | Download new version |
| nvm | `nvm install --lts` | `nvm install node --reinstall-packages-from=node` |
| fnm | `fnm install --lts` | `fnm install --lts` |

---

**Your current Node.js version (v25.2.1) is perfectly fine for Supabase development!** 🎉

