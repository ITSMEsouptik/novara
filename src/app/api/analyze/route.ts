import { NextRequest, NextResponse } from 'next/server';
import { performDeepAnalysis } from '@/lib/analysis-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobId, url, serviceArea, goal } = body;

        // Validate required fields
        if (!jobId || !url || !serviceArea || !goal) {
            return NextResponse.json(
                { error: 'Missing required fields: jobId, url, serviceArea, goal' },
                { status: 400 }
            );
        }

        // Trigger analysis asynchronously (fire and forget)
        // Don't await - return immediately
        performDeepAnalysis(jobId, url, serviceArea, goal).catch((error) => {
            console.error(`[Analyze API] Analysis failed for job ${jobId}:`, error);
            // Error is already logged in performDeepAnalysis, status updated in Supabase
        });

        // Return immediately without waiting for analysis to complete
        return NextResponse.json({
            success: true,
            jobId,
            message: 'Analysis started asynchronously',
        });
    } catch (error) {
        console.error('[Analyze API] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}


