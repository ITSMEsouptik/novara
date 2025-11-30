import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

        const { error } = await supabase
            .from('ad_jobs')
            .update({
                status: 'completed',
                video_url: video_url || null,
                completed_at: new Date().toISOString(),
                n8n_raw: rest,
            })
            .eq('job_id', job_id);

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
