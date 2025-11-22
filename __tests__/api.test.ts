import { POST as submitPost } from '@/app/api/submit/route';
import { POST as callbackPost } from '@/app/api/n8n/callback/route';
import { NextRequest } from 'next/server';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            insert: jest.fn(() => ({ error: null })),
            update: jest.fn(() => ({ eq: jest.fn(() => ({ error: null })) })),
        })),
    },
}));

// Mock fetch for n8n
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
) as jest.Mock;

describe('API Routes', () => {
    it('should submit a job', async () => {
        process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL = 'http://n8n.com/webhook';
        const formData = new FormData();
        formData.append('Website ', 'https://example.com');

        const req = new NextRequest('http://localhost:3000/api/submit', {
            method: 'POST',
            body: formData,
        });

        const res = await submitPost(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toHaveProperty('job_id');
    });

    it('should handle n8n callback', async () => {
        process.env.N8N_CALLBACK_SECRET = 'secret';
        const body = JSON.stringify({ job_id: '123', video_url: 'http://video.mp4' });

        const req = new NextRequest('http://localhost:3000/api/n8n/callback', {
            method: 'POST',
            body: body,
            headers: {
                'x-n8n-secret': 'secret',
            },
        });

        const res = await callbackPost(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
    });
});
