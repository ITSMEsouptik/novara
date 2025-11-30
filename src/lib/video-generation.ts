import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

const COMET_API_KEY = process.env.COMET_API_KEY;
const COMET_API_URL = 'https://api.cometapi.com/v1';

interface VideoPayload {
    prompt: string;
    duration?: number; // in seconds
    seconds?: number;  // alternative to duration
    angle_id?: number;
    angle_name?: string;
    size?: string;
    model?: string;
}

export async function generateVideo(jobId: string, payload: VideoPayload) {
    try {
        console.log(`[Video Gen ${jobId}] ========== Starting video generation ==========`);
        console.log(`[Video Gen ${jobId}] Payload:`, JSON.stringify(payload, null, 2));
        console.log(`[Video Gen ${jobId}] CometAPI URL:`, COMET_API_URL);
        console.log(`[Video Gen ${jobId}] API Key configured:`, !!COMET_API_KEY);

        // 1. Call CometAPI to start generation
        const requestBody = {
            prompt: payload.prompt,
            model: payload.model || 'sora-2',
            seconds: payload.seconds || 5,
            size: payload.size || '720x1280',
        };
        console.log(`[Video Gen ${jobId}] Calling CometAPI /videos endpoint...`);
        console.log(`[Video Gen ${jobId}] Request body:`, JSON.stringify(requestBody, null, 2));

        const generateRes = await fetch(`${COMET_API_URL}/videos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COMET_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        console.log(`[Video Gen ${jobId}] CometAPI response status:`, generateRes.status);

        if (!generateRes.ok) {
            const errorText = await generateRes.text();
            console.error(`[Video Gen ${jobId}] CometAPI generation failed!`);
            console.error(`[Video Gen ${jobId}] Status: ${generateRes.status}`);
            console.error(`[Video Gen ${jobId}] Response: ${errorText}`);
            throw new Error(`CometAPI Generation Failed: ${generateRes.status} - ${errorText}`);
        }

        const genData = await generateRes.json();
        console.log(`[Video Gen ${jobId}] CometAPI response data:`, JSON.stringify(genData, null, 2));

        const videoId = genData.id; // Assuming API returns { id: "..." }
        if (!videoId) {
            console.error(`[Video Gen ${jobId}] No video ID returned from CometAPI!`);
            throw new Error('No video ID returned from CometAPI');
        }
        console.log(`[Video Gen ${jobId}] ✓ Generation started. Comet Video ID: ${videoId}`);

        // 2. Poll for completion
        console.log(`[Video Gen ${jobId}] Starting polling loop (max 2 minutes)...`);
        // Simple polling mechanism: check every 5s for up to 2 minutes
        let attempts = 0;
        const maxAttempts = 24; // 24 * 5s = 120s

        while (attempts < maxAttempts) {
            console.log(`[Video Gen ${jobId}] Waiting 5 seconds before polling attempt ${attempts + 1}/${maxAttempts}...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;

            // Check status (CometAPI might not have a status endpoint, but we can try fetching content)
            // Based on user snippet, we fetch content directly. If it fails/404, it's not ready.
            // Or we might need a status endpoint. Assuming 'content' endpoint returns 200 when ready.

            // NOTE: The user snippet showed a GET to /content. We'll try that.
            // If it returns 200 and a file, we are good.
            console.log(`[Video Gen ${jobId}] Polling attempt ${attempts}/${maxAttempts} - Fetching content...`);

            const contentRes = await fetch(`${COMET_API_URL}/videos/${videoId}/content`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${COMET_API_KEY}`,
                },
            });

            console.log(`[Video Gen ${jobId}] Content endpoint status: ${contentRes.status}`);

            if (contentRes.status === 200) {
                console.log(`[Video Gen ${jobId}] ✓ Video ready! Downloading...`);
                const buffer = await contentRes.arrayBuffer();
                const bufferSize = buffer.byteLength;
                console.log(`[Video Gen ${jobId}] Downloaded ${bufferSize} bytes (${(bufferSize / 1024 / 1024).toFixed(2)} MB)`);

                // 3. Save to local storage
                const fileName = `${jobId}.mp4`;
                const publicDir = path.join(process.cwd(), 'public', 'generated_videos');
                const filePath = path.join(publicDir, fileName);

                console.log(`[Video Gen ${jobId}] Saving to: ${filePath}`);

                // Ensure directory exists
                if (!fs.existsSync(publicDir)) {
                    console.log(`[Video Gen ${jobId}] Creating directory: ${publicDir}`);
                    fs.mkdirSync(publicDir, { recursive: true });
                } else {
                    console.log(`[Video Gen ${jobId}] Directory already exists: ${publicDir}`);
                }

                fs.writeFileSync(filePath, Buffer.from(buffer));
                console.log(`[Video Gen ${jobId}] ✓ Video saved successfully to ${filePath}`);

                // 4. Update Supabase with media_outputs array
                const videoUrl = `/generated_videos/${fileName}`;
                console.log(`[Video Gen ${jobId}] Public URL: ${videoUrl}`);
                console.log(`[Video Gen ${jobId}] Updating Supabase to 'completed' status...`);

                // Fetch existing job to get current payload
                const { data: existingJob, error: fetchError } = await supabase
                    .from('ad_jobs')
                    .select('payload')
                    .eq('job_id', jobId)
                    .single();

                if (fetchError) {
                    console.error(`[Video Gen ${jobId}] Error fetching existing job:`, fetchError);
                }

                // Append to media_outputs array
                const currentPayload = existingJob?.payload || {};
                const mediaOutputs = currentPayload.media_outputs || [];

                mediaOutputs.push({
                    id: crypto.randomUUID(),
                    type: 'video',
                    url: videoUrl,
                    angle_id: payload.angle_id || mediaOutputs.length + 1,
                    angle_name: payload.angle_name || `Angle ${mediaOutputs.length + 1}`,
                    prompt: payload.prompt,
                    duration: payload.duration || `${payload.seconds || 5}s`,
                    created_at: new Date().toISOString()
                });

                console.log(`[Video Gen ${jobId}] Adding video to media_outputs array (total: ${mediaOutputs.length})`);

                const { error: dbError } = await supabase
                    .from('ad_jobs')
                    .update({
                        status: 'completed',
                        video_url: videoUrl,  // Keep for backward compatibility
                        completed_at: new Date().toISOString(),
                        payload: {
                            ...currentPayload,
                            media_outputs: mediaOutputs
                        }
                    })
                    .eq('job_id', jobId);

                if (dbError) {
                    console.error(`[Video Gen ${jobId}] Supabase update failed:`, dbError);
                    throw dbError;
                }

                console.log(`[Video Gen ${jobId}] ✓✓✓ Job completed successfully! ✓✓✓`);
                return;
            } else if (contentRes.status === 202 || contentRes.status === 404) {
                // 202 Accepted usually means processing. 404 might mean not created yet.
                console.log(`[Video Gen ${jobId}] Status ${contentRes.status}: Still processing... (${attempts}/${maxAttempts})`);
                continue;
            } else {
                // Real error
                const err = await contentRes.text();
                console.error(`[Video Gen ${jobId}] ⚠️ Polling error - Status: ${contentRes.status}`);
                console.error(`[Video Gen ${jobId}] Error response: ${err}`);
                console.log(`[Video Gen ${jobId}] Continuing to poll in case it's transient...`);
                // Don't throw immediately, maybe transient? But usually 4xx/5xx is bad.
                // For now, keep polling unless it's a hard failure.
            }
        }

        console.error(`[Video Gen ${jobId}] ✗✗✗ Polling timed out after ${attempts} attempts (${attempts * 5}s) ✗✗✗`);
        throw new Error('Video generation timed out.');

    } catch (error) {
        console.error(`[Video Gen ${jobId}] ✗✗✗ FATAL ERROR generating video ✗✗✗`);
        console.error(`[Video Gen ${jobId}] Error:`, error);
        console.error(`[Video Gen ${jobId}] Stack:`, error instanceof Error ? error.stack : 'No stack trace');

        console.log(`[Video Gen ${jobId}] Updating job to 'failed' status in database...`);
        const { error: dbError } = await supabase
            .from('ad_jobs')
            .update({
                status: 'failed',
                n8n_raw: { error: String(error) } // Log error
            })
            .eq('job_id', jobId);

        if (dbError) {
            console.error(`[Video Gen ${jobId}] Failed to update database with error status:`, dbError);
        } else {
            console.log(`[Video Gen ${jobId}] Database updated to 'failed' status`);
        }
    }
}

