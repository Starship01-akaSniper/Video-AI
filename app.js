// ======================================
// Configuration
// ======================================
const CONFIG = {
    API_KEY: 'sk-ps1iaSAdSn6xjkrWnd3GJtT1Y9ymr',
    API_BASE_URL: 'https://api.apifree.ai/v1',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    POLL_INTERVAL: 3000, // 3 seconds
    MAX_POLL_ATTEMPTS: 60, // 3 minutes total
    DEMO_MODE: true // Set to true to use demo videos when API doesn't support video generation
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

        console.log('Starting video generation with:', {
            prompt,
            negativePrompt,
            duration,
            quality
        });

        updateLoadingState('Sending request to Skywork AI...', 10);

        // Try primary endpoint: chat/completions with multimodal support
        const response = await fetch(`${CONFIG.API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.API_KEY}`
            },
            body: JSON.stringify({
                model: 'skywork-video-v1',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Create a ${duration}-second video. ${prompt}${negativePrompt ? ` Avoid: ${negativePrompt}` : ''}`
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
                max_tokens: 4000,
                stream: false
            })
        });

        updateLoadingState('Processing your request...', 30);

        console.log('API Response Status:', response.status);

        // Read response text first for debugging
        const responseText = await response.text();
        console.log('API Response:', responseText);

        if (!response.ok) {
            let errorMessage = `API Error (${response.status})`;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error?.message || errorData.message || errorMessage;

                // Provide helpful error messages
                if (response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your API key configuration.';
                } else if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
                } else if (response.status === 404) {
                    errorMessage = 'API endpoint not found. The service may not support video generation yet.';
                }
            } catch (e) {
                console.error('Error parsing error response:', e);
            }

            throw new Error(errorMessage);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response JSON:', e);
            throw new Error('Invalid response from API. Please try again.');
        }

        console.log('Parsed API Data:', data);

        // Handle different response formats
        if (data.video_url || data.videoUrl || data.video) {
            // Direct video URL in response
            const videoUrl = data.video_url || data.videoUrl || data.video;
            updateLoadingState('Video generated successfully!', 100);
            displayVideo(videoUrl);
        } else if (data.id || data.task_id || data.taskId) {
            // Job ID returned - need to poll
            const jobId = data.id || data.task_id || data.taskId;
            console.log('Polling for job:', jobId);
            await pollForVideo(jobId);
        } else if (data.data && Array.isArray(data.data) && data.data[0]?.url) {
            // OpenAI-style response with image/video URL
            updateLoadingState('Video generated successfully!', 100);
            displayVideo(data.data[0].url);
        } else if (data.choices && data.choices[0]?.message) {
            // Chat completion response - may contain video URL or instructions
            const message = data.choices[0].message.content;
            console.log('Chat response message:', message);

            // Try to extract video URL from message
            const urlMatch = message.match(/https?:\/\/[^\s]+\.(mp4|webm|mov)/i);
            if (urlMatch) {
                updateLoadingState('Video generated successfully!', 100);
                displayVideo(urlMatch[0]);
            } else {
                // No video URL found - API doesn't support video generation
                if (CONFIG.DEMO_MODE) {
                    console.log('API does not support video generation. Using demo mode.');
                    updateLoadingState('Generating demo video...', 70);
                    await sleep(2000); // Simulate processing time

                    // Use demo videos
                    const demoVideos = [
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                    ];

                    const randomVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)];
                    updateLoadingState('Video generated successfully!', 100);
                    displayVideo(randomVideo);

                    showToast('Demo Mode: API does not support video generation. Showing sample video.', 'info');
                } else {
                    hideLoading();
                    showToast('The API does not currently support video generation. Enable DEMO_MODE in app.js to test the UI.', 'error');
                    console.log('Full API response:', message);
                }
            }
        } else {
            // Unknown format - provide detailed error
            console.error('Unexpected API response structure:', data);
            hideLoading();

            // Check if it's a text-only model response
            showToast('API returned unexpected format. This may be a text-only model. Check console for details.', 'error');

            // Display a helpful message
            console.log('=== DEBUG INFO ===');
            console.log('Response keys:', Object.keys(data));
            console.log('Full response:', JSON.stringify(data, null, 2));
            console.log('=================');
        }

    } catch (error) {
        console.error('Video generation error:', error);
        hideLoading();

        // Provide user-friendly error message
        const userMessage = error.message || 'Failed to generate video. Please check the console for details.';
        showToast(userMessage, 'error');

        // Log helpful debugging info
        console.log('=== ERROR DEBUG INFO ===');
        console.log('Error:', error);
        console.log('API Key configured:', CONFIG.API_KEY ? 'Yes' : 'No');
        console.log('API Base URL:', CONFIG.API_BASE_URL);
        console.log('Image uploaded:', state.imageBase64 ? 'Yes' : 'No');
        console.log('=======================');
    } finally {
        state.isGenerating = false;
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
            // Try multiple possible polling endpoints
            let response = await fetch(`${CONFIG.API_BASE_URL}/video/generations/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.API_KEY}`
                }
            });

            // If 404, try alternative endpoint
            if (response.status === 404) {
                response = await fetch(`${CONFIG.API_BASE_URL}/tasks/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${CONFIG.API_KEY}`
                    }
                });
            }

            if (!response.ok) {
                console.warn(`Polling attempt ${attempts} failed with status ${response.status}`);
                continue;
            }

            const data = await response.json();
            console.log(`Poll attempt ${attempts}:`, data);

            if (data.status === 'completed' || data.status === 'succeeded' || data.status === 'success') {
                updateLoadingState('Video generated successfully!', 100);
                const videoUrl = data.video_url || data.videoUrl || data.url || data.output?.url || data.result?.url;

                if (videoUrl) {
                    displayVideo(videoUrl);
                    return;
                } else {
                    throw new Error('Video URL not found in completed response');
                }
            } else if (data.status === 'failed' || data.status === 'error') {
                throw new Error(data.error || data.message || 'Video generation failed');
            }
            // Continue polling if status is 'processing', 'pending', 'queued', etc.
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
