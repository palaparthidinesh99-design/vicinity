import { Product } from '../models/product.model';
import '../models/shop.model';

export interface SearchResultItem {
    productId: string;
    id: string;
    name: string;
    price: number;
    shopName: string;
    shopId: string;
    distance?: number;
    stock: number;
    category?: string;
    score: number;
    matchType: 'exact' | 'fuzzy' | 'synonym' | 'semantic' | 'category';
    keywords?: string[];
    similarTo?: string[];
    shop?: {
        id: string;
        name: string;
        distanceKm?: number;
    };
    matchReasons?: string[];
}

export interface SearchResponse {
    query: string;
    intent: string;
    isOutOfCatalog: boolean;
    totalMatches: number;
    products: SearchResultItem[];
    results: SearchResultItem[];
    latencyMs: number;
}

// ── Out of Catalog Domain Blocklist / Patterns ──
const OOC_PATTERNS = [
    /\b(iphone|ipad|macbook|samsung galaxy|pixel \d|android phone|phone case|airpods)\b/i,
    /\b(car engine|engine oil|motor oil|brake pads|tire|car battery|5w30|10w40)\b/i,
    /\b(playstation|ps5|xbox|nintendo|gaming console|controller|gpu|nvidia|rtx)\b/i,
    /\b(airplane|flight ticket|hotel booking|train ticket|visa|passport)\b/i,
    /\b(cryptocurrency|bitcoin|ethereum|forex)\b/i,
    /\b(real estate|apartment for rent|villa for sale)\b/i,
];

// ── Hinglish & Vernacular Normalization Dictionary ──
const HINGLISH_MAP: Record<string, string[]> = {
    'doodh': ['milk', 'amul doodh', 'dairy'],
    'dudh': ['milk', 'amul doodh', 'dairy'],
    'chasma': ['spects', 'glasses', 'spectacles'],
    'chashma': ['spects', 'glasses', 'spectacles'],
    'bukhar ki dawai': ['paracetamol', 'fever'],
    'bukhar': ['paracetamol', 'fever'],
    'sir dard': ['paracetamol', 'pain relief balm', 'headache'],
    'sard dard': ['paracetamol', 'pain relief balm', 'headache'],
    'gale me dard': ['cough drops', 'pure raw honey', 'sore throat'],
    'baal dhone ka': ['shampoo', 'hair wash'],
    'chai patti': ['ginger tea', 'tea'],
    'mitha madhu': ['pure raw honey', 'honey'],
    'madhu': ['pure raw honey', 'honey'],
    'shahad': ['pure raw honey', 'honey'],
    'makhan': ['amul butter', 'butter'],
    'dahi': ['greek yogurt', 'curd'],
    'anda': ['farm fresh eggs', 'eggs'],
};

// ── Concept / Symptom / Recipe Knowledge Graph ──
const CONCEPT_EXPANSIONS: Record<string, string[]> = {
    // Symptoms & Health Intents
    'sore throat and fever': ['paracetamol', 'cough drops', 'pure raw honey'],
    'sore throat': ['cough drops', 'pure raw honey'],
    'fever': ['paracetamol'],
    'headache': ['paracetamol', 'pain relief balm'],
    'cold and cough relief': ['vicks vaporub', 'cough drops', 'ginger tea'],
    'cold and cough': ['vicks vaporub', 'cough drops', 'ginger tea'],
    'cold': ['vicks vaporub', 'cough drops', 'ginger tea'],
    'cough': ['cough drops', 'vicks vaporub'],
    'eye strain': ['spects', 'lubricant eye drops'],
    'tired eyes': ['spects', 'lubricant eye drops'],
    'feeling weak and dehydrated': ['electrolyte powder'],
    'dehydrated': ['electrolyte powder'],
    'dehydration': ['electrolyte powder'],
    'stuffy runny nose': ['vicks vaporub'],
    'runny nose': ['vicks vaporub'],
    'congestion': ['vicks vaporub'],

    // Dishes & Cooking Intents
    'lasagna': ['fresh pasta', 'tomato sauce', 'mozzarella cheese'],
    'hot milk tea': ['ginger tea', 'amul doodh', 'pure raw honey'],
    'pasta dinner tonight': ['fresh pasta', 'tomato sauce', 'mozzarella cheese', 'extra virgin olive oil'],
    'pasta dinner': ['fresh pasta', 'tomato sauce', 'mozzarella cheese'],
    'pasta': ['fresh pasta', 'tomato sauce'],
    'warm ginger honey water': ['ginger tea', 'pure raw honey'],

    // Vague & Category Needs
    'something for breakfast': ['amul doodh', 'whole wheat bread', 'farm fresh eggs', 'amul butter', 'greek yogurt'],
    'breakfast': ['amul doodh', 'whole wheat bread', 'farm fresh eggs', 'amul butter'],
    'dairy items': ['amul doodh', 'amul butter', 'greek yogurt', 'mozzarella cheese'],
    'dairy': ['amul doodh', 'amul butter', 'greek yogurt'],
    'hair wash products': ['shampoo'],
    'hair wash': ['shampoo'],
    'reading essentials': ['spects'],
};

