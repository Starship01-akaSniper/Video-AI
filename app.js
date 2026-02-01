// ======================================
// Configuration
// ======================================
const CONFIG = {
    API_KEY: 'sk-ps1iaSAdSn6xjkrWnd3GJtT1Y9ymr',
    API_BASE_URL: 'https://api.apifree.ai/v1',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    POLL_INTERVAL: 3000, // 3 seconds
    MAX_POLL_ATTEMPTS: 60 // 3 minutes total
};

// ======================================
// State Management
// ======================================
const state = {
    uploadedImage: null,
    imageBase64: null,
    generatedVideoUrl: null,
    isGenerating: false
};

// ======================================
// DOM Elements
// ======================================
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    imageInput: document.getElementById('imageInput'),
    uploadPlaceholder: document.getElementById('uploadPlaceholder'),
    imagePreview: document.getElementById('imagePreview'),
    previewImg: document.getElementById('previewImg'),
    removeImage: document.getElementById('removeImage'),

    promptInput: document.getElementById('promptInput'),
    negativePrompt: document.getElementById('negativePrompt'),
    durationSelect: document.getElementById('durationSelect'),
    qualitySelect: document.getElementById('qualitySelect'),

    generateBtn: document.getElementById('generateBtn'),
    resultCard: document.getElementById('resultCard'),
    resultVideo: document.getElementById('resultVideo'),
    downloadBtn: document.getElementById('downloadBtn'),
    generateNewBtn: document.getElementById('generateNewBtn'),

    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText'),
    progressFill: document.getElementById('progressFill'),

    toast: document.getElementById('toast')
};

// ======================================
// Utility Functions
// ======================================
function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function updateLoadingState(text, progress) {
    elements.loadingText.textContent = text;
    if (progress !== undefined) {
        elements.progressFill.style.width = `${progress}%`;
    }
}

function showLoading() {
    elements.loadingOverlay.style.display = 'flex';
    updateLoadingState('Initializing AI model...', 0);
}

function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ======================================
// Image Upload Handling
// ======================================
function handleImageSelect(file) {
    // Validate file
    if (!file) return;

    if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
        showToast('Please upload a valid image (PNG, JPG, WebP)', 'error');
        return;
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast('Image size must be less than 10MB', 'error');
        return;
    }

    // Store file and convert to base64
    state.uploadedImage = file;

    fileToBase64(file).then(base64 => {
        state.imageBase64 = base64;

        // Show preview
        elements.previewImg.src = base64;
        elements.uploadPlaceholder.style.display = 'none';
        elements.imagePreview.style.display = 'flex';

        // Enable generate button
        elements.generateBtn.disabled = false;

        showToast('Image uploaded successfully!', 'success');
    }).catch(error => {
        console.error('Error reading file:', error);
        showToast('Failed to read image file', 'error');
    });
}

function removeImage() {
    state.uploadedImage = null;
    state.imageBase64 = null;

    elements.uploadPlaceholder.style.display = 'flex';
    elements.imagePreview.style.display = 'none';
    elements.previewImg.src = '';

    elements.generateBtn.disabled = true;
    elements.imageInput.value = '';
}

// ======================================
// API Integration
// ======================================
async function generateVideo() {
    if (!state.imageBase64 || state.isGenerating) return;

    state.isGenerating = true;
    showLoading();

    try {
        const prompt = elements.promptInput.value.trim() || 'Generate a smooth, cinematic video from this image';
        const negativePrompt = elements.negativePrompt.value.trim();
        const duration = elements.durationSelect.value;
        const quality = elements.qualitySelect.value;

        updateLoadingState('Sending request to Skywork AI...', 10);

        // API Request - Using OpenAI-compatible format for apifree.ai
        // Note: The exact endpoint and format may vary. This is based on standard multimodal API patterns.
        const response = await fetch(`${CONFIG.API_BASE_URL}/video/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.API_KEY}`
            },
            body: JSON.stringify({
                model: 'skywork-video-v3', // Model name - may need adjustment based on actual API
                prompt: prompt,
                negative_prompt: negativePrompt,
                image: state.imageBase64,
                duration: parseInt(duration),
                quality: quality,
                num_frames: quality === 'hd' ? 60 : 30
            })
        });

        updateLoadingState('Processing your request...', 30);

        if (!response.ok) {
            // Try alternative endpoint format
            if (response.status === 404) {
                return await tryAlternativeEndpoint(prompt, negativePrompt, duration, quality);
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();

        // Handle different response formats
        if (data.video_url) {
            // Direct URL returned
            updateLoadingState('Video generated successfully!', 100);
            displayVideo(data.video_url);
        } else if (data.id || data.task_id) {
            // Job ID returned - need to poll
            const jobId = data.id || data.task_id;
            await pollForVideo(jobId);
        } else if (data.data && data.data[0]?.url) {
            // OpenAI-style response
            updateLoadingState('Video generated successfully!', 100);
            displayVideo(data.data[0].url);
        } else {
            throw new Error('Unexpected API response format');
        }

    } catch (error) {
        console.error('Video generation error:', error);
        hideLoading();
        showToast(error.message || 'Failed to generate video. Please try again.', 'error');
    } finally {
        state.isGenerating = false;
    }
}

