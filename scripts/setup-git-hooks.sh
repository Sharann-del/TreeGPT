#!/bin/bash

# Setup Git hooks to prevent accidental API key commits
# Run: bash scripts/setup-git-hooks.sh

echo "🔧 Setting up Git hooks..."

# Make check script executable
chmod +x scripts/check-api-keys.sh

# Create pre-commit hook
if [ -d ".git/hooks" ]; then
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
bash scripts/check-api-keys.sh
EOF
    chmod +x .git/hooks/pre-commit
    echo "✅ Pre-commit hook installed"
else
    echo "⚠️  Not a Git repository. Initialize with: git init"
fi

echo ""
echo "✅ Git hooks setup complete!"
echo ""
echo "The pre-commit hook will now check for API keys before each commit."
echo "To bypass (not recommended): git commit --no-verify"

