import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';

export async function POST(request: NextRequest) {
    try {
        const { job_id, media_ids } = await request.json();

        if (!job_id || !media_ids || !Array.isArray(media_ids) || media_ids.length === 0) {
            return NextResponse.json(
                { error: 'job_id and media_ids array required' },
                { status: 400 }
            );
        }

        // Fetch job from Supabase
        const { data: job, error: jobError } = await supabase
            .from('ad_jobs')
            .select('payload')
            .eq('job_id', job_id)
            .single();

        if (jobError || !job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        const mediaOutputs = job.payload?.media_outputs || [];

        // Filter selected media
        const selectedMedia = mediaOutputs.filter((m: { id: string }) => media_ids.includes(m.id));

        if (selectedMedia.length === 0) {
            return NextResponse.json(
                { error: 'No valid media found for selected IDs' },
                { status: 404 }
            );
        }

        // If only one file, return it directly
        if (selectedMedia.length === 1) {
            const media = selectedMedia[0];
            const filePath = path.join(process.cwd(), 'public', media.url);

            if (!fs.existsSync(filePath)) {
                return NextResponse.json(
                    { error: 'File not found' },
                    { status: 404 }
                );
            }

            const fileBuffer = fs.readFileSync(filePath);
            const ext = path.extname(media.url);
            const contentType = ext === '.mp4' ? 'video/mp4' : 'image/png';

            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${path.basename(media.url)}"`,
                },
            });
        }

        // Multiple files - create ZIP
        return new NextResponse(
            new ReadableStream({
                async start(controller) {
                    const archive = archiver('zip', {
                        zlib: { level: 9 }
                    });

                    archive.on('data', (chunk) => {
                        controller.enqueue(chunk);
                    });

                    archive.on('end', () => {
                        controller.close();
                    });

                    archive.on('error', (err) => {
                        console.error('Archive error:', err);
                        controller.error(err);
                    });

                    // Add each file to archive
                    for (const media of selectedMedia) {
                        const filePath = path.join(process.cwd(), 'public', media.url);

                        if (fs.existsSync(filePath)) {
                            const fileName = `${media.angle_name || 'media'}_${media.type}${media.placement ? '_' + media.placement : ''}${path.extname(media.url)}`;
                            archive.file(filePath, { name: fileName });
                        }
                    }

                    await archive.finalize();
                }
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename="campaign_${job_id.slice(0, 8)}.zip"`,
                },
            }
        );

    } catch (error) {
        console.error('[Download Selected] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to create download', details: errorMessage },
            { status: 500 }
        );
    }
}
