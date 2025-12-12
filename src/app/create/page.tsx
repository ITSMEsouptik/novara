'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Header } from '@/components/sections/Header';

const CAMPAIGN_GOALS = [
    { value: 'get_more_sales', label: 'Get More Sales / Orders', description: 'Focus: Offers, Products' },
    { value: 'get_more_bookings', label: 'Get More Bookings / Leads', description: 'Focus: Trust, Service' },
    { value: 'build_awareness', label: 'Build Brand Awareness', description: 'Focus: Viral, Story' },
    { value: 'promote_event', label: 'Promote an Event / Launch', description: 'Focus: Urgency, Dates' },
];

export default function CreatePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        url: '',
        serviceArea: '',
        goal: '',
        name: '',
        email: '',
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
            data.append('url', formData.url);
            data.append('service_area', formData.serviceArea);
            data.append('goal', formData.goal);
            data.append('name', formData.name);
            data.append('email', formData.email);

            files.forEach((file) => {
                data.append('uploaded_assets', file);
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

                        {/* Website URL */}
                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">
                                Website URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="url"
                                className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                placeholder="https://www.example.com"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            />
                        </div>

                        {/* Service Area */}
                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">
                                Where Do You Sell? <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                placeholder="City, State, or Global (e.g., Chicago, IL or Global)"
                                value={formData.serviceArea}
                                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                            />
                            <p className="mt-1 text-xs text-gray-500">Enter your service area (City, State, or Global)</p>
                        </div>

                        {/* Campaign Goal */}
                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">
                                Campaign Goal <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text"
                                value={formData.goal}
                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            >
                                <option value="">Select a campaign goal</option>
                                {CAMPAIGN_GOALS.map((goal) => (
                                    <option key={goal.value} value={goal.value}>
                                        {goal.label} - {goal.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Upload Assets */}
                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">
                                Brand Files <span className="text-gray-400 text-xs font-normal">(optional)</span>
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300/50 rounded-xl p-8 text-center hover:border-brand-primary/50 hover:bg-white/30 transition-all cursor-pointer group glass"
                            >
                                <Upload className="mx-auto h-10 w-10 text-brand-textSecondary group-hover:text-brand-primary transition-colors" />
                                <p className="mt-2 text-sm font-medium text-brand-text">Upload Logo & Product/Vibe Photos</p>
                                <p className="text-xs text-gray-500 mt-2">Upload your Logo (PNG) and 3-5 best product photos. We&apos;ll use these in your ads.</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
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
                                <div className="mt-4">
                                    <p className="text-sm text-brand-textSecondary mb-2">Uploaded files ({files.length}):</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {files.map((file, idx) => (
                                            <div key={idx} className="relative group aspect-square glass rounded-lg overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-xs text-white px-2 text-center truncate w-full">{file.name}</p>
                                                </div>
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
                                </div>
                            )}
                        </div>

                        {/* Name & Email */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                    placeholder="Your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-2 glass rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-brand-text placeholder:text-gray-400"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
