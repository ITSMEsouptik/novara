import { callPerplexityAPI, generateDeepAnalysisPrompt, DeepAnalysisResponse } from './perplexity-client';
import { extractBrandAssets, ExtractedAssets } from './asset-extractor';
import { storage } from './storage';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

/**
 * Performs deep analysis combining Perplexity API and Puppeteer asset extraction
 */
export async function performDeepAnalysis(
    jobId: string,
    url: string,
    serviceArea: string,
    goal: string
): Promise<void> {
    console.log(`[Analysis ${jobId}] Starting deep analysis for ${url}`);

    // Update status to processing
    await updateAnalysisStatus(jobId, 'processing');

    let perplexityResult: DeepAnalysisResponse | null = null;
    let extractedAssets: ExtractedAssets | null = null;
    const errors: Record<string, string> = {};

    // Action A: Perplexity Deep Analysis (run in parallel with Puppeteer)
    const perplexityPromise = (async () => {
        try {
            console.log(`[Analysis ${jobId}] Starting Perplexity analysis...`);
            const prompt = generateDeepAnalysisPrompt(url, serviceArea, goal);
            perplexityResult = await callPerplexityAPI(prompt);
            console.log(`[Analysis ${jobId}] ✓ Perplexity analysis completed`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.perplexity = errorMessage;
            console.error(`[Analysis ${jobId}] ✗ Perplexity analysis failed:`, errorMessage);
        }
    })();

    // Action B: Puppeteer Asset Extraction (run in parallel with Perplexity)
    const puppeteerPromise = (async () => {
        try {
            console.log(`[Analysis ${jobId}] Starting Puppeteer asset extraction...`);
            extractedAssets = await extractBrandAssets(url, jobId);
            console.log(`[Analysis ${jobId}] ✓ Puppeteer extraction completed`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.puppeteer = errorMessage;
            console.error(`[Analysis ${jobId}] ✗ Puppeteer extraction failed:`, errorMessage);
        }
    })();

    // Wait for both to complete (or fail independently)
    await Promise.allSettled([perplexityPromise, puppeteerPromise]);

    // Determine final status
    const hasPerplexity = perplexityResult !== null;
    const hasPuppeteer = extractedAssets !== null;
    const hasPartialResults = hasPerplexity || hasPuppeteer;

    let finalStatus: 'completed' | 'partial' | 'failed';
    if (hasPerplexity && hasPuppeteer) {
        finalStatus = 'completed';
    } else if (hasPartialResults) {
        finalStatus = 'partial';
    } else {
        finalStatus = 'failed';
    }

    // Update job with analysis results
    await updateJobWithAnalysis(jobId, perplexityResult, extractedAssets, finalStatus, errors);

    // Send enriched data to n8n if we have results
    if (hasPartialResults || finalStatus === 'completed') {
        await sendEnrichedDataToN8n(jobId, url, serviceArea, goal, perplexityResult, extractedAssets);
    }

    console.log(`[Analysis ${jobId}] Analysis complete with status: ${finalStatus}`);
}

/**
 * Updates the job status using storage abstraction
 */
async function updateAnalysisStatus(jobId: string, status: 'pending' | 'processing' | 'completed' | 'partial' | 'failed'): Promise<void> {
    try {
        const existingJob = await storage.getJob(jobId);
        const currentPayload = existingJob?.payload || {};
        
        await storage.updateJob(jobId, {
            payload: {
                ...currentPayload,
                analysis_status: status,
            }
        });
    } catch (error) {
        console.error(`[Analysis ${jobId}] Error updating analysis status:`, error);
    }
}

/**
 * Updates the job with analysis results using storage abstraction
 */
async function updateJobWithAnalysis(
    jobId: string,
    analysisData: DeepAnalysisResponse | null,
    extractedAssets: ExtractedAssets | null,
    status: 'completed' | 'partial' | 'failed',
    errors: Record<string, string>
): Promise<void> {
    try {
        // Fetch existing job
        const existingJob = await storage.getJob(jobId);

        if (!existingJob) {
            throw new Error(`Job ${jobId} not found`);
        }

        const currentPayload = existingJob.payload || {};
        
        // Build updated payload
        const updatedPayload: Record<string, unknown> = {
            ...currentPayload,
            analysis_status: status,
        };

        if (analysisData) {
            updatedPayload.deep_analysis = {
                deep_brand_analysis: analysisData.deep_brand_analysis,
                psychographic_profile: analysisData.psychographic_profile,
                market_warfare: analysisData.market_warfare,
                offer_engineering: analysisData.offer_engineering,
            };
        }

        if (extractedAssets) {
            // Convert local paths to public URLs
            const productImageUrls = extractedAssets.product_images.map(img => ({
                url: img.url,
                alt: img.alt,
            }));

            updatedPayload.extracted_assets = {
                logo: extractedAssets.logo ? {
                    url: extractedAssets.logo.url,
                    format: extractedAssets.logo.format,
                } : undefined,
                product_images: productImageUrls,
                brand_colors: extractedAssets.brand_colors,
                font_family: extractedAssets.font_family,
                extracted_at: extractedAssets.extracted_at,
            };
        }

        if (Object.keys(errors).length > 0) {
            updatedPayload.analysis_errors = errors;
        }

        // Update job using storage abstraction
        await storage.updateJob(jobId, {
            payload: updatedPayload,
        });

        console.log(`[Analysis ${jobId}] ✓ Job updated with analysis results`);
    } catch (error) {
        console.error(`[Analysis ${jobId}] Error updating job with analysis:`, error);
        throw error;
    }
}

/**
 * Sends enriched data to n8n webhook
 */
async function sendEnrichedDataToN8n(
    jobId: string,
    url: string,
    serviceArea: string,
    goal: string,
    analysisData: DeepAnalysisResponse | null,
    extractedAssets: ExtractedAssets | null
): Promise<void> {
    if (!N8N_WEBHOOK_URL) {
        console.log(`[Analysis ${jobId}] No N8N_WEBHOOK_URL configured, skipping n8n webhook`);
        return;
    }

    try {
        console.log(`[Analysis ${jobId}] Sending enriched data to n8n...`);

        const formData = new FormData();

        // Add original form data
        formData.append('url', url);
        formData.append('service_area', serviceArea);
        formData.append('goal', goal);
        formData.append('job_id', jobId);

        // Add analysis data as JSON
        if (analysisData) {
            formData.append('deep_analysis', JSON.stringify({
                deep_brand_analysis: analysisData.deep_brand_analysis,
                psychographic_profile: analysisData.psychographic_profile,
                market_warfare: analysisData.market_warfare,
                offer_engineering: analysisData.offer_engineering,
            }));
        }

        // Add extracted assets metadata
        if (extractedAssets) {
            formData.append('extracted_assets', JSON.stringify({
                logo: extractedAssets.logo,
                product_images: extractedAssets.product_images,
                brand_colors: extractedAssets.brand_colors,
                font_family: extractedAssets.font_family,
            }));

            // Upload logo file if available
            if (extractedAssets.logo && extractedAssets.logo.localPath && fs.existsSync(extractedAssets.logo.localPath)) {
                const logoBuffer = fs.readFileSync(extractedAssets.logo.localPath);
                formData.append('logo_file', logoBuffer, {
                    filename: `logo.${extractedAssets.logo.format}`,
                    contentType: extractedAssets.logo.format === 'svg' ? 'image/svg+xml' : `image/${extractedAssets.logo.format}`,
                });
            }

            // Upload product images
            for (let i = 0; i < extractedAssets.product_images.length; i++) {
                const img = extractedAssets.product_images[i];
                if (img.localPath && fs.existsSync(img.localPath)) {
                    const imgBuffer = fs.readFileSync(img.localPath);
                    const ext = path.extname(img.localPath);
                    formData.append(`product_image_${i + 1}`, imgBuffer, {
                        filename: `product_${i + 1}${ext}`,
                        contentType: `image/${ext.slice(1)}`,
                    });
                }
            }
        }

        // Send to n8n
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formData as unknown as BodyInit,
            headers: formData.getHeaders() as Record<string, string>,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`n8n webhook failed: ${response.status} - ${errorText}`);
        }

        console.log(`[Analysis ${jobId}] ✓ Enriched data sent to n8n successfully`);
    } catch (error) {
        console.error(`[Analysis ${jobId}] Error sending enriched data to n8n:`, error);
        // Don't throw - we don't want to fail the entire analysis if n8n fails
    }
}


