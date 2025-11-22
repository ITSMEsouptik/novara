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
