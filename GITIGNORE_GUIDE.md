# Git Ignore Configuration

This document explains the `.gitignore` setup for the FarmToMarket project.

## Structure

The project uses a **three-tier `.gitignore` strategy**:

1. **Root `.gitignore`** - Handles common patterns across the entire project
2. **Backend `.gitignore`** - Java/Spring Boot specific patterns
3. **Frontend `.gitignore`** - Node.js/React/Vite specific patterns

## What's Ignored

### Root Level (applies to entire project)
- **OS Files**: `.DS_Store`, `Thumbs.db`, etc.
- **IDE/Editor**: `.vscode/`, `.idea/`, `*.swp`, etc.
- **Environment Variables**: `.env`, `.env.local`, etc.
- **Logs**: `*.log`, `logs/`, etc.
- **Temporary Files**: `*.tmp`, `*.temp`, `.cache/`

### Backend (Java/Spring Boot)
- **Build Artifacts**: `target/`, `build/`, `*.class`
- **Maven**: `.mvn/`, `pom.xml.*` backup files
- **Spring Boot**: `HELP.md`, `.sts4-cache/`, `spring-boot-*.log`
- **Database Files**: `*.db`, `*.sqlite`, `*.h2.db`
- **IDE Specific**: `*.iml`, `*.ipr`, `out/`

### Frontend (React/Vite/TypeScript)
- **Dependencies**: `node_modules/`
- **Build Output**: `dist/`, `build/`, `.next/`
- **Vite**: `.vite/`, `*.local`
- **TypeScript**: `*.tsbuildinfo`, `.tscache/`
- **Cache**: `.npm`, `.eslintcache`, `.parcel-cache`
- **Deployment**: `.vercel`, `.netlify`, `.firebase/`

## Important Files

### Environment Variables
- **`.env`** files are ignored for security
- Use **`.env.example`** to document required variables
- Never commit actual API keys or secrets

### Lock Files
Package manager lock files (`yarn.lock`, `package-lock.json`) are currently **tracked** to ensure consistent dependencies across environments. If you prefer to ignore them, uncomment the relevant lines in the root `.gitignore`.

## Cleanup Done

The following files were removed from git tracking:
- ✅ `.DS_Store` (root level)
- ✅ `frontend/.env` (contained sensitive Clerk API key)

These files still exist locally but are no longer tracked by git.

## Best Practices

1. **Never commit**:
   - API keys, tokens, or passwords
   - Database files
   - Build artifacts
   - IDE-specific settings (unless team-wide)
   - OS-specific files

2. **Always commit**:
   - `.env.example` files
   - `.gitignore` files
   - Configuration templates
   - Documentation

3. **Before committing**:
   - Run `git status` to review changes
   - Check for accidentally staged sensitive files
   - Ensure build artifacts aren't included

## Verification

To verify what's being ignored:
```bash
# Check git status
git status

# See all tracked files
git ls-files

# Check if a specific file is ignored
git check-ignore -v <filename>
```

## Recovery

If you accidentally committed sensitive files:
```bash
# Remove from git but keep locally
git rm --cached <filename>

# Add to .gitignore
echo "<filename>" >> .gitignore

# Commit the changes
git add .gitignore
git commit -m "Remove sensitive file from tracking"
```

⚠️ **Note**: Files removed from tracking remain in git history. For truly sensitive data, consider using `git filter-branch` or BFG Repo-Cleaner.
