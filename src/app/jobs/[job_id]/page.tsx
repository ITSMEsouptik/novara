'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';

export default function JobPage({ params }: { params: Promise<{ job_id: string }> }) {
    const resolvedParams = use(params);
    const [job, setJob] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
    const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>('all');

    useEffect(() => {
        const fetchStatus = async () => {
            const res = await fetch(`/api/status?job_id=${resolvedParams.job_id}`);
            const data = await res.json();
            setJob(data);
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [resolvedParams.job_id]);

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading job status...</p>
                </div>
            </div>
        );
    }

    const mediaOutputs = job.payload?.media_outputs || [];
    const filteredMedia = mediaOutputs.filter((m: any) =>
        filterType === 'all' ? true : m.type === filterType
    );

    const currentMedia = filteredMedia[currentIndex];
    const hasMedia = mediaOutputs.length > 0;
    const videoCount = mediaOutputs.filter((m: any) => m.type === 'video').length;
    const imageCount = mediaOutputs.filter((m: any) => m.type === 'image').length;

    const handleSelectAll = () => {
        setSelectedMedia(new Set(filteredMedia.map((m: any) => m.id)));
    };

    const handleDeselectAll = () => {
        setSelectedMedia(new Set());
    };

    const handleDownloadSelected = async () => {
        if (selectedMedia.size === 0) return;

        const res = await fetch('/api/download-selected', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                job_id: resolvedParams.job_id,
                media_ids: Array.from(selectedMedia)
            })
        });

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedMedia.size === 1 ? 'media.mp4' : `campaign_${resolvedParams.job_id}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Campaign #{resolvedParams.job_id.slice(0, 8)}</h1>
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                job.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                            }`}>
                            {job.status}
                        </span>
                        {hasMedia && (
                            <span className="text-sm text-gray-600">
                                {videoCount > 0 && `${videoCount} video${videoCount !== 1 ? 's' : ''}`}
                                {videoCount > 0 && imageCount > 0 && ' · '}
                                {imageCount > 0 && `${imageCount} image${imageCount !== 1 ? 's' : ''}`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Show different UI based on status and media availability */}
                {job.status === 'submitted' && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-6 text-lg text-gray-700">Processing your campaign...</p>
                        <p className="mt-2 text-sm text-gray-500">This usually takes 2-5 minutes</p>
                    </div>
                )}

                {job.status === 'failed' && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <p className="text-lg text-gray-700">Campaign generation failed</p>
                        <p className="mt-2 text-sm text-gray-500">Please try submitting again</p>
                    </div>
                )}

                {job.status === 'completed' && !hasMedia && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-gray-400 text-5xl mb-4">📭</div>
                        <p className="text-lg text-gray-700">No media generated</p>
                        <p className="mt-2 text-sm text-gray-500">The workflow completed but no videos or images were created</p>
                    </div>
                )}

                {hasMedia && (
                    <>
                        {/* Filter Buttons */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => { setFilterType('all'); setCurrentIndex(0); }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                All ({mediaOutputs.length})
                            </button>
                            {videoCount > 0 && (
                                <button
                                    onClick={() => { setFilterType('video'); setCurrentIndex(0); }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === 'video'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Videos ({videoCount})
                                </button>
                            )}
                            {imageCount > 0 && (
                                <button
                                    onClick={() => { setFilterType('image'); setCurrentIndex(0); }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === 'image'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Images ({imageCount})
                                </button>
                            )}
                        </div>

                        {filteredMedia.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <p className="text-gray-600">No {filterType}s available</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-6">
                                {/* Carousel */}
                                <div className="relative">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                                        {currentMedia.type === 'video' ? (
                                            <video
                                                key={currentMedia.url}
                                                src={currentMedia.url}
                                                controls
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <img
                                                src={currentMedia.url}
                                                alt={currentMedia.prompt}
                                                className="w-full h-full object-contain"
                                            />
                                        )}
                                    </div>

                                    {/* Navigation */}
                                    {filteredMedia.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentIndex((i) => (i - 1 + filteredMedia.length) % filteredMedia.length)}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
                                            >
                                                ◀
                                            </button>
                                            <button
                                                onClick={() => setCurrentIndex((i) => (i + 1) % filteredMedia.length)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
                                            >
                                                ▶
                                            </button>
                                        </>
                                    )}

                                    {/* Selection Checkbox */}
                                    <button
                                        onClick={() => {
                                            const newSelected = new Set(selectedMedia);
                                            if (newSelected.has(currentMedia.id)) {
                                                newSelected.delete(currentMedia.id);
                                            } else {
                                                newSelected.add(currentMedia.id);
                                            }
                                            setSelectedMedia(newSelected);
                                        }}
                                        className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white"
                                    >
                                        {selectedMedia.has(currentMedia.id) ? '✅' : '☐'}
                                    </button>
                                </div>

                                {/* Media Info */}
                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded">
                                            {currentMedia.type === 'video' ? '🎬 Video' : '🖼️ Image'}
                                        </span>
                                        {currentMedia.placement && (
                                            <span className="text-sm text-gray-600 px-2 py-1 bg-gray-50 rounded">
                                                {currentMedia.placement}
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-600">{currentMedia.angle_name}</span>
                                        <span className="ml-auto text-sm text-gray-500">
                                            {currentIndex + 1} / {filteredMedia.length}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{currentMedia.prompt}</p>
                                </div>

                                {/* Thumbnail Strip */}
                                {filteredMedia.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-4 mt-4 snap-x snap-mandatory scrollbar-hide">
                                        {filteredMedia.map((media: any, idx: number) => (
                                            <button
                                                key={media.id}
                                                onClick={() => setCurrentIndex(idx)}
                                                className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden snap-start ${idx === currentIndex ? 'ring-2 ring-blue-500' : ''
                                                    }`}
                                            >
                                                {media.type === 'video' ? (
                                                    <video src={media.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={media.url} alt="" className="w-full h-full object-cover" />
                                                )}
                                                {selectedMedia.has(media.id) && (
                                                    <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                                        <span className="text-white text-2xl">✓</span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Selection Controls */}
                                <div className="border-t pt-4 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <button onClick={handleSelectAll} className="text-sm text-blue-600 hover:underline">
                                            Select All
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={handleDeselectAll} className="text-sm text-blue-600 hover:underline">
                                            Deselect All
                                        </button>
                                        <span className="ml-4 text-sm text-gray-600">{selectedMedia.size} selected</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDownloadSelected}
                                            disabled={selectedMedia.size === 0}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                                        >
                                            Download Selected ({selectedMedia.size})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