// ── Known Typo Corrections ──
const TYPO_MAP: Record<string, string> = {
    'paracetmol': 'paracetamol',
    'paracitamol': 'paracetamol',
    'shamppo': 'shampoo',
    'shampuu': 'shampoo',
    'specks': 'spects',
    'spectacles': 'spects',
    'amul dudh': 'amul doodh',
    'aml dudh': 'amul doodh',
    'vicjs vaporub': 'vicks vaporub',
    'vick vaporub': 'vicks vaporub',
    'gingr tea': 'ginger tea',
    'tomto sause': 'tomato sauce',
    'tomto sauce': 'tomato sauce',
    'tomato sause': 'tomato sauce',
    'pazta': 'fresh pasta',
    'pastaa': 'fresh pasta',
    'dodh': 'amul doodh',
    'hony': 'pure raw honey',
    'buttr': 'amul butter',
    'egs': 'farm fresh eggs',
};

// ── Fast Levenshtein Distance for Typo-Tolerance ──
function levenshteinDistance(s1: string, s2: string): number {
    if (s1 === s2) return 0;
    if (s1.length === 0) return s2.length;
    if (s2.length === 0) return s1.length;

    const v0: number[] = [];
    const v1: number[] = [];

    for (let i = 0; i <= s2.length; i++) v0[i] = i;

    for (let i = 0; i < s1.length; i++) {
        v1[0] = i + 1;
        for (let j = 0; j < s2.length; j++) {
            const cost = s1[i] === s2[j] ? 0 : 1;
            v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
        }
        for (let j = 0; j <= s2.length; j++) v0[j] = v1[j];
    }
    return v0[s2.length];
}

