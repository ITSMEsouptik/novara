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
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
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
