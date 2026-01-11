import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('job_id');

    if (!jobId) {
        return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });
    }

    try {
        const job = await storage.getJob(jobId);

        if (!job) {
            console.error(`[Status API] Job ${jobId} not found in storage`);
            // Log storage type for debugging
            const storageType = process.env.USE_SUPABASE === 'true' ? 'Supabase' : 'File-based';
            console.error(`[Status API] Storage type: ${storageType}`);
            return NextResponse.json({ 
                error: 'Job not found',
                details: `Job ${jobId} was not found. This may happen if using file-based storage in Cloud Run (ephemeral filesystem). Consider using Supabase storage for production deployments.`
            }, { status: 404 });
        }

        return NextResponse.json(job);
    } catch (error) {
        console.error('Status fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
