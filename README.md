# 🎬 Skywork AI Video Generator

A beautiful, free-to-use web application for generating AI-powered videos using Skywork AI. Transform your images into stunning videos perfect for YouTube content creation - no sign-up required!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## ✨ Features

- 🖼️ **Image-to-Video Generation** - Upload any image and transform it into a video
- 🎨 **Customizable Prompts** - Guide the AI with detailed text prompts
- ⚡ **Lightning Fast** - Videos generated in under 60 seconds
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- 🎯 **HD Quality** - Professional-quality output ready for YouTube
- 💯 **100% Free** - No credits, no subscriptions, no hidden costs
- 🚀 **No Sign-up** - Start creating immediately
- 🌙 **Dark Mode** - Modern, premium UI with glassmorphism effects

## 🚀 Live Demo

**GitHub Pages:** [https://yourusername.github.io/skywork-video-generator](https://yourusername.github.io/skywork-video-generator)

## 📦 Installation & Deployment

### Option 1: GitHub Pages (Recommended)

1. **Fork or Clone this repository**
   ```bash
   git clone https://github.com/yourusername/skywork-video-generator.git
   cd skywork-video-generator
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/skywork-video-generator.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be live at `https://yourusername.github.io/skywork-video-generator`

### Option 2: Local Development

Simply open `index.html` in your web browser. No build process required!

```bash
# On Windows
start index.html

# On Mac
open index.html

# On Linux
xdg-open index.html
```

## 🎯 Usage

1. **Upload an Image**
   - Click the upload area or drag and drop an image
   - Supports PNG, JPG, and WebP formats (max 10MB)

2. **Customize Settings**
   - Add a video prompt describing what you want
   - Optionally add a negative prompt for what to avoid
   - Select duration (5 or 10 seconds)
   - Choose quality (Standard or HD)

3. **Generate Video**
   - Click "Generate Video" button
   - Wait 30-60 seconds for AI processing
   - Preview your generated video

4. **Download & Share**
   - Click "Download Video" to save locally
   - Use the video for YouTube, social media, or any project!

## ⚙️ Configuration

### API Key

The application uses the APIFree.ai service with the Skywork AI API. The API key is configured in `app.js`:

```javascript
const CONFIG = {
    API_KEY: 'sk-ps1iaSAdSn6xjkrWnd3GJtT1Y9ymr',
    API_BASE_URL: 'https://api.apifree.ai/v1',
    // ... other settings
};
```

> **Note:** Since this is a client-side application, the API key is visible in the source code. This is acceptable for this use case, but be aware that others could use the key if they view the source.

### Customization

You can customize various aspects in `app.js`:

- `MAX_FILE_SIZE` - Maximum image upload size (default: 10MB)
- `POLL_INTERVAL` - How often to check video status (default: 3 seconds)
- `MAX_POLL_ATTEMPTS` - Maximum polling attempts (default: 60)

## 🏗️ Project Structure

```
skywork-video-generator/
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── app.js              # Application logic and API integration
├── README.md           # This file
└── .gitignore          # Git ignore patterns
```

## 🎨 Design Features

- **Modern Glassmorphism UI** - Frosted glass effects with backdrop blur
- **Smooth Animations** - Micro-interactions and transitions throughout
- **Responsive Design** - Adapts perfectly to any screen size
- **Dark Theme** - Easy on the eyes with vibrant gradient accents
- **Premium Typography** - Using Inter font for clean, modern look

## 🔧 Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript** - No frameworks, pure JS
- **Skywork AI API** - Video generation via APIFree.ai
- **Google Fonts** - Inter font family

## 📝 API Documentation

This application uses the APIFree.ai unified API to access Skywork AI models. The API follows an OpenAI-compatible structure.

**Endpoints used:**
- `POST /v1/video/generations` - Generate video from image
- `GET /v1/video/generations/{id}` - Check video generation status

For more details, visit [APIFree.ai Documentation](https://apifree.ai)

## 🐛 Troubleshooting

### Video Generation Fails

- **Check API key** - Ensure the API key is valid
- **Check image format** - Only PNG, JPG, and WebP are supported
- **Check file size** - Images must be under 10MB
- **Check rate limits** - The free API may have usage limits

### Download Not Working

- **CORS issues** - Some video URLs may have CORS restrictions
- **Alternative** - Right-click the video and select "Save video as..."

### UI Not Loading

- **Check browser** - Use a modern browser (Chrome, Firefox, Safari, Edge)
- **Clear cache** - Try clearing browser cache and reloading
- **Console errors** - Check browser console (F12) for errors

## 📜 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Skywork AI** - For providing the amazing video generation API
- **APIFree.ai** - For the unified API platform
- **Google Fonts** - For the beautiful Inter font family

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📧 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ for the YouTube creator community

**Star ⭐ this repo if you find it useful!**
