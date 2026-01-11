import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import FormData from 'form-data';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Extract fields for Supabase
        const payload: Record<string, string | { name: string; size: number; type: string } | Array<{ name: string; size: number; type: string }>> = {};
        const uploadedAssets: Array<{ name: string; size: number; type: string }> = [];
        
        formData.forEach((value, key) => {
            if (typeof value === 'string') {
                payload[key] = value;
            } else if (value instanceof File) {
                // Handle file metadata
                const fileMeta = { name: value.name, size: value.size, type: value.type };
                if (key === 'uploaded_assets') {
                    // Collect multiple files as an array
                    uploadedAssets.push(fileMeta);
                } else {
                    payload[key] = fileMeta;
                }
            }
        });
        
        // Add uploaded assets array to payload if any files were uploaded
        if (uploadedAssets.length > 0) {
            payload.uploaded_assets = uploadedAssets;
        }

        // Add analysis status to payload
        payload.analysis_status = 'pending';

        // Generate Job ID (using UUID or timestamp)
        const jobId = crypto.randomUUID();

        // Create job using storage abstraction
        try {
            await storage.createJob({
                job_id: jobId,
                status: 'submitted',
                created_at: new Date().toISOString(),
                payload: payload,
            });
        } catch (error) {
            console.error('Storage error:', error);
            return NextResponse.json(
                { error: 'Failed to create job', details: error instanceof Error ? error.message : String(error) },
                { status: 500 }
            );
        }

        // Forward to n8n
        const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
        if (!n8nUrl || n8nUrl.trim() === '') {
            console.error('Missing NEXT_PUBLIC_N8N_WEBHOOK_URL - value:', n8nUrl);
            return NextResponse.json({ 
                error: 'Server configuration error', 
                details: 'NEXT_PUBLIC_N8N_WEBHOOK_URL is missing or empty. This variable must be set during Docker build. Please check GitHub Secrets and redeploy.' 
            }, { status: 500 });
        }

        // Construct new FormData for n8n
        // We need to iterate the incoming FormData and append to the outgoing node-form-data
        // Note: request.formData() returns Web API FormData. 
        // 'form-data' package is Node.js stream-based.
        // We can just use the native fetch with the Web FormData if Next.js supports it fully in Node env, 
        // but passing file streams might be tricky.
        // Let's try constructing a standard Request body.

        // Actually, since we are in Node env (App Router), we might need to convert Web File to Buffer/Stream for 'form-data' package
        // OR just use the incoming formData directly if we can pass it to fetch?
        // Standard fetch supports FormData.

        const outgoingFormData = new FormData();
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                const buffer = Buffer.from(await value.arrayBuffer());
                outgoingFormData.append(key, buffer, { filename: value.name, contentType: value.type });
            } else {
                outgoingFormData.append(key, value);
            }
        }

        // Add job_id to the payload sent to n8n so it knows what to callback with
        outgoingFormData.append('job_id', jobId);

        // Send to n8n (fire and forget? or wait?)
        // We wait to ensure it's received.
        try {
            // We use 'form-data' package headers
            const n8nResponse = await fetch(n8nUrl, {
                method: 'POST',
                body: outgoingFormData as unknown as BodyInit,
                headers: outgoingFormData.getHeaders() as Record<string, string>,
            });
            
            if (!n8nResponse.ok) {
                const errorText = await n8nResponse.text().catch(() => 'Unknown error');
                console.error(`n8n error: ${n8nResponse.status} - ${errorText}`);
                // We still return success to user because job is saved, but log the error
            }
        } catch (n8nError) {
            console.error('n8n network error:', n8nError);
            // We still return success to user because job is saved, but log the error
        }

        // Trigger async analysis (fire and forget - don't await)
        // Extract form data for analysis
        const url = payload.url as string;
        const serviceArea = payload.service_area as string;
        const goal = payload.goal as string;

        if (url && serviceArea && goal) {
            // Use internal API call or direct function call for better reliability
            // In server-side Next.js, we can import directly
            (async () => {
                try {
                    const { performDeepAnalysis } = await import('@/lib/analysis-service');
                    await performDeepAnalysis(jobId, url, serviceArea, goal);
                } catch (error) {
                    console.error(`[Submit] Failed to trigger analysis for job ${jobId}:`, error);
                    // Update status to failed if analysis couldn't start
                    try {
                        const existingJob = await storage.getJob(jobId);
                        const currentPayload = existingJob?.payload || payload;
                        await storage.updateJob(jobId, {
                            payload: {
                                ...currentPayload,
                                analysis_status: 'failed',
                                analysis_errors: { startup: error instanceof Error ? error.message : String(error) },
                            }
                        });
                    } catch (updateError) {
                        console.error(`[Submit] Failed to update error status for job ${jobId}:`, updateError);
                    }
                }
            })();
        }

        return NextResponse.json({ job_id: jobId });

    } catch (error) {
        console.error('Submit error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
