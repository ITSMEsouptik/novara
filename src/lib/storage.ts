import { promises as fs } from 'fs';
import path from 'path';

/**
 * Job data structure matching Supabase schema
 */
export interface Job {
    job_id: string;
    status: 'submitted' | 'processing' | 'generating' | 'completed' | 'failed';
    created_at: string;
    completed_at?: string;
    video_url?: string;
    payload?: Record<string, unknown>;
    n8n_raw?: Record<string, unknown>;
}

/**
 * Storage interface for job operations
 */
export interface Storage {
    createJob(job: Job): Promise<void>;
    getJob(jobId: string): Promise<Job | null>;
    updateJob(jobId: string, updates: Partial<Job>): Promise<void>;
}

/**
 * File-based storage implementation
 */
class FileStorage implements Storage {
    private jobsDir: string;

    constructor() {
        this.jobsDir = path.join(process.cwd(), 'data', 'jobs');
    }

    private async ensureDirectory(): Promise<void> {
        try {
            await fs.mkdir(this.jobsDir, { recursive: true });
        } catch {
            // Directory might already exist, which is fine
        }
    }

    private getJobFilePath(jobId: string): string {
        return path.join(this.jobsDir, `${jobId}.json`);
    }

    async createJob(job: Job): Promise<void> {
        await this.ensureDirectory();
        const filePath = this.getJobFilePath(job.job_id);
        await fs.writeFile(filePath, JSON.stringify(job, null, 2), 'utf-8');
    }

    async getJob(jobId: string): Promise<Job | null> {
        await this.ensureDirectory();
        const filePath = this.getJobFilePath(jobId);
        
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content) as Job;
        } catch (error) {
            // File doesn't exist
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }

    async updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
        await this.ensureDirectory();
        const filePath = this.getJobFilePath(jobId);
        
        // Read existing job
        const existing = await this.getJob(jobId);
        if (!existing) {
            throw new Error(`Job ${jobId} not found`);
        }

        // Merge updates
        const updated: Job = {
            ...existing,
            ...updates,
            // Ensure payload is merged properly if it exists in updates
            payload: updates.payload !== undefined 
                ? { ...existing.payload, ...updates.payload }
                : existing.payload,
        };

        // Write updated job
        await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    }
}

/**
 * Supabase storage implementation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientType = any;

class SupabaseStorage implements Storage {
    private supabase: SupabaseClientType;

    constructor() {
        // Lazy import to avoid errors if Supabase is not configured
        // Only import when SupabaseStorage is actually instantiated
        try {
            // Dynamically import supabase module
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const supabaseModule = require('./supabase') as { supabase: SupabaseClientType };
            this.supabase = supabaseModule.supabase;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize Supabase storage: ${errorMessage}`);
        }
    }

    async createJob(job: Job): Promise<void> {
        const { error } = await this.supabase
            .from('ad_jobs')
            .insert({
                job_id: job.job_id,
                status: job.status,
                created_at: job.created_at,
                completed_at: job.completed_at || null,
                video_url: job.video_url || null,
                payload: job.payload || null,
                n8n_raw: job.n8n_raw || null,
            });

        if (error) {
            throw new Error(`Failed to create job in Supabase: ${error.message}`);
        }
    }

    async getJob(jobId: string): Promise<Job | null> {
        const { data, error } = await this.supabase
            .from('ad_jobs')
            .select('job_id, status, created_at, completed_at, video_url, payload, n8n_raw')
            .eq('job_id', jobId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Not found
                return null;
            }
            throw new Error(`Failed to get job from Supabase: ${error.message}`);
        }

        return data as Job;
    }

    async updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
        // For Supabase, we need to handle payload merging specially
        const updateData: Record<string, unknown> = { ...updates };
        
        // If payload is being updated, we need to merge it with existing payload
        if (updates.payload !== undefined) {
            const existing = await this.getJob(jobId);
            if (existing && existing.payload) {
                updateData.payload = { ...existing.payload, ...updates.payload };
            }
        }

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const { error } = await this.supabase
            .from('ad_jobs')
            .update(updateData)
            .eq('job_id', jobId);

        if (error) {
            throw new Error(`Failed to update job in Supabase: ${error.message}`);
        }
    }
}

/**
 * Get the appropriate storage implementation based on environment
 */
function getStorage(): Storage {
    // Check if USE_SUPABASE is explicitly set to 'true'
    const useSupabaseExplicit = process.env.USE_SUPABASE === 'true';
    
    // Auto-detect Supabase: If Supabase env vars are present and we're in production,
    // automatically use Supabase storage (for Cloud Run's ephemeral filesystem)
    const hasSupabaseVars = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Use Supabase if explicitly enabled OR if Supabase vars are present in production
    const shouldUseSupabase = useSupabaseExplicit || (hasSupabaseVars && isProduction);
    
    if (!shouldUseSupabase) {
        if (isProduction && !hasSupabaseVars) {
            console.warn('[Storage] ⚠️  Using file-based storage in production (ephemeral filesystem)');
            console.warn('[Storage] ⚠️  Jobs may be lost when containers restart. Set SUPABASE env vars to use persistent storage.');
        } else {
            console.log('[Storage] Using file-based storage');
        }
        return new FileStorage();
    }

    // Try to use Supabase
    try {
        if (useSupabaseExplicit) {
            console.log('[Storage] Using Supabase storage (USE_SUPABASE=true)');
        } else {
            console.log('[Storage] Using Supabase storage (auto-detected from env vars in production)');
        }
        return new SupabaseStorage();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('[Storage] Supabase not available, falling back to file storage:', errorMessage);
        if (isProduction) {
            console.warn('[Storage] ⚠️  File-based storage in production may cause jobs to be lost!');
        }
        return new FileStorage();
    }
}

// Export singleton instance
export const storage = getStorage();


