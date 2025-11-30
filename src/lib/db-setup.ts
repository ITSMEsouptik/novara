/**
 * Database setup utility using direct PostgreSQL connection
 * This creates tables programmatically without needing the Supabase dashboard
 */

import { Pool } from 'pg';

let pool: Pool | null = null;
let tablesCreated = false;

function getPool() {
    if (!pool) {
        // Extract database connection details from Supabase URL
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceKey) {
            throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        }

        // Supabase provides a direct Postgres connection string
        // Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
        const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

        if (!connectionString) {
            console.warn('[DB Setup] DATABASE_URL not found. Table auto-creation disabled.');
            console.warn('[DB Setup] Add DATABASE_URL to .env.local for automatic table creation.');
            console.warn('[DB Setup] Get it from: Supabase Dashboard → Settings → Database → Connection String');
            return null;
        }

        pool = new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false // Supabase uses SSL
            }
        });
    }

    return pool;
}

export async function createTablesIfNeeded() {
    if (tablesCreated) {
        return true; // Already created in this process
    }

    const client = getPool();
    if (!client) {
        console.log('[DB Setup] Skipping automatic table creation (no DATABASE_URL)');
        return false;
    }

    try {
        console.log('[DB Setup] Connecting to PostgreSQL...');

        // Execute table creation SQL
        const sql = `
            CREATE TABLE IF NOT EXISTS ad_jobs (
                job_id TEXT PRIMARY KEY,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                status TEXT NOT NULL,
                payload JSONB,
                video_url TEXT,
                completed_at TIMESTAMP WITH TIME ZONE,
                n8n_raw JSONB
            );

            CREATE INDEX IF NOT EXISTS idx_ad_jobs_created_at ON ad_jobs(created_at);
        `;

        await client.query(sql);

        console.log('[DB Setup] ✓ Tables created/verified successfully');

        // Reload Supabase schema cache so PostgREST API can see the new table
        try {
            console.log('[DB Setup] Reloading Supabase schema cache...');
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (supabaseUrl && serviceKey) {
                const response = await fetch(`${supabaseUrl}/rest/v1/`, {
                    method: 'POST',
                    headers: {
                        'apikey': serviceKey,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json',
                        'Accept-Profile': 'public',
                        'Prefer': 'return=minimal'
                    }
                });

                // Also try the rpc method to reload schema
                await fetch(`${supabaseUrl}/rest/v1/rpc/pgrst_watch`, {
                    method: 'POST',
                    headers: {
                        'apikey': serviceKey,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json'
                    }
                }).catch(() => { }); // Ignore if this RPC doesn't exist

                console.log('[DB Setup] ✓ Schema cache reloaded');
            }
        } catch (reloadError) {
            console.log('[DB Setup] Could not reload schema cache automatically');
            console.log('[DB Setup] Please reload manually: Supabase Dashboard → Table Editor → Refresh');
        }

        tablesCreated = true;
        return true;
    } catch (error: any) {
        console.error('[DB Setup] Failed to create tables:', error.message);
        console.error('[DB Setup] Please verify your DATABASE_URL is correct');
        return false;
    }
}

// Graceful shutdown
export async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
