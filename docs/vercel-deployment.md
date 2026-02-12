# Vercel Deployment

This project is deployed on [Vercel](https://vercel.com) using **Vercel Git integration**. Builds and deployments run on Vercel when you push to GitHub; no GitHub Actions are used.

## 1. Project setup (one-time)

1. In [Vercel](https://vercel.com), import the GitHub repository (or create a project and connect the repo).
2. **Root Directory:** `.` (repository root). The app uses `distDir: '../../.next'` so the Next.js build output is written at the repo root for Vercel.
3. **Build Command:** leave default (`npm run build` — runs `npm run build --workspace=apps/web` from root).
4. **Output Directory:** leave default (Next.js auto-detects `.next` at root).
5. **Install Command:** leave default (`npm install` or `npm ci`).

## 2. How it works

- **Push to `main`** → Vercel builds and deploys to **production** (your main domain).
- **Push to any other branch** → Vercel builds and deploys a **preview** (unique URL per branch/commit).

Vercel clones the repo, installs dependencies from the root (workspace), runs the root build (which builds `apps/web`), and serves the output from `.next` at the repo root.
