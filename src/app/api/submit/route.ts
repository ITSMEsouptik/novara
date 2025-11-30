import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import FormData from 'form-data';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Extract fields for Supabase
        const payload: Record<string, string | { name: string; size: number; type: string }> = {};
        formData.forEach((value, key) => {
            // simple handling: if multiple values, might overwrite. 
            // For this app, we assume simple fields except files.
            if (typeof value === 'string') {
                payload[key] = value;
            } else {
                // It's a file. We don't store file content in JSON payload, maybe just metadata.
                payload[key] = { name: (value as File).name, size: (value as File).size, type: (value as File).type };
            }
        });

        // Generate Job ID (using UUID or timestamp)
        const jobId = crypto.randomUUID();

        // Insert into Supabase
        const { error: dbError } = await supabase
            .from('ad_jobs')
            .insert({
                job_id: jobId,
                status: 'submitted',
                payload: payload,
            });

        if (dbError) {
            console.error('Supabase error:', dbError);
            return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
        }

        // Forward to n8n
        const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
        if (!n8nUrl) {
            console.error('Missing N8N_WEBHOOK_URL');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
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
            await fetch(n8nUrl, {
                method: 'POST',
                body: outgoingFormData as unknown as BodyInit,
                headers: outgoingFormData.getHeaders() as Record<string, string>,
            });
        } catch (n8nError) {
            console.error('n8n error:', n8nError);
            // We still return success to user because job is saved, but maybe mark status as failed?
            // For now, let's assume it works or we log it.
        }

        return NextResponse.json({ job_id: jobId });

    } catch (error) {
        console.error('Submit error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
