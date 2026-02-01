# API Troubleshooting Guide

## Current Error: "Unexpected response format"

This error occurs because the actual apifree.ai API structure may differ from our implementation. Here's how to debug and fix it:

### Step 1: Check Browser Console

1. Open your deployed site: https://starship01-akasniper.github.io/Video-AI/
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Upload an image and click Generate
5. Look for detailed error messages

### Step 2: Check API Response

The updated code now logs extensive debugging information:

```
=== DEBUG INFO ===
Response keys: [...]
Full response: {...}
=================
```

Look for this in the console to see what the API actually returns.

### Step 3: Verify API Key

1. Check that your API key is valid: `sk-ps1iaSAdSn6xjkrWnd3GJtT1Y9ymr`
2. Try testing it directly:

```bash
curl -X POST https://api.apifree.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-ps1iaSAdSn6xjkrWnd3GJtT1Y9ymr" \
  -d '{
    "model": "skywork-video-v1",
    "messages": [{"role": "user", "content": "Test"}]
  }'
```

### Step 4: Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `401 Unauthorized` | Invalid API key | Verify key is correct |
| `404 Not Found` | Endpoint doesn't exist | API may not support video yet |
| `429 Too Many Requests` | Rate limit | Wait a few minutes |
| `500 Server Error` | API is down | Try again later |

### Step 5: Alternative Testing

If the API isn't working, you can test the UI with a sample video:

1. Open `app.js`
2. Find the `generateVideo()` function
3. Add this at the start for testing:

```javascript
// TEST MODE - Remove after verifying
setTimeout(() => {
    displayVideo('https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4');
}, 2000);
return; // Exit early for testing
```

### Step 6: Check APIFree Documentation

Visit these resources:
- **APIFree Dashboard**: https://apifree.ai/dashboard
- **Model List**: https://apifree.ai/models
- **API Docs**: Check if there's a documentation link

### Updated Code Features

The latest version includes:

✅ **Better Error Handling** - Shows specific error messages  
✅ **Detailed Logging** - Console shows full API responses  
✅ **Multiple Endpoints** - Tries different API formats  
✅ **Helpful Debug Info** - Easy to see what's wrong  

### Next Steps

1. **Check Console Logs** - See what the API actually returns
2. **Verify API Access** - Confirm your key works
3. **Contact Support** - Email apifree.ai if key is valid but not working
4. **Try Alternative** - Use a demo video URL for now

### Contact APIFree Support

If your API key should work but doesn't:
- Email: support@apifree.ai
- Include: Your API key, error message, and what you're trying to do

---

**Updated**: The deployment has been updated with improved error handling. Refresh your page and try again to see detailed error messages.
