import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function POST(request: NextRequest) {
    const secret = request.headers.get('x-n8n-secret');
    const expectedSecret = process.env.N8N_CALLBACK_SECRET;

    if (secret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { job_id, video_url, ...rest } = body as { job_id: string; video_url?: string; [key: string]: unknown };

        if (!job_id) {
            return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });
        }

        try {
            await storage.updateJob(job_id, {
                status: 'completed',
                video_url: video_url || undefined,
                completed_at: new Date().toISOString(),
                n8n_raw: rest,
            });
        } catch (error) {
            console.error('Storage update error:', error);
            return NextResponse.json(
                { error: 'Failed to update job', details: error instanceof Error ? error.message : String(error) },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
