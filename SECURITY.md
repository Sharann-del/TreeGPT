# Security Guide - API Key Safety

## 🔐 How Your API Key is Protected

TreeGPT uses a **Bring Your Own Key (BYOK)** model. Your API key is **NEVER** sent to our servers and stays only in your browser.

### Current Security Model

1. **Client-Side Storage Only**
   - API keys are stored in browser `localStorage`
   - Keys never leave your device
   - No server-side storage or transmission

2. **Direct API Calls**
   - API calls are made directly from your browser to OpenAI
   - No proxy or intermediate server
   - Your key is only used for your own requests

3. **No Hardcoded Keys**
   - The codebase contains **zero** hardcoded API keys
   - All keys are user-provided at runtime

## ✅ Safe Practices

### ✅ DO:
- Enter your API key only in the app's UI (stored in localStorage)
- Use your own OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Set spending limits on your OpenAI account
- Rotate your key if you suspect it's compromised
- Keep your key private - don't share it

### ❌ DON'T:
- **NEVER** hardcode your API key in source code
- **NEVER** commit API keys to Git/GitHub
- **NEVER** share your API key publicly
- **NEVER** paste your key in screenshots or videos
- **NEVER** store keys in environment files that get committed

## 🛡️ Protection Against Accidental Exposure

### Git Protection

The `.gitignore` file is configured to exclude:
- `.env` files
- Files with `*api-key*`, `*secret*` patterns
- Local config files

### Pre-Commit Checks

Before committing, check for accidental key exposure:

```bash
# Search for potential API keys in your code
grep -r "sk-[a-zA-Z0-9]" --exclude-dir=node_modules .

# If you find any matches, remove them immediately!
```

### If You Accidentally Commit a Key

1. **Immediately revoke the key** on OpenAI platform
2. **Generate a new key**
3. **Remove from Git history** (if not yet pushed):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
4. **If already pushed**: Rotate the key immediately (GitHub history is permanent)

## 🔍 How to Verify No Keys Are Committed

Run this before every commit:

```bash
# Check for OpenAI API key patterns
git diff --cached | grep -i "sk-" || echo "✅ No API keys found in staged changes"

# Check entire codebase (excluding node_modules)
grep -r "sk-[a-zA-Z0-9]" --exclude-dir=node_modules . || echo "✅ No API keys found"
```

## 📝 Development Best Practices

1. **Use Environment Variables for Testing** (if needed)
   - Create `.env.local` (already in .gitignore)
   - Load only in development
   - Never commit `.env` files

2. **Code Review Checklist**
   - ✅ No hardcoded keys
   - ✅ No keys in comments
   - ✅ No keys in example code
   - ✅ No keys in documentation screenshots

3. **Testing Without Real Keys**
   - Use mock responses during development
   - Only use real keys when testing actual API integration

## 🚨 What Happens If Your Key is Exposed?

1. **Immediate Actions:**
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Delete the exposed key
   - Create a new key
   - Update your app with the new key

2. **Check Usage:**
   - Review your OpenAI usage dashboard
   - Look for unexpected API calls
   - Set up usage alerts

3. **Prevent Future Issues:**
   - Review your Git workflow
   - Set up pre-commit hooks
   - Use environment variables properly

## 🔒 Additional Security Tips

- **Set Spending Limits**: In your OpenAI account, set monthly spending limits
- **Use Key Restrictions**: If available, restrict keys to specific IPs/domains
- **Monitor Usage**: Regularly check your OpenAI dashboard for unusual activity
- **Rotate Regularly**: Consider rotating keys periodically

## 📚 Resources

- [OpenAI API Key Management](https://platform.openai.com/api-keys)
- [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

**Remember**: Your API key = Your responsibility. Keep it safe! 🔐

