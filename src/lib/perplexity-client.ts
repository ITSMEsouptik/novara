const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = process.env.PERPLEXITY_API_URL || 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_MODEL = process.env.PERPLEXITY_MODEL || 'sonar-pro';

export interface DeepBrandAnalysis {
    archetype: string;
    visual_direction: string;
    voice_instruction: string;
}

export interface PsychographicProfile {
    icp_persona: string;
    visceral_pain_point: string;
    emotional_payoff: string;
}

export interface WinningViralFormat {
    name: string;
    visual_script: string;
    audio_cues: string;
}

export interface MarketWarfare {
    enemy_weakness: string;
    winning_viral_format: WinningViralFormat;
}

export interface OfferEngineering {
    primary_hook: string;
    cta_copy: string;
}

export interface DeepAnalysisResponse {
    deep_brand_analysis: DeepBrandAnalysis;
    psychographic_profile: PsychographicProfile;
    market_warfare: MarketWarfare;
    offer_engineering: OfferEngineering;
}

/**
 * Maps goal value to human-readable description
 */
function mapGoalToDescription(goal: string): string {
    const goalMap: Record<string, string> = {
        'get_more_sales': 'Get More Sales / Orders (Focus: Offers, Products)',
        'get_more_bookings': 'Get More Bookings / Leads (Focus: Trust, Service)',
        'build_awareness': 'Build Brand Awareness (Focus: Viral, Story)',
        'promote_event': 'Promote an Event / Launch (Focus: Urgency, Dates)',
    };
    return goalMap[goal] || goal;
}

/**
 * Generates the deep analysis prompt template for Perplexity API
 */
export function generateDeepAnalysisPrompt(url: string, serviceArea: string, goal: string): string {
    const currentYear = new Date().getFullYear();
    const goalDescription = mapGoalToDescription(goal);
    
    return `Act as a legendary CMO and Creative Strategist.
Target URL: ${url}
Location: ${serviceArea}
Goal: ${goalDescription}

INSTRUCTION:
1. Audit the website deeply.
2. Find the brand's social media links (IG/TikTok/FB) on the site.
3. If found, analyze their recent top content for visual vibe and hooks.
4. Search the wider web for competitors and current viral trends in this niche.

### PHASE 1: THE DEEP DIVE (Internal Analysis)
1. **Decode the Brand Soul:** Don't just read the text. Look for the *subtext*. Is the brand trying to be a "Best Friend" (warm/casual) or a "Surgical Expert" (cold/precise)? Define the visual vibe: is it "iPhone minimalist" or "Etsy rustic"?
2. **Forensic Offer Extraction:** Find the *actual* reason to buy. Is there a hidden bundle? A "First Month Free"? If nothing is explicit, invent a "Soft Offer" that creates urgency without lying (e.g., "Limited Slots").
3. **The "Bleeding Neck" Pain:** Identify the specific, visceral pain point the customer feels *right now*. Not "hungry" (boring), but "Stressed about finding a gluten-free cake that doesn't taste like cardboard" (specific).

### PHASE 2: THE SOCIAL & MARKET SCAN (External Analysis)
1. **Social Vibe Check:** Search for their Instagram/TikTok. Do they post memes? Polished studio shots? Raw phone videos? Your ad strategy MUST match this vibe so it feels native.
2. **Competitor Weakness Hunter:** Find 3 local competitors. What do customers complain about in *their* reviews? (e.g., "Competitor A is rude"). We will position this brand as the opposite (e.g., "The Friendly Alternative").
3. **Viral Trend Hunter:** Search for the #1 current viral video format in this specific niche for ${currentYear}. Describe the *exact* visual sequence (e.g., "0-3s: ASMR Crunch sound, 3-5s: Close up texture").

### PHASE 3: THE STRATEGY SYNTHESIS
Combine Phase 1 & 2 into a Master Plan.
- If the goal is SALES, prioritize the Offer + Pain.
- If the goal is AWARENESS, prioritize the Viral Trend.

### OUTPUT
Return a SINGLE strict JSON object with this schema:
{
  "deep_brand_analysis": {
    "archetype": "String (e.g., The Sage, The Jester)",
    "visual_direction": "String (Detailed visual guidance)",
    "voice_instruction": "String (e.g., Use short, punchy sentences. No jargon.)"
  },
  "psychographic_profile": {
    "icp_persona": "String",
    "visceral_pain_point": "String (The deep emotional trigger)",
    "emotional_payoff": "String"
  },
  "market_warfare": {
    "enemy_weakness": "String (What we exploit)",
    "winning_viral_format": {
      "name": "String",
      "visual_script": "String (Step-by-step visual description)",
      "audio_cues": "String"
    }
  },
  "offer_engineering": {
    "primary_hook": "String",
    "cta_copy": "String"
  }
}`;
}

/**
 * Calls the Perplexity API with the provided prompt
 */
export async function callPerplexityAPI(prompt: string): Promise<DeepAnalysisResponse> {
    if (!PERPLEXITY_API_KEY) {
        throw new Error('PERPLEXITY_API_KEY environment variable is not set');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minute timeout

    try {
        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: PERPLEXITY_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert CMO and Creative Strategist. Always respond with valid JSON only, no markdown formatting, no code blocks.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('No content in Perplexity API response');
        }

        return parsePerplexityResponse(content);
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Perplexity API request timed out after 5 minutes');
        }
        throw error;
    }
}

/**
 * Parses and validates the Perplexity API response
 */
export function parsePerplexityResponse(content: string): DeepAnalysisResponse {
    try {
        // Remove markdown code blocks if present
        let cleanedContent = content.trim();
        if (cleanedContent.startsWith('```json')) {
            cleanedContent = cleanedContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        const parsed = JSON.parse(cleanedContent);
        return validateAnalysisSchema(parsed);
    } catch (error) {
        throw new Error(`Failed to parse Perplexity response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Validates the analysis schema matches expected structure
 */
export function validateAnalysisSchema(data: unknown): DeepAnalysisResponse {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data: expected object');
    }

    const obj = data as Record<string, unknown>;
    const requiredFields = [
        'deep_brand_analysis',
        'psychographic_profile',
        'market_warfare',
        'offer_engineering'
    ];

    for (const field of requiredFields) {
        if (!obj[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Validate nested structures
    const deepBrandAnalysis = obj.deep_brand_analysis as Record<string, unknown>;
    if (!deepBrandAnalysis?.archetype || !deepBrandAnalysis?.visual_direction || !deepBrandAnalysis?.voice_instruction) {
        throw new Error('Invalid deep_brand_analysis structure');
    }

    const psychographicProfile = obj.psychographic_profile as Record<string, unknown>;
    if (!psychographicProfile?.icp_persona || !psychographicProfile?.visceral_pain_point || !psychographicProfile?.emotional_payoff) {
        throw new Error('Invalid psychographic_profile structure');
    }

    const marketWarfare = obj.market_warfare as Record<string, unknown>;
    const winningViralFormat = marketWarfare?.winning_viral_format as Record<string, unknown>;
    if (!marketWarfare?.enemy_weakness || !winningViralFormat) {
        throw new Error('Invalid market_warfare structure');
    }

    if (!winningViralFormat?.name || !winningViralFormat?.visual_script || !winningViralFormat?.audio_cues) {
        throw new Error('Invalid winning_viral_format structure');
    }

    const offerEngineering = obj.offer_engineering as Record<string, unknown>;
    if (!offerEngineering?.primary_hook || !offerEngineering?.cta_copy) {
        throw new Error('Invalid offer_engineering structure');
    }

    return obj as unknown as DeepAnalysisResponse;
}


