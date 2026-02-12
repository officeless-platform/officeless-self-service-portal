# Vercel Deployment

This project is deployed on [Vercel](https://vercel.com) using **Vercel Git integration**. Builds and deployments run on Vercel when you push to GitHub; no GitHub Actions are used.

## 1. Project setup (one-time)

1. In [Vercel](https://vercel.com), import the GitHub repository (or create a project and connect the repo).
2. **Root Directory:** `apps/web` (required — Next.js and its `package.json` live here).
3. **Build Command:** leave default (`next build` or `npm run build`).
4. **Output Directory:** leave default (Next.js is auto-detected).
5. **Install Command:** leave default (`npm install` or `npm ci`).

## 2. How it works

- **Push to `main`** → Vercel builds and deploys to **production** (your main domain).
- **Push to any other branch** → Vercel builds and deploys a **preview** (unique URL per branch/commit).

Vercel clones the repo, installs dependencies in `apps/web`, runs the build there, and serves the output. No extra CI (e.g. GitHub Actions) or secrets are required for deployment.
