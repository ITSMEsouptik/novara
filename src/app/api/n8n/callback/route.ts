import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    console.log('[N8N Callback] Request received at:', new Date().toISOString());

    const secret = request.headers.get('x-n8n-secret');
    const expectedSecret = process.env.N8N_CALLBACK_SECRET;

    console.log('[N8N Callback] Auth check - Secret present:', !!secret, 'Expected secret configured:', !!expectedSecret);

    if (secret !== expectedSecret) {
        console.error('[N8N Callback] Authentication failed - Invalid secret');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[N8N Callback] Authentication successful');

    try {
        const body = await request.json();
        console.log('[N8N Callback] Request body parsed:', JSON.stringify(body, null, 2));

        let { job_id, video_url, status, parent_job_id, variant_info, ...rest } = body;

        // Handle variant job IDs from prompt_optimization workflow
        // Extract parent job_id from variant format: "parent_job_id_VARIATION_A"
        if (!parent_job_id && job_id && job_id.includes('_VARIATION_')) {
            parent_job_id = job_id.split('_VARIATION_')[0];
            variant_info = job_id.split('_VARIATION_')[1] || 'A';
            console.log('[N8N Callback] Extracted parent_job_id:', parent_job_id, 'variant:', variant_info);
        }

        // Use parent_job_id for database lookups
        const dbJobId = parent_job_id || job_id;

        console.log('[N8N Callback] Extracted fields - job_id:', job_id, 'dbJobId:', dbJobId, 'status:', status, 'video_url:', video_url);

        if (!dbJobId) {
            console.error('[N8N Callback] Missing job_id in request body');
            return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });
        }

        // Handle video completion from Comet API (multiple videos scenario)
        if (status === 'completed' && video_url) {
            console.log(`[N8N Callback] Video completed - dbJobId: ${dbJobId}, variant: ${variant_info || 'unknown'}`);

            // 1. Fetch existing job to get current media_outputs
            const { data: existingJob, error: fetchError } = await supabase
                .from('ad_jobs')
                .select('payload, status')
                .eq('job_id', dbJobId)
                .single();

            if (fetchError) {
                console.error(`[N8N Callback] Error fetching job ${dbJobId}:`, fetchError);
                return NextResponse.json({ error: 'Job not found' }, { status: 404 });
            }

            console.log(`[N8N Callback] Found job ${dbJobId}, current status: ${existingJob.status}`);

            // 2. Append to media_outputs array
            const currentPayload = existingJob?.payload || {};
            const mediaOutputs = currentPayload.media_outputs || [];

            const newVideoOutput = {
                id: crypto.randomUUID(),
                type: 'video' as const,
                url: video_url,
                angle_id: rest.angle_id || mediaOutputs.length + 1,
                angle_name: rest.angle_name || variant_info || `Variation ${mediaOutputs.length + 1}`,
                prompt: rest.prompt || '',
                duration: rest.duration || `${rest.seconds || 15}s`,
                variant: variant_info || job_id,
                created_at: new Date().toISOString()
            };

            mediaOutputs.push(newVideoOutput);
            console.log(`[N8N Callback] Added video to media_outputs array (total: ${mediaOutputs.length})`);

            // 3. Update job with new media output
            // Only mark as 'completed' if this is explicitly the last video (workflow should tell us)
            // For now, keep status as 'processing' or 'generating' until all videos are done
            const newStatus = rest.is_last_video ? 'completed' : (existingJob.status === 'submitted' ? 'processing' : existingJob.status);

            const { error: updateError } = await supabase
                .from('ad_jobs')
                .update({
                    status: newStatus,
                    payload: {
                        ...currentPayload,
                        media_outputs: mediaOutputs
                    },
                    ...(rest.is_last_video ? { completed_at: new Date().toISOString() } : {})
                })
                .eq('job_id', dbJobId);

            if (updateError) {
                console.error(`[N8N Callback] Error updating job ${dbJobId}:`, updateError);
                return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
            }

            console.log(`[N8N Callback] Job ${dbJobId} updated successfully. Status: ${newStatus}, Total videos: ${mediaOutputs.length}`);
            return NextResponse.json({ success: true, video_count: mediaOutputs.length });
        }

        // If n8n says "payload_ready", it means we need to generate the video here (not used in prompt_optimization)
        if (status === 'payload_ready') {
            console.log(`[N8N Callback] Video payload_ready branch - job_id: ${dbJobId}`);

            const { error: updateError } = await supabase
                .from('ad_jobs')
                .update({
                    status: 'generating',
                    n8n_raw: rest,
                })
                .eq('job_id', dbJobId);

            if (updateError) {
                console.error(`[N8N Callback] Supabase update error for ${dbJobId}:`, updateError);
                return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 });
            }

            const { generateVideo } = await import('@/lib/video-generation');
            const payload = {
                prompt: rest.prompt,
                seconds: rest.n_frames ? parseInt(rest.n_frames) : 5,
                angle_id: rest.angle_id,
                angle_name: rest.angle_name || variant_info,
            };

            generateVideo(dbJobId, payload).catch(err => {
                console.error(`[N8N Callback] Background generation failed for ${dbJobId}:`, err);
            });

            return NextResponse.json({ success: true, message: 'Generation started' });
        }

        // Default behavior: old single-video workflow
        console.log(`[N8N Callback] Default completion branch - job_id: ${dbJobId}, status: ${status}`);

        const { error } = await supabase
            .from('ad_jobs')
            .update({
                status: 'completed',
                video_url: video_url || null,
                completed_at: new Date().toISOString(),
                n8n_raw: rest,
            })
            .eq('job_id', dbJobId);

        if (error) {
            console.error(`[N8N Callback] Supabase update error for ${dbJobId}:`, error);
            return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
        }

        console.log(`[N8N Callback] Job ${dbJobId} marked as completed successfully`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[N8N Callback] Unhandled error in callback route:', error);
        console.error('[N8N Callback] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
