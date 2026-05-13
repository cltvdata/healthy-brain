# Deploy Instructions for Vercel

## Option 1: Manual Deploy (Fastest)

1. Go to: https://vercel.com/login
2. Login with GitHub
3. Go to: https://vercel.com/new
4. Import: `cltvdata/healthy-brain`
5. Settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click **Deploy**

## Option 2: With Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Option 3: Force GitHub Deploy

Go to GitHub Actions and run the workflow manually:
- https://github.com/cltvdata/healthy-brain/actions

## Current Status

- ✅ Build: Complete (54 files)
- ✅ GitHub: Pushed
- ⏳ Vercel: Needs manual deploy or GitHub secrets

## Files Ready

All 54 HTML files are in /dist folder and ready to deploy.