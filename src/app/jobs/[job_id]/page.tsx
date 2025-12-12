'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle, Download, ArrowLeft, BarChart3, Video, FileText } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { Header } from '@/components/sections/Header';
import { AnalysisDashboard } from '@/components/dashboard/AnalysisDashboard';

type JobStatus = 'submitted' | 'processing' | 'generating' | 'completed' | 'failed';

interface JobData {
    job_id: string;
    status: JobStatus;
    video_url?: string;
    created_at: string;
    completed_at?: string;
    payload?: {
        url?: string;
        service_area?: string;
        goal?: string;
        name?: string;
        email?: string;
        uploaded_assets?: Array<{ name: string; size: number; type: string }>;
        analysis_status?: 'pending' | 'processing' | 'completed' | 'partial' | 'failed';
        deep_analysis?: Record<string, unknown>;
        extracted_assets?: Record<string, unknown>;
        analysis_errors?: Record<string, string>;
        media_outputs?: Array<{
            id: string;
            type: 'video' | 'image';
            url: string;
            angle_name?: string;
            placement?: string;
        }>;
    };
}

type TabType = 'analysis' | 'outputs' | 'details';

export default function JobPage() {
    const params = useParams();
    const jobId = params.job_id as string;
    const [job, setJob] = useState<JobData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [polling, setPolling] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('analysis');

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

                // Continue polling if analysis is still processing or job is generating
                if (data.status === 'completed' || data.status === 'failed') {
                    // Still poll if analysis is in progress
                    if (data.payload?.analysis_status === 'processing' || data.payload?.analysis_status === 'pending') {
                        setPolling(true);
                    } else {
                    setPolling(false);
                    }
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

    // Auto-switch to outputs tab if analysis is complete and outputs exist
    // This must be before early returns to maintain hook order
    const hasOutputs = (job?.payload?.media_outputs && job.payload.media_outputs.length > 0) || job?.video_url;
    
    useEffect(() => {
        if (job?.payload?.analysis_status === 'completed' && hasOutputs && activeTab === 'analysis') {
            setActiveTab('outputs');
        }
    }, [job?.payload?.analysis_status, hasOutputs, activeTab, job]);

    if (error) {
        return (
            <>
                <Header />
                <div className="relative min-h-screen flex items-center justify-center bg-brand-background p-4">
                    {/* Glassmorphic Background Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 backdrop-blur-md z-[1]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)] z-[1]"></div>
                    
                    <div className="relative glass p-8 rounded-xl shadow-lg max-w-md w-full text-center z-10">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-brand-text mb-2">Error</h2>
                        <p className="text-brand-textSecondary mb-6">{error}</p>
                        <Link href="/create" className="text-brand-primary hover:underline font-medium">
                            Create a new campaign
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    if (!job) {
        return (
            <>
                <Header />
                <div className="relative min-h-screen flex items-center justify-center bg-brand-background">
                    {/* Glassmorphic Background Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 backdrop-blur-md z-[1]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)] z-[1]"></div>
                    
                    <div className="relative z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                    </div>
                </div>
            </>
        );
    }

    const steps = [
        { id: 'submitted', label: 'Submitted', icon: CheckCircle },
        { id: 'processing', label: 'Analyzing', icon: Loader2 },
        { id: 'generating', label: 'Generating Content', icon: Loader2 },
        { id: 'completed', label: 'Completed', icon: CheckCircle },
    ];

    const currentStepIndex =
        job.status === 'submitted' ? 0 :
            job.status === 'processing' ? 1 :
                job.status === 'generating' ? 2 :
                    job.status === 'completed' ? 3 : 2;

    return (
        <>
            {/* Fixed Header */}
            <Header />
            
            <div className="relative min-h-screen bg-brand-background py-12 px-4 sm:px-6 lg:px-8">
                {/* Glassmorphic Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 backdrop-blur-md z-[1]"></div>
                
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)] z-[1]"></div>
                
                <div className="relative max-w-7xl mx-auto z-10">
                    <div className="mb-8">
                        <Link href="/create" className="inline-flex items-center text-brand-textSecondary hover:text-brand-text transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Create
                        </Link>
                    </div>

                    {/* Job Header Card */}
                    <div className="glass shadow-xl rounded-2xl overflow-hidden mb-6">
                        <div className="p-6 border-b border-gray-200/50">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                    <h1 className="text-3xl font-bold text-brand-text">Campaign Dashboard</h1>
                                    <p className="text-sm text-brand-textSecondary mt-1">
                                        Job ID: {job.job_id.slice(0, 8)}... • Created: {new Date(job.created_at).toLocaleString()}
                                    </p>
                                    {job.payload?.url && (
                                        <p className="text-xs text-brand-textSecondary mt-1">
                                            <a href={job.payload.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {job.payload.url}
                                            </a>
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {job.payload?.goal && (
                                        <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-medium">
                                            {job.payload.goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                                    )}
                            <div className={clsx(
                                        "px-4 py-2 rounded-full text-sm font-medium capitalize flex items-center gap-2",
                                job.status === 'completed' ? "bg-green-100 text-green-800" :
                                    job.status === 'failed' ? "bg-red-100 text-red-800" :
                                        "bg-blue-100 text-blue-800"
                            )}>
                                        {job.status === 'processing' || job.status === 'generating' ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                {job.status}
                                            </>
                                        ) : (
                                            job.status
                                        )}
                                </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Indicator */}
                        {job.status !== 'completed' && job.status !== 'failed' && (
                            <div className="p-6 bg-gray-50/50">
                                <div className="max-w-2xl mx-auto">
                                    <div className="relative">
                                        {/* Progress Bar */}
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
                                        <div
                                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-primary rounded-full -z-10 transition-all duration-500"
                                            style={{ width: `${Math.min((currentStepIndex / (steps.length - 1)) * 100, 100)}%` }}
                                        ></div>

                                        <div className="flex justify-between">
                                            {steps.map((step, idx) => {
                                                const isCompleted = idx < currentStepIndex;
                                                const isCurrent = idx === currentStepIndex;
                                                const Icon = step.icon;

                                                return (
                                                    <div key={step.id} className="flex flex-col items-center bg-transparent px-2">
                                                        <div className={clsx(
                                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                                            isCompleted ? "bg-brand-primary border-brand-primary text-white" :
                                                                isCurrent ? "bg-white border-brand-primary text-brand-primary" :
                                                                    "bg-white border-gray-300 text-gray-300"
                                                        )}>
                                                            <Icon className={clsx("w-5 h-5", isCurrent && (step.id === 'processing' || step.id === 'generating') && "animate-spin")} />
                                                        </div>
                                                        <span className={clsx(
                                                            "mt-2 text-xs font-medium transition-colors duration-300 text-center",
                                                            isCompleted || isCurrent ? "text-brand-primary" : "text-gray-400"
                                                        )}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="glass shadow-xl rounded-2xl overflow-hidden mb-6">
                        <div className="border-b border-gray-200/50">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => setActiveTab('analysis')}
                                    className={clsx(
                                        "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                                        activeTab === 'analysis'
                                            ? "border-brand-primary text-brand-primary"
                                            : "border-transparent text-brand-textSecondary hover:text-brand-text hover:border-gray-300"
                                    )}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Analysis
                                    {job.payload?.analysis_status === 'completed' && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                    {job.payload?.analysis_status === 'processing' && (
                                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('outputs')}
                                    className={clsx(
                                        "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                                        activeTab === 'outputs'
                                            ? "border-brand-primary text-brand-primary"
                                            : "border-transparent text-brand-textSecondary hover:text-brand-text hover:border-gray-300"
                                    )}
                                >
                                    <Video className="w-4 h-4" />
                                    Generated Outputs
                                    {hasOutputs && (
                                        <span className="ml-1 px-2 py-0.5 text-xs bg-brand-primary/20 text-brand-primary rounded-full">
                                            {job.payload?.media_outputs?.length || 0}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={clsx(
                                        "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                                        activeTab === 'details'
                                            ? "border-brand-primary text-brand-primary"
                                            : "border-transparent text-brand-textSecondary hover:text-brand-text hover:border-gray-300"
                                    )}
                                >
                                    <FileText className="w-4 h-4" />
                                    Job Details
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'analysis' && (
                                <AnalysisDashboard
                                    analysisData={(job.payload || {}) as unknown as Parameters<typeof AnalysisDashboard>[0]['analysisData']}
                                />
                            )}

                            {activeTab === 'outputs' && (
                                <div className="space-y-6">
                                    {hasOutputs ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Legacy video_url support */}
                                            {job.video_url && !job.payload?.media_outputs?.some(m => m.url === job.video_url) && (
                                                <div className="glass p-4 rounded-xl border border-gray-200/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-brand-text">Generated Video</h3>
                                                        <span className="px-2 py-1 text-xs bg-brand-primary/10 text-brand-primary rounded-full uppercase">
                                                            Video
                                                        </span>
                                                    </div>
                                                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                                        <video
                                                            controls
                                                            className="w-full h-full"
                                                            src={job.video_url}
                                                        >
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    </div>
                                                    <a
                                                        href={job.video_url}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-3 inline-flex items-center gap-2 text-sm text-brand-primary hover:underline"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </a>
                                                </div>
                                            )}
                                            
                                            {/* Media outputs from payload */}
                                            {job.payload?.media_outputs?.map((output, idx) => (
                                                <div key={output.id || idx} className="glass p-4 rounded-xl border border-gray-200/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-brand-text">
                                                            {output.angle_name || output.placement || `Output ${idx + 1}`}
                                                        </h3>
                                                        <span className="px-2 py-1 text-xs bg-brand-primary/10 text-brand-primary rounded-full uppercase">
                                                            {output.type}
                                                        </span>
                                                    </div>
                                                    {output.type === 'video' ? (
                                                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                                            <video
                                                                controls
                                                                className="w-full h-full"
                                                                src={output.url}
                                                            >
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={output.url}
                                                                alt={output.angle_name || `Image ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <a
                                                        href={output.url}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-3 inline-flex items-center gap-2 text-sm text-brand-primary hover:underline"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-brand-text mb-2">No Outputs Yet</h3>
                                            <p className="text-brand-textSecondary">
                                                Generated videos and images will appear here once processing is complete.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="glass p-4 rounded-xl border border-gray-200/50">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Service Area</label>
                                            <p className="text-brand-text">{job.payload?.service_area || 'N/A'}</p>
                                        </div>
                                        <div className="glass p-4 rounded-xl border border-gray-200/50">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Campaign Goal</label>
                                            <p className="text-brand-text">
                                                {job.payload?.goal ? job.payload.goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="glass p-4 rounded-xl border border-gray-200/50">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Created At</label>
                                            <p className="text-brand-text">{new Date(job.created_at).toLocaleString()}</p>
                                        </div>
                                        {job.completed_at && (
                                            <div className="glass p-4 rounded-xl border border-gray-200/50">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Completed At</label>
                                                <p className="text-brand-text">{new Date(job.completed_at).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>

                                    {job.payload?.uploaded_assets && job.payload.uploaded_assets.length > 0 && (
                                        <div className="glass p-4 rounded-xl border border-gray-200/50">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                                                Uploaded Assets ({job.payload.uploaded_assets.length})
                                            </label>
                                            <div className="space-y-2">
                                                {job.payload.uploaded_assets.map((asset, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                        <span className="text-sm text-brand-text">{asset.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {(asset.size / 1024).toFixed(2)} KB
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="glass p-4 rounded-xl border border-gray-200/50">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Full Payload</label>
                                        <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                                            {JSON.stringify(job.payload, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                </div>
            </div>
        </div>
        </>
    );
}
