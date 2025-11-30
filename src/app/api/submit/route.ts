import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createTablesIfNeeded } from '@/lib/db-setup';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
// import fetch from 'node-fetch'; // Removed, using global fetch

export async function POST(request: NextRequest) {
    try {
        console.log('[Submit API] Request received');

        // Ensure database tables exist (creates them if needed)
        await createTablesIfNeeded();

        const formData = await request.formData();

        // Generate Job ID first (we need it for image storage)
        const jobId = crypto.randomUUID();
        console.log(`[Submit API] Generated job_id: ${jobId}`);

        // Extract fields for Supabase and save images
        const payload: Record<string, any> = {};
        const imageUrls: string[] = [];
        let imageIndex = 0;

        // Create directory for uploaded images if there are any files
        const uploadDir = path.join(process.cwd(), 'public', 'uploaded_images', jobId);
        let dirCreated = false;

        for (const [key, value] of formData.entries()) {
            if (typeof value === 'string') {
                payload[key] = value;
            } else if (value instanceof File) {
                // It's a file - save it to disk
                console.log(`[Submit API] Processing uploaded file: ${value.name} (${value.size} bytes)`);

                // Create directory on first file
                if (!dirCreated) {
                    try {
                        if (!fs.existsSync(uploadDir)) {
                            console.log(`[Submit API] Creating directory: ${uploadDir}`);
                            fs.mkdirSync(uploadDir, { recursive: true });
                        }
                        dirCreated = true;
                    } catch (mkdirError) {
                        console.error(`[Submit API] Failed to create directory:`, mkdirError);
                        return NextResponse.json({ error: 'Failed to save uploaded images' }, { status: 500 });
                    }
                }

                // Save file to disk
                const fileExtension = path.extname(value.name) || '.jpg';
                const fileName = `image_${imageIndex}${fileExtension}`;
                const filePath = path.join(uploadDir, fileName);

                try {
                    const buffer = Buffer.from(await value.arrayBuffer());
                    fs.writeFileSync(filePath, buffer);

                    // Generate public URL (relative path - works in any environment)
                    const publicUrl = `/uploaded_images/${jobId}/${fileName}`;
                    imageUrls.push(publicUrl);

                    console.log(`[Submit API] Saved image to: ${filePath}`);
                    console.log(`[Submit API] Public URL: ${publicUrl}`);

                    imageIndex++;
                } catch (writeError) {
                    console.error(`[Submit API] Failed to save file ${value.name}:`, writeError);
                    // Continue processing other files instead of failing completely
                    console.log(`[Submit API] Skipping file ${value.name} due to error`);
                }
            }
        }

        // Process Image URLs if provided
        const imageUrlsField = formData.get('Image URLs');
        if (imageUrlsField && typeof imageUrlsField === 'string') {
            const urls = imageUrlsField
                .split('\n')
                .map(url => url.trim())
                .filter(url => url.length > 0 && url.startsWith('http'));

            console.log(`[Submit API] Found ${urls.length} image URL(s) to download`);

            if (urls.length > 0) {
                // Create directory if not already created
                if (!dirCreated) {
                    try {
                        if (!fs.existsSync(uploadDir)) {
                            console.log(`[Submit API] Creating directory: ${uploadDir}`);
                            fs.mkdirSync(uploadDir, { recursive: true });
                        }
                        dirCreated = true;
                    } catch (mkdirError) {
                        console.error(`[Submit API] Failed to create directory:`, mkdirError);
                        return NextResponse.json({ error: 'Failed to save images' }, { status: 500 });
                    }
                }

                // Download each image
                for (const url of urls) {
                    try {
                        console.log(`[Submit API] Downloading image from: ${url}`);
                        const imageRes = await fetch(url);

                        if (!imageRes.ok) {
                            console.warn(`[Submit API] Failed to download ${url}: ${imageRes.status}`);
                            continue; // Skip this URL
                        }

                        const buffer = Buffer.from(await imageRes.arrayBuffer());

                        // Determine file extension from URL or content-type
                        let fileExtension = '.jpg';
                        const urlExt = path.extname(new URL(url).pathname);
                        if (urlExt && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(urlExt.toLowerCase())) {
                            fileExtension = urlExt;
                        } else {
                            const contentType = imageRes.headers.get('content-type');
                            if (contentType?.includes('png')) fileExtension = '.png';
                            else if (contentType?.includes('webp')) fileExtension = '.webp';
                            else if (contentType?.includes('gif')) fileExtension = '.gif';
                        }

                        const fileName = `image_${imageIndex}${fileExtension}`;
                        const filePath = path.join(uploadDir, fileName);

                        fs.writeFileSync(filePath, buffer);

                        // Generate public URL (relative path)
                        const publicUrl = `/uploaded_images/${jobId}/${fileName}`;
                        imageUrls.push(publicUrl);

                        console.log(`[Submit API] Downloaded and saved image from URL to: ${filePath}`);
                        console.log(`[Submit API] Public URL: ${publicUrl}`);

                        imageIndex++;
                    } catch (downloadError) {
                        console.error(`[Submit API] Failed to download image from ${url}:`, downloadError);
                        // Continue with other URLs
                    }
                }
            }
        }

        // Add image URLs to payload
        if (imageUrls.length > 0) {
            payload.image_urls = imageUrls;
            console.log(`[Submit API] Stored ${imageUrls.length} image URL(s) in payload`);
        } else {
            console.log(`[Submit API] No images uploaded or downloaded`);
        }

        // Insert into Supabase
        console.log(`[Submit API] Inserting job into Supabase...`);
        const { error: dbError } = await supabase
            .from('ad_jobs')
            .insert({
                job_id: jobId,
                status: 'submitted',
                payload: payload,
            });

        if (dbError) {
            console.error('[Submit API] Supabase error:', dbError);
            return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
        }

        console.log(`[Submit API] Job ${jobId} saved to Supabase successfully`);

        // Forward to n8n
        console.log(`[Submit API] Forwarding to n8n webhook...`);
        const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
        if (!n8nUrl) {
            console.error('[Submit API] Missing N8N_WEBHOOK_URL');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Build JSON payload for n8n (much simpler than FormData)
        const n8nPayload: Record<string, any> = {
            job_id: jobId,
            ...payload // Includes all form fields
        };

        // Send to n8n as JSON
        try {
            console.log(`[Submit API] Sending to n8n: ${n8nUrl}`);

            const response = await fetch(n8nUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(n8nPayload),
            });

            if (!response.ok) {
                console.error(`[Submit API] n8n responded with status: ${response.status}`);
                const errorText = await response.text().catch(() => 'Unable to read error');
                console.error(`[Submit API] n8n error response: ${errorText}`);
            } else {
                console.log(`[Submit API] Successfully forwarded to n8n`);
            }
        } catch (n8nError) {
            console.error('[Submit API] n8n error:', n8nError);
            // We still return success to user because job is saved
        }

        console.log(`[Submit API] Returning job_id to client: ${jobId}`);
        return NextResponse.json({ job_id: jobId });

    } catch (error) {
        console.error('[Submit API] Submit error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
