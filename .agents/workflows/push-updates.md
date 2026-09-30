---
description: How to commit and push local changes to GitHub (which triggers Vercel auto-deploy)
---

# Push Updates Workflow

Use this workflow to commit your local changes and push them to GitHub. Vercel will automatically redeploy when changes are pushed to the main branch.

## Steps

1. **Stage all changes**
```
git add .
```

2. **Commit with a descriptive message**
```
git commit -m "your commit message here"
```

3. **Push to GitHub (triggers Vercel deploy)**
```
git push origin main
```

4. **Verify deployment** — Go to your Vercel Dashboard and confirm the deployment is live.

## Notes
- Make sure you are on the `main` branch before pushing.
- Use `git add <filename>` to stage specific files only.
- Run `git status` to check your working tree before committing.
