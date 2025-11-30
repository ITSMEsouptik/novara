import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const COMET_API_URL = 'https://api.cometapi.com/v1';
const COMET_API_KEY = process.env.COMET_API_KEY;

// Control how many videos to generate: -1 = all, 1 = first only, 2 = first two, etc.
const MAX_VIDEOS_TO_GENERATE: number = 1;

export async function POST(request: NextRequest) {
    console.log('[Batch Video Gen] Request received at:', new Date().toISOString());

    // Verify secret
    const secret = request.headers.get('x-n8n-secret');
    const expectedSecret = process.env.N8N_CALLBACK_SECRET;

    if (secret !== expectedSecret) {
        console.error('[Batch Video Gen] Authentication failed');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        console.log('[Batch Video Gen] Received batch:', JSON.stringify(body, null, 2));

        const { parent_job_id, total_videos, payloads } = body;

        if (!parent_job_id || !payloads || !Array.isArray(payloads)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Determine how many videos to process
        const videosToProcess = MAX_VIDEOS_TO_GENERATE === -1
            ? payloads.length
            : Math.min(MAX_VIDEOS_TO_GENERATE, payloads.length);

        console.log(`[Batch Video Gen] Total videos: ${payloads.length}, Processing: ${videosToProcess} (MAX_VIDEOS_TO_GENERATE=${MAX_VIDEOS_TO_GENERATE})`);

        // Update job status to 'generating'
        const { error: updateError } = await supabase
            .from('ad_jobs')
            .update({ status: 'generating' })
            .eq('job_id', parent_job_id);

        if (updateError) {
            console.error(`[Batch Video Gen] Failed to update job status:`, updateError);
        }

        // Process only the specified number of videos
        const selectedPayloads = payloads.slice(0, videosToProcess);

        selectedPayloads.forEach((payload, index) => {
            const metadata = payload.n8n_metadata || {};

            // Mark the LAST video in our selection as the final one
            if (index === selectedPayloads.length - 1) {
                metadata.is_last_video = true;
            }

            console.log(`[Batch Video Gen] Starting video ${index + 1}/${videosToProcess}:`, {
                variant_job_id: metadata.variant_job_id,
                angle_name: metadata.angle_name,
                is_last: metadata.is_last_video
            });

            // Generate video asynchronously
            generateSingleVideo(parent_job_id, payload).catch(err => {
                console.error(`[Batch Video Gen] Video ${index + 1} failed:`, err);
            });
        });

        return NextResponse.json({
            success: true,
            message: `Started generation for ${videosToProcess} of ${payloads.length} videos`,
            job_id: parent_job_id
        });

    } catch (error) {
        console.error('[Batch Video Gen] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function generateSingleVideo(parentJobId: string, payload: any) {
    const metadata = payload.n8n_metadata || {};
    const variantJobId = metadata.variant_job_id || parentJobId;

    console.log(`[Video Gen ${variantJobId}] Starting Comet API request...`);

    try {
        // 1. Call Comet API to generate video using FormData
        // Cap at 12 seconds max (even though sora-2-pro supports 15)
        const requestedSeconds = payload.seconds || 15;
        const cappedSeconds = Math.min(requestedSeconds, 12);

        const formData = new FormData();
        formData.append('prompt', payload.prompt || '');
        formData.append('model', 'sora-2-pro');
        formData.append('seconds', String(cappedSeconds));
        formData.append('size', payload.size || '720x1280');

        console.log(`[Video Gen ${variantJobId}] Calling Comet API...`);
        console.log(`[Video Gen ${variantJobId}] URL: ${COMET_API_URL}/videos`);
        console.log(`[Video Gen ${variantJobId}] Model: sora-2-pro, Seconds: ${cappedSeconds} (requested: ${requestedSeconds})`);

        const generateRes = await fetch(`${COMET_API_URL}/videos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COMET_API_KEY}`,
            },
            body: formData,
        });

        if (!generateRes.ok) {
            const errorText = await generateRes.text();
            throw new Error(`Comet API failed: ${generateRes.status} - ${errorText}`);
        }

        const genData = await generateRes.json();
        const videoId = genData.id;

        if (!videoId) {
            throw new Error('No video ID returned from Comet API');
        }

        console.log(`[Video Gen ${variantJobId}] Generation started. Video ID: ${videoId}`);

        // 2. Poll for video completion (up to 10 minutes)
        let videoUrl: string | null = null;
        let attempts = 0;
        const maxAttempts = 150; // 120 * 5s = 600s = 10 minutes

        while (attempts < maxAttempts && !videoUrl) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
            attempts++;

            console.log(`[Video Gen ${variantJobId}] Polling attempt ${attempts}/${maxAttempts}...`);

            const contentRes = await fetch(`${COMET_API_URL}/videos/${videoId}/content`, {
                headers: {
                    'Authorization': `Bearer ${COMET_API_KEY}`,
                },
            });

            console.log(`[Video Gen ${variantJobId}] Poll response status: ${contentRes.status}`);
            const contentType = contentRes.headers.get('content-type') || '';
            console.log(`[Video Gen ${variantJobId}] Content-Type: ${contentType}`);

            if (contentRes.ok) {
                // Check if response is a video file (binary) or JSON
                if (contentType.includes('video/') || contentType.includes('application/octet-stream')) {
                    // The response is the actual video file - use the content URL directly
                    videoUrl = `${COMET_API_URL}/videos/${videoId}/content`;
                    console.log(`[Video Gen ${variantJobId}] ✓ Video ready! (binary response - using content endpoint)`, videoUrl);
                    break;
                } else if (contentType.includes('application/json')) {
                    // The response contains JSON metadata
                    const contentData = await contentRes.json();
                    console.log(`[Video Gen ${variantJobId}] Full response object:`, JSON.stringify(contentData, null, 2));

                    videoUrl = contentData.url || contentData.content_url || contentData.video_url;

                    console.log(`[Video Gen ${variantJobId}] Extracted URL: ${videoUrl || 'NOT FOUND'}`);
                    console.log(`[Video Gen ${variantJobId}] Available fields:`, Object.keys(contentData));

                    if (videoUrl) {
                        console.log(`[Video Gen ${variantJobId}] ✓ Video ready!`, videoUrl);
                        break;
                    }
                } else {
                    console.log(`[Video Gen ${variantJobId}] Unexpected content type: ${contentType}`);
                }
            } else {
                const errorText = await contentRes.text();
                console.log(`[Video Gen ${variantJobId}] Poll failed with status ${contentRes.status}:`, errorText);
            }
        }

        if (!videoUrl) {
            throw new Error('Video generation timed out after 2 minutes');
        }

        // 3. Update Supabase with the new video
        const { data: existingJob, error: fetchError } = await supabase
            .from('ad_jobs')
            .select('payload, status')
            .eq('job_id', parentJobId)
            .single();

        if (fetchError) {
            throw new Error(`Failed to fetch job: ${fetchError.message}`);
        }

        const currentPayload = existingJob?.payload || {};
        const mediaOutputs = currentPayload.media_outputs || [];

        mediaOutputs.push({
            id: crypto.randomUUID(),
            type: 'video',
            url: videoUrl,
            angle_id: metadata.angle_id || mediaOutputs.length + 1,
            angle_name: metadata.angle_name || `Variation ${mediaOutputs.length + 1}`,
            prompt: payload.prompt || '',
            duration: `${payload.seconds || 15}s`,
            variant: metadata.variant_job_id?.split('_VARIATION_')[1] || variantJobId,
            created_at: new Date().toISOString()
        });

        console.log(`[Video Gen ${variantJobId}] Added to media_outputs (total: ${mediaOutputs.length})`);

        // 4. Determine if this is the last video
        const isLastVideo = metadata.is_last_video || false;
        const newStatus = isLastVideo ? 'completed' : existingJob.status;

        const { error: updateError } = await supabase
            .from('ad_jobs')
            .update({
                status: newStatus,
                payload: {
                    ...currentPayload,
                    media_outputs: mediaOutputs
                },
                ...(isLastVideo ? { completed_at: new Date().toISOString() } : {})
            })
            .eq('job_id', parentJobId);

        if (updateError) {
            throw new Error(`Failed to update job: ${updateError.message}`);
        }

        console.log(`[Video Gen ${variantJobId}] ✓ Complete! Status: ${newStatus}, Total videos: ${mediaOutputs.length}`);

    } catch (error) {
        console.error(`[Video Gen ${variantJobId}] Failed:`, error);

        // Mark job as failed if this was critical
        const { error: failError } = await supabase
            .from('ad_jobs')
            .update({ status: 'failed' })
            .eq('job_id', parentJobId);

        if (failError) {
            console.error(`[Video Gen ${variantJobId}] Failed to mark job as failed:`, failError);
        }
    }
}
