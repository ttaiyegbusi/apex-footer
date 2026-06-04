# Apex Footer

A production-ready footer component for the Apex landing page.

## Project Structure

```
apex-footer/
├── index.html              # Main HTML
├── style.css               # All styles + @font-face declarations
├── fonts/
│   ├── Phudu-Black.ttf     # Display font (headlines)
│   ├── Inter-Regular.ttf   # Body font
│   ├── Inter-Medium.ttf
│   └── Inter-SemiBold.ttf
├── assets/
│   └── blobs/              # Scalloped tag SVGs (blob-1.svg … blob-13.svg)
├── .gitignore
└── README.md
```

## Local Preview

Just open `index.html` in a browser — no build step needed.  
Or use VS Code's Live Server extension for hot reload.

## Deploy to GitHub + Vercel

### 1. Push to GitHub

```bash
cd apex-footer
git init
git add .
git commit -m "feat: add apex footer"
```

Go to [github.com/new](https://github.com/new), create a new repo (e.g. `apex-footer`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/apex-footer.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your `apex-footer` GitHub repo
4. Framework Preset: **Other** (it's plain HTML)
5. Root Directory: leave as `/`
6. Click **Deploy**

Vercel will automatically detect `index.html` as the entry point.  
Every `git push` to `main` will trigger a redeploy automatically.
# apex-footer