async function tryAlternativeEndpoint(prompt, negativePrompt, duration, quality) {
    // Try chat completions endpoint with vision
    updateLoadingState('Trying alternative API endpoint...', 20);

    const response = await fetch(`${CONFIG.API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.API_KEY}`
        },
        body: JSON.stringify({
            model: 'skywork-video',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Generate a ${duration}-second video with this prompt: ${prompt}${negativePrompt ? `. Avoid: ${negativePrompt}` : ''}`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: state.imageBase64
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'API endpoint not available. Please check the API documentation.');
    }

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
        // Parse response for video URL
        const content = data.choices[0].message.content;
        const urlMatch = content.match(/https?:\/\/[^\s]+\.mp4/);

        if (urlMatch) {
            updateLoadingState('Video generated successfully!', 100);
            displayVideo(urlMatch[0]);
        } else {
            throw new Error('No video URL found in response');
        }
    } else {
        throw new Error('Unexpected response format');
    }
}

async function pollForVideo(jobId) {
    let attempts = 0;

    while (attempts < CONFIG.MAX_POLL_ATTEMPTS) {
        attempts++;
        const progress = Math.min(30 + (attempts / CONFIG.MAX_POLL_ATTEMPTS) * 60, 90);
        updateLoadingState(`Generating your video... (${attempts}/${CONFIG.MAX_POLL_ATTEMPTS})`, progress);

        await sleep(CONFIG.POLL_INTERVAL);

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/video/generations/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.API_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check video status');
            }

            const data = await response.json();

            if (data.status === 'completed' || data.status === 'succeeded') {
                updateLoadingState('Video generated successfully!', 100);
                const videoUrl = data.video_url || data.url || data.output?.url;

                if (videoUrl) {
                    displayVideo(videoUrl);
                    return;
                } else {
                    throw new Error('Video URL not found in completed response');
                }
            } else if (data.status === 'failed' || data.status === 'error') {
                throw new Error(data.error || 'Video generation failed');
            }
            // Continue polling if status is 'processing', 'pending', etc.
        } catch (error) {
            if (attempts >= CONFIG.MAX_POLL_ATTEMPTS) {
                throw error;
            }
            // Continue polling on temporary errors
            console.warn('Polling error:', error);
        }
    }

    throw new Error('Video generation timed out. Please try again.');
}

function displayVideo(videoUrl) {
    state.generatedVideoUrl = videoUrl;

    // Hide loading
    hideLoading();

    // Set video source
    elements.resultVideo.src = videoUrl;

    // Show result card
    elements.resultCard.style.display = 'block';

    // Scroll to result
    elements.resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    showToast('Video generated successfully!', 'success');
}

// ======================================
// Download Functionality
// ======================================
async function downloadVideo() {
    if (!state.generatedVideoUrl) return;

    try {
        showToast('Downloading video...', 'info');

        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = state.generatedVideoUrl;
        link.download = `skywork-video-${Date.now()}.mp4`;
        link.target = '_blank';

        // For URLs that don't support direct download, open in new tab
        link.click();

        showToast('Download started!', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showToast('Could not download video. Please right-click the video and save.', 'error');
    }
}

function resetGenerator() {
    // Hide result card
    elements.resultCard.style.display = 'none';

    // Clear video
    elements.resultVideo.src = '';
    state.generatedVideoUrl = null;

    // Reset form
    elements.promptInput.value = '';
    elements.negativePrompt.value = '';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ======================================
// Event Listeners
// ======================================

// Upload area click
elements.uploadArea.addEventListener('click', () => {
    elements.imageInput.click();
});

// File input change
elements.imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleImageSelect(file);
});

// Drag and drop
elements.uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadArea.classList.add('drag-over');
});

elements.uploadArea.addEventListener('dragleave', () => {
    elements.uploadArea.classList.remove('drag-over');
});

elements.uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
});

// Remove image
elements.removeImage.addEventListener('click', (e) => {
    e.stopPropagation();
    removeImage();
});

// Generate button
elements.generateBtn.addEventListener('click', generateVideo);

// Download button
elements.downloadBtn.addEventListener('click', downloadVideo);

// Generate new button
elements.generateNewBtn.addEventListener('click', resetGenerator);

// Prevent default drag behavior on document
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

// ======================================
// Initialization
// ======================================
console.log('🎬 Skywork AI Video Generator initialized');
console.log('Upload an image to get started!');
