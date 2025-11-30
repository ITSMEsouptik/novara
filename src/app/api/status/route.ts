import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('job_id');

    if (!jobId) {
        return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('ad_jobs')
        .select('job_id, status, video_url, created_at, completed_at')
        .eq('job_id', jobId)
        .single();

    if (error) {
        console.error('Status fetch error:', error);
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(data);
}
