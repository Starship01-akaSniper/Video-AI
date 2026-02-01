# 🚀 GitHub Deployment Guide

This guide will walk you through deploying your Skywork AI Video Generator to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer

## Step-by-Step Deployment

### 1. Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the **"+"** icon in the top right and select **"New repository"**
3. Name your repository (e.g., `skywork-video-generator`)
4. Add a description (optional)
5. Keep it **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click **"Create repository"**

### 2. Initialize Git in Your Project

Open your terminal/command prompt and navigate to the project folder:

```bash
cd C:\Users\rohan\.gemini\antigravity\scratch\skywork-video-generator
```

Initialize Git and add files:

```bash
git init
git add .
git commit -m "Initial commit: Skywork AI Video Generator"
```

### 3. Connect to GitHub and Push

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/skywork-video-generator.git
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **"Settings"** (top menu)
3. Scroll down and click **"Pages"** (left sidebar)
4. Under **"Source"**, select **"main"** branch
5. Click **"Save"**
6. Wait 1-2 minutes for deployment

### 5. Access Your Live Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/skywork-video-generator
```

GitHub will show you the URL in the Pages settings once deployed.

## Updating Your Site

Whenever you make changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

GitHub Pages will automatically rebuild your site within 1-2 minutes.

## Custom Domain (Optional)

To use a custom domain:

1. Buy a domain from a registrar (e.g., Namecheap, GoDaddy)
2. In your repository, create a file named `CNAME` with your domain (e.g., `videogen.yoursite.com`)
3. In your domain registrar's DNS settings, add a CNAME record pointing to `YOUR_USERNAME.github.io`
4. In GitHub Pages settings, enter your custom domain
5. Enable "Enforce HTTPS"

## Troubleshooting

### Site Not Loading

- Wait 2-3 minutes after initial deployment
- Check that you selected the `main` branch
- Ensure your repository is public
- Clear your browser cache

### 404 Error

- Verify `index.html` is in the root directory
- Check that files were committed and pushed
- Visit the exact URL shown in Pages settings

### API Not Working

- Check browser console (F12) for errors
- Verify the API key is correctly set in `app.js`
- Test the API with a simple curl command first

## Alternative Hosting Options

### Netlify

1. Go to [Netlify](https://netlify.com)
2. Drag and drop your project folder
3. Site goes live instantly!

### Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Deploy with one click!

### Cloudflare Pages

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Deploy automatically!

## Security Note

Remember that your API key is visible in the client-side code. For production use, consider:

1. Setting up a backend proxy to hide the API key
2. Using environment variables with a build process
3. Implementing rate limiting to prevent abuse

## Need Help?

- Check the [GitHub Pages Documentation](https://docs.github.com/en/pages)
- Open an issue in your repository
- Consult the README.md for more information

---

**Congratulations! Your video generator is now live! 🎉**
