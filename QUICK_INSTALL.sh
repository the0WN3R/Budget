#!/bin/bash
# Quick install script for Homebrew and Node.js on Mac

echo "Step 1: Installing Homebrew..."
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo ""
echo "Step 2: Adding Homebrew to PATH..."
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

echo ""
echo "Step 3: Installing Node.js..."
brew install node

echo ""
echo "Step 4: Verifying installation..."
node --version
npm --version

echo ""
echo "Done! You can now install Supabase with: npm install @supabase/supabase-js"


