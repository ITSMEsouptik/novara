import { test, expect } from '@playwright/test';

test('create job flow', async ({ page }) => {
    // Mock the API submit endpoint
    await page.route('/api/submit', async route => {
        await route.fulfill({ json: { job_id: 'test-job-123' } });
    });

    // Mock the status endpoint
    await page.route('/api/status?job_id=test-job-123', async route => {
        await route.fulfill({
            json: {
                job_id: 'test-job-123',
                status: 'completed',
                video_url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                created_at: new Date().toISOString()
            }
        });
    });

    await page.goto('http://localhost:3000/create');

    // Fill form
    await page.fill('input[placeholder="https://example.com"]', 'https://example.com');
    await page.fill('input[placeholder="https://example.com/product"]', 'https://example.com/product');
    await page.fill('textarea[placeholder="Describe your product..."]', 'Great product');
    await page.fill('textarea[placeholder="What is the main message?"]', 'Buy now');
    await page.fill('input[placeholder="e.g. Busy moms, Tech enthusiasts"]', 'Everyone');
    await page.fill('input[placeholder="e.g. Not enough time"]', 'Boredom');
    await page.fill('input[placeholder="e.g. Brand Awareness, Conversions"]', 'Sales');

    // Submit
    await page.click('button[type="submit"]');

    // Expect redirect
    await expect(page).toHaveURL(/\/jobs\/test-job-123/);

    // Expect video to appear
    await expect(page.locator('video')).toBeVisible();
    await expect(page.getByText('Campaign #test-job')).toBeVisible();
});