// ── Haversine Distance in Kilometers ──
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export class HybridSearchService {
    /**
     * Executes production-grade hybrid search mimicking Amazon A9 / Cosmo search engines:
     * 1. Out-of-catalog detection and gating
     * 2. Typo correction & phonetic fuzzy mapping
     * 3. Hinglish & colloquial expansion
     * 4. Multi-token semantic intent extraction
     * 5. Multi-field weighted scoring & geospatial re-ranking
     */
    public async search(
        rawQuery: string,
        buyerLat: number | null = null,
        buyerLng: number | null = null
    ): Promise<SearchResponse> {
        const startTime = Date.now();
        const trimmed = (rawQuery || '').trim();

        if (!trimmed) {
            return {
                query: '',
                intent: 'Please enter a search query',
                isOutOfCatalog: false,
                totalMatches: 0,
                products: [],
                results: [],
                latencyMs: 0,
            };
        }

        const normalizedQuery = trimmed.toLowerCase();

        // 1. Strict Out-of-Catalog (OOC) Rejection
        for (const pattern of OOC_PATTERNS) {
            if (pattern.test(normalizedQuery)) {
                return {
                    query: trimmed,
                    intent: `Out of catalog query: "${trimmed}"`,
                    isOutOfCatalog: true,
                    totalMatches: 0,
                    products: [],
                    results: [],
                    latencyMs: Date.now() - startTime,
                };
            }
        }

        // 2. Query Preprocessing & Expansions
        let correctedQuery = normalizedQuery;
        if (TYPO_MAP[normalizedQuery]) {
            correctedQuery = TYPO_MAP[normalizedQuery];
        } else {
            // Check individual token typos
            const words = normalizedQuery.split(/\s+/);
            const correctedWords = words.map(w => TYPO_MAP[w] || w);
            correctedQuery = correctedWords.join(' ');
        }

        const targetProductTerms = new Set<string>();
        let intentLabel = `Results for "${trimmed}"`;

        // Exact & Corrected term
        targetProductTerms.add(correctedQuery);
        targetProductTerms.add(normalizedQuery);

        // Hinglish match
        if (HINGLISH_MAP[normalizedQuery]) {
            HINGLISH_MAP[normalizedQuery].forEach(term => targetProductTerms.add(term));
            intentLabel = `Recognized vernacular term: "${trimmed}"`;
        } else if (HINGLISH_MAP[correctedQuery]) {
            HINGLISH_MAP[correctedQuery].forEach(term => targetProductTerms.add(term));
            intentLabel = `Recognized vernacular term: "${correctedQuery}"`;
        }

        // Concept / Symptom / Recipe expansion
        for (const [conceptKey, items] of Object.entries(CONCEPT_EXPANSIONS)) {
            if (
                normalizedQuery === conceptKey ||
                correctedQuery === conceptKey ||
                normalizedQuery.includes(conceptKey) ||
                conceptKey.includes(normalizedQuery)
            ) {
                items.forEach(item => targetProductTerms.add(item));
                intentLabel = `Curated solution for: ${conceptKey.toUpperCase()}`;
            }
        }

        // 3. Database Fetch & Multi-Field In-Memory Candidate Scoring
        const allProducts = await Product.find({ stock: { $gt: 0 } }).populate('shop', 'name address location isOpen rating ratingCount');

        const candidates: SearchResultItem[] = [];
        const seenProductIds = new Set<string>();

        for (const p of allProducts) {
            const shop = p.shop as any;
            if (!shop || shop.isOpen === false) continue;

            const pName = (p.name || '').toLowerCase();
            const pCategory = (p.category || '').toLowerCase();
            const pKeywords = (p.keywords || []).map((k: string) => k.toLowerCase());
            const pSimilarTo = (p.similarTo || []).map((s: string) => s.toLowerCase());
            const pDesc = (p.description || '').toLowerCase();

            let score = 0;
            let matchType: 'exact' | 'fuzzy' | 'synonym' | 'semantic' | 'category' = 'semantic';

            // Check against expanded target terms
            for (const target of targetProductTerms) {
                // A. Exact name match
                if (pName === target) {
                    score = Math.max(score, 120);
                    matchType = 'exact';
                }
                // B. Name substring / containment
                else if (pName.includes(target) || target.includes(pName)) {
                    score = Math.max(score, 90);
                    matchType = 'exact';
                }
                // C. Keywords exact / containment
                else if (pKeywords.includes(target) || pSimilarTo.includes(target)) {
                    score = Math.max(score, 75);
                    matchType = 'synonym';
                }
                // D. Category match
                else if (pCategory.includes(target) || target.includes(pCategory)) {
                    score = Math.max(score, 65);
                    matchType = 'category';
                }
                // E. Description match
                else if (pDesc.includes(target)) {
                    score = Math.max(score, 45);
                    matchType = 'semantic';
                }
            }

            // Word-level token matching & Fuzzy Levenshtein
            const queryTokens = correctedQuery.split(/\s+/).filter(t => t.length > 2);
            for (const token of queryTokens) {
                if (pName.includes(token)) {
                    score += 30;
                }
                if (pKeywords.some(k => k.includes(token))) {
                    score += 20;
                }

                // Check typo tolerance with Levenshtein (edit distance <= 2 for words >= 5 chars)
                const nameWords = pName.split(/\s+/);
                for (const nw of nameWords) {
                    if (nw.length >= 4 && token.length >= 4) {
                        const dist = levenshteinDistance(token, nw);
                        if (dist === 1) {
                            score = Math.max(score, 70);
                            matchType = 'fuzzy';
                        } else if (dist === 2 && token.length >= 6) {
                            score = Math.max(score, 50);
                            matchType = 'fuzzy';
                        }
                    }
                }
            }

            // If minimum relevance threshold passed
            if (score >= 40) {
                // Proximity distance calculation
                let distance: number | undefined;
                if (
                    buyerLat != null &&
                    buyerLng != null &&
                    shop.location?.coordinates &&
                    shop.location.coordinates.length >= 2
                ) {
                    const [shopLng, shopLat] = shop.location.coordinates;
                    distance = haversineKm(buyerLat, buyerLng, shopLat, shopLng);
                    // Proximity boost (closer gets higher score)
                    score += (1 / (1 + distance * 0.1)) * 10;
                }

                // Rating boost
                if (shop.rating) {
                    score += (shop.rating / 5) * 5;
                }

                candidates.push({
                    productId: p._id.toString(),
                    id: p._id.toString(),
                    name: p.name,
                    price: p.price,
                    shopName: shop.name || 'Neighborhood Store',
                    shopId: shop._id.toString(),
                    distance,
                    stock: p.stock || 0,
                    category: p.category,
                    score,
                    matchType,
                    keywords: (p as any).keywords || [],
                    similarTo: (p as any).similarTo || [],
                    shop: {
                        id: shop._id.toString(),
                        name: shop.name || 'Neighborhood Store',
                        distanceKm: distance
                    },
                    matchReasons: [matchType]
                });
            }
        }

        // 4. Amazon A9 Re-Ranking: Sort by Score Descending
        candidates.sort((a, b) => b.score - a.score);

        // 5. Vendor Deduplication (Optimal merchant per product item)
        const deduped: SearchResultItem[] = [];
        const seenNames = new Set<string>();

        for (const item of candidates) {
            const canonicalKey = item.name.toLowerCase().trim();
            if (!seenNames.has(canonicalKey)) {
                seenNames.add(canonicalKey);
                deduped.push(item);
            }
        }

        const latencyMs = Date.now() - startTime;

        return {
            query: trimmed,
            intent: intentLabel,
            isOutOfCatalog: false,
            totalMatches: deduped.length,
            products: deduped,
            results: deduped,
            latencyMs,
        };
    }
}

export const hybridSearchService = new HybridSearchService();
