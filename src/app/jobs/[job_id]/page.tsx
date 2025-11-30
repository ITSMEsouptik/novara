'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

type JobStatus = 'submitted' | 'processing' | 'completed' | 'failed';

interface JobData {
    job_id: string;
    status: JobStatus;
    video_url?: string;
    created_at: string;
    completed_at?: string;
}

export default function JobPage() {
    const params = useParams();
    const jobId = params.job_id as string;
    const [job, setJob] = useState<JobData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [polling, setPolling] = useState(true);

    useEffect(() => {
        if (!jobId) return;

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/status?job_id=${jobId}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Job not found');
                    throw new Error('Failed to fetch status');
                }
                const data: JobData = await res.json();
                setJob(data);

                if (data.status === 'completed' || data.status === 'failed') {
                    setPolling(false);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch status';
                setError(errorMessage);
                setPolling(false);
            }
        };

        fetchStatus(); // Initial fetch

        const interval = setInterval(() => {
            if (polling) fetchStatus();
        }, 3000);

        return () => clearInterval(interval);
    }, [jobId, polling]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/create" className="text-blue-600 hover:underline font-medium">
                        Create a new campaign
                    </Link>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const steps = [
        { id: 'submitted', label: 'Submitted', icon: CheckCircle },
        { id: 'processing', label: 'Generating Content', icon: Loader2 },
        { id: 'completed', label: 'Finalizing Video', icon: CheckCircle },
    ];

    const currentStepIndex =
        job.status === 'submitted' ? 0 :
            job.status === 'processing' ? 1 :
                job.status === 'completed' ? 3 : 2; // 'failed' handled separately or falls through

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/create" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Create
                    </Link>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Campaign #{job.job_id.slice(0, 8)}</h1>
                                <p className="text-sm text-gray-500 mt-1">Created at {new Date(job.created_at).toLocaleString()}</p>
                            </div>
                            <div className={clsx(
                                "px-4 py-1 rounded-full text-sm font-medium capitalize",
                                job.status === 'completed' ? "bg-green-100 text-green-800" :
                                    job.status === 'failed' ? "bg-red-100 text-red-800" :
                                        "bg-blue-100 text-blue-800"
                            )}>
                                {job.status}
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {job.status === 'failed' ? (
                            <div className="text-center py-12">
                                <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900">Generation Failed</h3>
                                <p className="text-gray-600 mt-2">Something went wrong during the video generation process.</p>
                            </div>
                        ) : job.status === 'completed' && job.video_url ? (
                            <div className="space-y-8">
                                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative group">
                                    <video
                                        controls
                                        className="w-full h-full"
                                        src={job.video_url}
                                        poster="/placeholder-video-poster.jpg" // Optional
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>

                                <div className="flex justify-center">
                                    <a
                                        href={job.video_url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Video
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12">
                                <div className="max-w-xl mx-auto">
                                    <div className="relative">
                                        {/* Progress Bar */}
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
                                        <div
                                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full -z-10 transition-all duration-500"
                                            style={{ width: `${(currentStepIndex / 2) * 100}%` }}
                                        ></div>

                                        <div className="flex justify-between">
                                            {steps.map((step, idx) => {
                                                const isCompleted = idx < currentStepIndex;
                                                const isCurrent = idx === currentStepIndex;
                                                const Icon = step.icon;

                                                return (
                                                    <div key={step.id} className="flex flex-col items-center bg-white px-2">
                                                        <div className={clsx(
                                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                                            isCompleted ? "bg-blue-600 border-blue-600 text-white" :
                                                                isCurrent ? "bg-white border-blue-600 text-blue-600" :
                                                                    "bg-white border-gray-300 text-gray-300"
                                                        )}>
                                                            <Icon className={clsx("w-5 h-5", isCurrent && step.id === 'processing' && "animate-spin")} />
                                                        </div>
                                                        <span className={clsx(
                                                            "mt-2 text-xs font-medium transition-colors duration-300",
                                                            isCompleted || isCurrent ? "text-blue-600" : "text-gray-400"
                                                        )}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <p className="text-center text-gray-500 mt-8 animate-pulse">
                                        {job.status === 'submitted' ? 'Sending details to AI agent...' : 'AI is analyzing and generating video...'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
