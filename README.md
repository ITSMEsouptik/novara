# Novara v2 - AI Video Ad Generator

A Next.js application that interfaces with n8n to generate video ads.

## Features
- **Job Creation**: Submit product details and images.
- **n8n Integration**: Forwards requests to n8n workflow for processing.
- **Real-time Status**: Polls for job completion.
- **Video Preview**: Watch and download the generated video.

## Setup

### Prerequisites
- Node.js 18+
- Supabase project
- n8n instance

### Environment Variables
Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_N8N_WEBHOOK_URL`: The URL of your n8n "On form submission" webhook.
- `N8N_CALLBACK_SECRET`: A secret string shared between this app and n8n.
- `SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_KEY`: Your Supabase anon key.

### Installation

```bash
pnpm install
```

### Database Setup
Run the SQL migration in your Supabase SQL Editor:
`supabase/schema.sql`

### Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000/create](http://localhost:3000/create) to start.

## n8n Integration Guide

To connect your n8n workflow to this app:

1. **Form Trigger**: Ensure your n8n workflow starts with a Webhook or Form Trigger that accepts the fields sent by this app (Website, Product Url, etc.).
2. **Callback Node**: Add an **HTTP Request** node at the end of your workflow to notify this app when the video is ready.

**Node Configuration:**
- **Method**: POST
- **URL**: `YOUR_PUBLIC_APP_URL/api/n8n/callback` (e.g., `https://your-app.vercel.app/api/n8n/callback` or use ngrok for local dev)
- **Headers**:
    - `Content-Type`: `application/json`
    - `x-n8n-secret`: `YOUR_SECRET_FROM_ENV`
- **Body**:
    ```json
    {
      "job_id": "={{ $json.job_id }}",
      "cir_id": "={{ $json.cir_id }}",
      "video_url": "={{ $json.output_video_url }}",
      "time_taken": "={{ $json.time_taken }}"
    }
    ```
    *Note: Adjust the expression `{{ $json.output_video_url }}` to match your actual workflow output key.*

## Deployment

Deploy to Vercel:
1. Push to GitHub.
2. Import project in Vercel.
3. Add Environment Variables in Vercel dashboard.
4. Deploy.
