# Quick Start Guide - API Key Setup

## 🚀 Getting Your API Key Safely

### Step 1: Get Your OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-`)
5. **Save it somewhere safe** - you won't see it again!

### Step 2: Set Up Git Protection (Recommended)

Before you start coding, protect yourself from accidental commits:

```bash
# Install Git hooks to check for API keys
bash scripts/setup-git-hooks.sh
```

This will prevent you from accidentally committing API keys.

### Step 3: Enter Your Key in the App

1. Start the app: `npm run dev`
2. Open `http://localhost:3000`
3. Click "⚙️ API Settings"
4. Paste your API key
5. Click "Test Key" to verify
6. Click "Save"

**That's it!** Your key is now stored safely in your browser's localStorage.

## ✅ Verification Checklist

Before committing code, always check:

```bash
# Quick check for accidental keys
grep -r "sk-" --exclude-dir=node_modules . || echo "✅ Safe!"
```

## 🛡️ What's Protected

- ✅ Your key is in `localStorage` (browser only)
- ✅ `.gitignore` excludes sensitive files
- ✅ Git hooks check before commits
- ✅ No hardcoded keys in code

## 🚨 If You Accidentally Commit a Key

1. **Immediately** revoke it on OpenAI platform
2. Generate a new key
3. Remove from Git history (see SECURITY.md)

## 📚 More Info

- Full security guide: [SECURITY.md](./SECURITY.md)
- Setup instructions: [SETUP.md](./SETUP.md)

---

**Remember**: Your API key = Your responsibility. Keep it safe! 🔐