interface StaticAdPayload {
    prompt: string;
    size?: string;
    imageUrls?: string[]; // Optional: uploaded product images for image-to-image generation
    angle_id?: number;
    angle_name?: string;
    placement?: string;  // 'meta_feed', 'meta_story_reel', 'google_rda', etc.
}

export async function generateStaticAd(jobId: string, payload: StaticAdPayload) {
    try {
        console.log(`[Static Gen ${jobId}] ========== Starting static ad generation ==========`);
        console.log(`[Static Gen ${jobId}] Payload:`, JSON.stringify(payload, null, 2));
        console.log(`[Static Gen ${jobId}] CometAPI URL:`, COMET_API_URL);
        console.log(`[Static Gen ${jobId}] API Key configured:`, !!COMET_API_KEY);

        // Check if we have uploaded images to use
        const hasImages = payload.imageUrls && payload.imageUrls.length > 0;
        console.log(`[Static Gen ${jobId}] Image-based generation: ${hasImages ? 'YES' : 'NO (text-only fallback)'}`);

        interface ImageRequestBody {
            prompt: string;
            model: string;
            size: string;
            image?: string; // base64 encoded image for image-to-image
        }
        let requestBody: ImageRequestBody;

        if (hasImages) {
            // IMAGE-TO-IMAGE MODE: Use first uploaded image
            const imageRelativePath = payload.imageUrls![0];
            console.log(`[Static Gen ${jobId}] Using base image: ${imageRelativePath}`);

            // Read image directly from filesystem (more efficient than HTTP fetch)
            // Convert relative URL path to filesystem path: /uploaded_images/... -> public/uploaded_images/...
            const imagePath = path.join(process.cwd(), 'public', imageRelativePath);
            console.log(`[Static Gen ${jobId}] Reading image from filesystem: ${imagePath}`);

            try {
                // Check if file exists
                if (!fs.existsSync(imagePath)) {
                    console.error(`[Static Gen ${jobId}] Image file not found at: ${imagePath}`);
                    console.log(`[Static Gen ${jobId}] Falling back to text-only generation`);
                    requestBody = {
                        prompt: payload.prompt,
                        model: "flux-1.1-pro",
                        size: payload.size || "1024x1024",
                    };
                } else {
                    // Read file directly
                    const imageBuffer = fs.readFileSync(imagePath);
                    const base64Image = imageBuffer.toString('base64');
                    console.log(`[Static Gen ${jobId}] Image read and converted to base64 (${base64Image.length} chars)`);

                    // CometAPI image-to-image request format
                    requestBody = {
                        prompt: payload.prompt,
                        image: base64Image, // Base64 encoded image
                        model: "flux-1.1-pro",
                        size: payload.size || "1024x1024",
                    };
                }
            } catch (readError) {
                console.error(`[Static Gen ${jobId}] Error reading image file:`, readError);
                console.log(`[Static Gen ${jobId}] Falling back to text-only generation`);
                requestBody = {
                    prompt: payload.prompt,
                    model: "flux-1.1-pro",
                    size: payload.size || "1024x1024",
                };
            }
        } else {
            // TEXT-TO-IMAGE MODE: Generate from prompt only
            requestBody = {
                prompt: payload.prompt,
                model: "flux-1.1-pro",
                size: payload.size || "1024x1024",
            };
        }

        console.log(`[Static Gen ${jobId}] Calling CometAPI /images endpoint...`);
        console.log(`[Static Gen ${jobId}] Request body (prompt):`, requestBody.prompt);
        console.log(`[Static Gen ${jobId}] Request has image data:`, !!requestBody.image);

        const generateRes = await fetch(`${COMET_API_URL}/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COMET_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        console.log(`[Static Gen ${jobId}] CometAPI response status:`, generateRes.status);

        if (!generateRes.ok) {
            const errorText = await generateRes.text();
            console.error(`[Static Gen ${jobId}] CometAPI image generation failed!`);
            console.error(`[Static Gen ${jobId}] Status: ${generateRes.status}`);
            console.error(`[Static Gen ${jobId}] Response: ${errorText}`);
            throw new Error(`CometAPI Image Generation Failed: ${generateRes.status} - ${errorText}`);
        }

        const genData = await generateRes.json();
        console.log(`[Static Gen ${jobId}] CometAPI response data:`, JSON.stringify(genData, null, 2));

        // Assuming CometAPI returns { url: "..." } or { data: [{ url: "..." }] }
        // Adjusting based on standard patterns, likely similar to their video endpoint or OpenAI
        const imageUrl = genData.url || (genData.data && genData.data[0]?.url);

        if (!imageUrl) {
            console.error(`[Static Gen ${jobId}] No image URL in response!`);
            throw new Error('No image URL returned from CometAPI');
        }

        console.log(`[Static Gen ${jobId}] ✓ Image generated. URL: ${imageUrl}`);

        // 2. Download the image
        console.log(`[Static Gen ${jobId}] Downloading image from CometAPI...`);
        const imageRes = await fetch(imageUrl);
        console.log(`[Static Gen ${jobId}] Download response status:`, imageRes.status);

        if (!imageRes.ok) {
            console.error(`[Static Gen ${jobId}] Failed to download image - Status: ${imageRes.status}`);
            throw new Error('Failed to download generated image');
        }

        const buffer = await imageRes.arrayBuffer();
        const bufferSize = buffer.byteLength;
        console.log(`[Static Gen ${jobId}] Downloaded ${bufferSize} bytes (${(bufferSize / 1024).toFixed(2)} KB)`);

        // 3. Save to local storage
        const fileName = `${jobId}.png`;
        const publicDir = path.join(process.cwd(), 'public', 'generated_images');
        const filePath = path.join(publicDir, fileName);

        console.log(`[Static Gen ${jobId}] Saving to: ${filePath}`);

        // Ensure directory exists
        if (!fs.existsSync(publicDir)) {
            console.log(`[Static Gen ${jobId}] Creating directory: ${publicDir}`);
            fs.mkdirSync(publicDir, { recursive: true });
            console.log(`[Static Gen ${jobId}] Directory already exists: ${publicDir}`);
        }

        fs.writeFileSync(filePath, Buffer.from(buffer));
        console.log(`[Static Gen ${jobId}] ✓ Image saved successfully to ${filePath}`);

        // 4. Update Supabase with media_outputs array
        const publicUrl = `/generated_images/${fileName}`;
        console.log(`[Static Gen ${jobId}] Public URL: ${publicUrl}`);
        console.log(`[Static Gen ${jobId}] Updating Supabase to 'completed' status...`);

        // Fetch existing job to get current payload
        const { data: existingJob, error: fetchError } = await supabase
            .from('ad_jobs')
            .select('payload')
            .eq('job_id', jobId)
            .single();

        if (fetchError) {
            console.error(`[Static Gen ${jobId}] Error fetching existing job:`, fetchError);
        }

        // Append to media_outputs array
        const currentPayload = existingJob?.payload || {};
        const mediaOutputs = currentPayload.media_outputs || [];

        mediaOutputs.push({
            id: crypto.randomUUID(),
            type: 'image',
            url: publicUrl,
            angle_id: payload.angle_id || Math.floor(mediaOutputs.length / 3) + 1,
            angle_name: payload.angle_name || `Angle ${Math.floor(mediaOutputs.length / 3) + 1}`,
            placement: payload.placement || 'static_ad',
            prompt: payload.prompt,
            created_at: new Date().toISOString()
        });

        console.log(`[Static Gen ${jobId}] Adding image to media_outputs array (total: ${mediaOutputs.length})`);

        const { error: dbError } = await supabase
            .from('ad_jobs')
            .update({
                status: 'completed',
                video_url: publicUrl,  // Keep for backward compatibility
                completed_at: new Date().toISOString(),
                payload: {
                    ...currentPayload,
                    media_outputs: mediaOutputs
                }
            })
            .eq('job_id', jobId);

        if (dbError) {
            console.error(`[Static Gen ${jobId}] Supabase update failed:`, dbError);
            throw dbError;
        }

        console.log(`[Static Gen ${jobId}] ✓✓✓ Static Job completed successfully! ✓✓✓`);

    } catch (error) {
        console.error(`[Static Gen ${jobId}] ✗✗✗ FATAL ERROR generating static ad ✗✗✗`);
        console.error(`[Static Gen ${jobId}] Error:`, error);
        console.error(`[Static Gen ${jobId}] Stack:`, error instanceof Error ? error.stack : 'No stack trace');

        console.log(`[Static Gen ${jobId}] Updating job to 'failed' status in database...`);
        const { error: dbError } = await supabase
            .from('ad_jobs')
            .update({
                status: 'failed',
                n8n_raw: { error: String(error) }
            })
            .eq('job_id', jobId);

        if (dbError) {
            console.error(`[Static Gen ${jobId}] Failed to update database with error status:`, dbError);
        } else {
            console.log(`[Static Gen ${jobId}] Database updated to 'failed' status`);
        }
    }
}
