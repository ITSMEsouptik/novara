'use client';

import { Brain, Target, TrendingUp, Megaphone, Image as ImageIcon, Download, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface DeepBrandAnalysis {
    archetype: string;
    visual_direction: string;
    voice_instruction: string;
}

interface PsychographicProfile {
    icp_persona: string;
    visceral_pain_point: string;
    emotional_payoff: string;
}

interface WinningViralFormat {
    name: string;
    visual_script: string;
    audio_cues: string;
}

interface MarketWarfare {
    enemy_weakness: string;
    winning_viral_format: WinningViralFormat;
}

interface OfferEngineering {
    primary_hook: string;
    cta_copy: string;
}

interface ExtractedAssets {
    logo?: {
        url: string;
        format: string;
    };
    product_images?: Array<{
        url: string;
        alt?: string;
    }>;
    brand_colors?: {
        primary: string;
        secondary: string;
    };
    font_family?: string;
    extracted_at?: string;
}

interface AnalysisData {
    analysis_status?: 'pending' | 'processing' | 'completed' | 'partial' | 'failed';
    deep_analysis?: {
        deep_brand_analysis: DeepBrandAnalysis;
        psychographic_profile: PsychographicProfile;
        market_warfare: MarketWarfare;
        offer_engineering: OfferEngineering;
    };
    extracted_assets?: ExtractedAssets;
    analysis_errors?: Record<string, string>;
}

interface AnalysisDashboardProps {
    analysisData: AnalysisData;
}

export function AnalysisDashboard({ analysisData }: AnalysisDashboardProps) {
    const { analysis_status, deep_analysis, extracted_assets, analysis_errors } = analysisData;

    const getStatusIcon = () => {
        switch (analysis_status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'processing':
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'partial':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
        }
    };

    const getStatusLabel = () => {
        switch (analysis_status) {
            case 'completed':
                return 'Analysis Complete';
            case 'processing':
                return 'Analyzing...';
            case 'partial':
                return 'Partial Analysis';
            case 'failed':
                return 'Analysis Failed';
            default:
                return 'Pending Analysis';
        }
    };

    return (
        <div className="space-y-6">
            {/* Analysis Status Header */}
            <div className="glass p-6 rounded-xl border border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
                        <Brain className="w-6 h-6 text-brand-primary" />
                        Deep Analysis Results
                    </h2>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <span className={clsx(
                            "text-sm font-medium",
                            analysis_status === 'completed' ? "text-green-600" :
                                analysis_status === 'processing' ? "text-blue-600" :
                                    analysis_status === 'partial' ? "text-yellow-600" :
                                        analysis_status === 'failed' ? "text-red-600" :
                                            "text-gray-500"
                        )}>
                            {getStatusLabel()}
                        </span>
                    </div>
                </div>

                {analysis_errors && Object.keys(analysis_errors).length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Analysis Warnings:</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            {Object.entries(analysis_errors).map(([key, error]) => (
                                <li key={key}>
                                    <strong className="capitalize">{key}:</strong> {error}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Deep Brand Analysis */}
            {deep_analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Brand Analysis Card */}
                    <div className="glass p-6 rounded-xl border border-gray-200/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5 text-brand-primary" />
                            <h3 className="text-lg font-semibold text-brand-text">Brand Analysis</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Archetype</label>
                                <p className="mt-1 text-brand-text font-medium">{deep_analysis.deep_brand_analysis.archetype}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Visual Direction</label>
                                <p className="mt-1 text-brand-text">{deep_analysis.deep_brand_analysis.visual_direction}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Voice Instructions</label>
                                <p className="mt-1 text-brand-text italic">{deep_analysis.deep_brand_analysis.voice_instruction}</p>
                            </div>
                        </div>
                    </div>

                    {/* Psychographic Profile Card */}
                    <div className="glass p-6 rounded-xl border border-gray-200/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-brand-primary" />
                            <h3 className="text-lg font-semibold text-brand-text">Target Audience</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">ICP Persona</label>
                                <p className="mt-1 text-brand-text">{deep_analysis.psychographic_profile.icp_persona}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pain Point</label>
                                <p className="mt-1 text-brand-text text-red-600 font-medium">{deep_analysis.psychographic_profile.visceral_pain_point}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Emotional Payoff</label>
                                <p className="mt-1 text-brand-text text-green-600 font-medium">{deep_analysis.psychographic_profile.emotional_payoff}</p>
                            </div>
                        </div>
                    </div>

                    {/* Market Warfare Card */}
                    <div className="glass p-6 rounded-xl border border-gray-200/50">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-brand-primary" />
                            <h3 className="text-lg font-semibold text-brand-text">Market Strategy</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Competitor Weakness</label>
                                <p className="mt-1 text-brand-text">{deep_analysis.market_warfare.enemy_weakness}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Viral Format: {deep_analysis.market_warfare.winning_viral_format.name}</label>
                                <div className="mt-2 space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium">Visual Script:</p>
                                        <p className="mt-1 text-sm text-brand-text">{deep_analysis.market_warfare.winning_viral_format.visual_script}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium">Audio Cues:</p>
                                        <p className="mt-1 text-sm text-brand-text">{deep_analysis.market_warfare.winning_viral_format.audio_cues}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Offer Engineering Card */}
                    <div className="glass p-6 rounded-xl border border-gray-200/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Megaphone className="w-5 h-5 text-brand-primary" />
                            <h3 className="text-lg font-semibold text-brand-text">Offer Strategy</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Hook</label>
                                <p className="mt-1 text-brand-text font-semibold text-lg">{deep_analysis.offer_engineering.primary_hook}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CTA Copy</label>
                                <p className="mt-1 text-brand-text font-medium bg-brand-primary/10 p-3 rounded-lg border border-brand-primary/20">
                                    {deep_analysis.offer_engineering.cta_copy}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Extracted Assets */}
            {extracted_assets && (
                <div className="glass p-6 rounded-xl border border-gray-200/50">
                    <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="w-5 h-5 text-brand-primary" />
                        <h3 className="text-lg font-semibold text-brand-text">Extracted Brand Assets</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo */}
                        {extracted_assets.logo && (
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Logo</label>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-center min-h-[120px]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={extracted_assets.logo.url}
                                        alt="Brand Logo"
                                        className="max-w-full max-h-24 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Format: {extracted_assets.logo.format.toUpperCase()}</p>
                            </div>
                        )}

                        {/* Brand Colors */}
                        {extracted_assets.brand_colors && (
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Brand Colors</label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <div
                                            className="w-full h-20 rounded-lg border border-gray-200 mb-2"
                                            style={{ backgroundColor: extracted_assets.brand_colors.primary }}
                                        ></div>
                                        <p className="text-xs text-gray-600 font-mono">{extracted_assets.brand_colors.primary}</p>
                                        <p className="text-xs text-gray-500">Primary</p>
                                    </div>
                                    <div className="flex-1">
                                        <div
                                            className="w-full h-20 rounded-lg border border-gray-200 mb-2"
                                            style={{ backgroundColor: extracted_assets.brand_colors.secondary }}
                                        ></div>
                                        <p className="text-xs text-gray-600 font-mono">{extracted_assets.brand_colors.secondary}</p>
                                        <p className="text-xs text-gray-500">Secondary</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Font Family */}
                    {extracted_assets.font_family && (
                        <div className="mt-6">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Font Family</label>
                            <p className="text-lg font-mono text-brand-text" style={{ fontFamily: extracted_assets.font_family }}>
                                {extracted_assets.font_family}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Sample: The quick brown fox jumps over the lazy dog</p>
                        </div>
                    )}

                    {/* Product Images */}
                    {extracted_assets.product_images && extracted_assets.product_images.length > 0 && (
                        <div className="mt-6">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                                Product Images ({extracted_assets.product_images.length})
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {extracted_assets.product_images.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img.url}
                                            alt={img.alt || `Product ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">Image failed to load</div>';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a
                                                href={img.url}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {extracted_assets.extracted_at && (
                        <p className="text-xs text-gray-400 mt-4">
                            Extracted: {new Date(extracted_assets.extracted_at).toLocaleString()}
                        </p>
                    )}
                </div>
            )}

            {/* No Analysis Data Message */}
            {!deep_analysis && !extracted_assets && analysis_status !== 'processing' && (
                <div className="glass p-8 rounded-xl border border-gray-200/50 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-brand-textSecondary">Analysis data not available yet. Please check back in a few moments.</p>
                </div>
            )}
        </div>
    );
}


