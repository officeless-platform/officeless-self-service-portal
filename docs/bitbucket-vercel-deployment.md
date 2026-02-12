# Bitbucket Pipelines → Vercel Deployment

This project uses Bitbucket Pipelines to build and deploy to Vercel.

## 1. Vercel project setup

1. In [Vercel](https://vercel.com), import the Bitbucket repository (or create a project and connect the repo).
2. **Root Directory:** `.` (repository root).
3. **Build Command:** `npm ci && npm run build --workspace=apps/web`
4. **Output Directory:** leave default (Next.js is auto-detected).
5. **Install Command:** leave default (`npm install` / `npm ci`).
6. Do **not** enable “Vercel Git” auto-deploys if you want only Bitbucket Pipelines to deploy (optional; you can use both).

## 2. Get Vercel tokens and IDs

1. **Token:** [Account → Tokens](https://vercel.com/account/tokens) → Create token (e.g. “Bitbucket Pipelines”). Copy the token.
2. **Org & Project IDs:** In the project **Settings → General**, copy **Project ID**. For **Team/Org ID**, use the value from your Vercel URL (`vercel.com/<org-id>/...`) or run `vercel link` locally and read `.vercel/project.json`.

## 3. Bitbucket repository variables

In Bitbucket: **Repository settings → Pipelines → Repository variables**. Add:

| Variable           | Value              | Secured |
|--------------------|--------------------|--------|
| `VERCEL_TOKEN`     | (your Vercel token)| Yes    |
| `VERCEL_ORG_ID`    | (your team/org id) | No     |
| `VERCEL_PROJECT_ID`| (your project id)  | No     |

## 4. Pipeline behaviour

- **`main`**  
  - Runs: install → `vercel pull` (production) → `vercel build` → `vercel deploy --prebuilt --prod`  
  - **Deployment target:** production (e.g. your main domain).

- **Any other branch**  
  - Runs: install → `vercel pull` (preview) → `vercel build` → `vercel deploy --prebuilt`  
  - **Deployment target:** preview (unique URL per branch/commit).

Build and deploy are done in Bitbucket; Vercel receives the prebuilt output and serves it.

## 5. Optional: commit `.vercel/project.json`

If you run `vercel link` in the repo and commit `.vercel/project.json`, you can omit `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` in Bitbucket; the CLI will read them from the file. Keep `VERCEL_TOKEN` as a secured variable.
