'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Header } from '@/components/sections/Header';

export default function CreatePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        website: '',
        productUrl: '',
        productDescription: '',
        brief: '',
        targetAudience: '',
        painPoint: '',
        campaignGoal: '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            data.append('Website ', formData.website); // Note: n8n workflow expects "Website " (with space?) - checking prompt spec: "Website "
            data.append('Product Url ', formData.productUrl);
            data.append('Product Description', formData.productDescription);
            data.append('Brief ', formData.brief);
            data.append('Target Audience ', formData.targetAudience);
            data.append('Pain Point ', formData.painPoint);
            data.append('Campaign Goal ', formData.campaignGoal);

            files.forEach((file) => {
                data.append('Product Images ', file);
            });

            const res = await fetch('/api/submit', {
                method: 'POST',
                body: data,
            });

            if (!res.ok) throw new Error('Failed to submit');

            const { job_id } = await res.json();
            router.push(`/jobs/${job_id}`);
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Fixed Header */}
            <Header />
            
            <div className="relative min-h-screen bg-brand-background py-12 px-4 sm:px-6 lg:px-8">
                {/* Glassmorphic Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 backdrop-blur-md z-[1]"></div>
                
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)] z-[1]"></div>
                
                <div className="relative max-w-3xl mx-auto z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-brand-text tracking-tight">Create New Campaign</h1>
                        <p className="mt-2 text-lg text-brand-textSecondary">Generate high-converting video ads in minutes.</p>
                    </div>

                    <div className="glass shadow-xl rounded-2xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Section 1: Product Info */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-brand-text border-b border-gray-200/50 pb-2">Product Details</h2>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-brand-text mb-1">Website URL</label>
                                    <input
                                        required
                                        type="url"
                                        className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                        placeholder="https://example.com"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-text mb-1">Product URL</label>
                                    <input
                                        required
                                        type="url"
                                        className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                        placeholder="https://example.com/product"
                                        value={formData.productUrl}
                                        onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">Product Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                    placeholder="Describe your product..."
                                    value={formData.productDescription}
                                    onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300/50 rounded-xl p-8 text-center hover:border-brand-primary/50 hover:bg-white/30 transition-all cursor-pointer group glass"
                                >
                                    <Upload className="mx-auto h-10 w-10 text-brand-textSecondary group-hover:text-brand-primary transition-colors" />
                                    <p className="mt-2 text-sm text-brand-textSecondary">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {files.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {files.map((file, idx) => (
                                            <div key={idx} className="relative group aspect-square glass rounded-lg overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                    className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Campaign Strategy */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-brand-text border-b border-gray-200/50 pb-2">Campaign Strategy</h2>

                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">Brief</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                    placeholder="What is the main message?"
                                    value={formData.brief}
                                    onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-brand-text mb-1">Target Audience</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                        placeholder="e.g. Busy moms, Tech enthusiasts"
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-text mb-1">Pain Point</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                        placeholder="e.g. Not enough time"
                                        value={formData.painPoint}
                                        onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">Campaign Goal</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                    placeholder="e.g. Brand Awareness, Conversions"
                                    value={formData.campaignGoal}
                                    onChange={(e) => setFormData({ ...formData, campaignGoal: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={clsx(
                                    "w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-brand-primary hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary/50 transition-all",
                                    isLoading && "opacity-75 cursor-not-allowed"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                        Generating Campaign...
                                    </>
                                ) : (
                                    <>
                                        Generate Campaign
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}
