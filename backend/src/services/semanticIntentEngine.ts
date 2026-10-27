import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export interface SemanticIntentResult {
    matched: boolean;
    intentLabel: string;
    targetProducts: string[];
    targetCategories: string[];
    isOutOfCatalog: boolean;
    confidence: number;
}

// ── Out-of-Catalog Regex Patterns ──
export const OOC_PATTERNS = [
    /\b(iphone|ipad|macbook|samsung galaxy|pixel \d|android phone|phone case|airpods|laptop|computer)\b/i,
    /\b(car engine|engine oil|motor oil|brake pads|tire|car battery|5w30|10w40|car repair)\b/i,
    /\b(playstation|ps5|xbox|nintendo|gaming console|controller|gpu|nvidia|rtx|graphics card)\b/i,
    /\b(airplane|flight ticket|hotel booking|train ticket|visa|passport|vacation trip)\b/i,
    /\b(cryptocurrency|bitcoin|ethereum|forex|stock trading)\b/i,
    /\b(real estate|apartment for rent|villa for sale|house property)\b/i,
];

interface IntentPattern {
    label: string;
    triggers: RegExp[];
    targetProducts: string[];
    categories: string[];
}

// ── Comprehensive Semantic Intent Ontology ──
const INTENT_PATTERNS: IntentPattern[] = [
    // ── HEALTH & SYMPTOM INTENTS ──
    {
        label: "Headache & Migraine Relief",
        triggers: [
            /\b(headache|headaches|migraine|migraines|head hurts|head hurting|head is hurting|forehead pain|throbbing head|tension headache)\b/i,
            /\b(sir dard|sard dard|sar dard|sir me dard|sar me dard|sir dard ki goli|sir dard ki dawai)\b/i,
        ],
        targetProducts: ['paracetamol', 'pain relief balm'],
        categories: ['Medicine & Health']
    },
    {
        label: "Fever & Viral Infection Relief",
        triggers: [
            /\b(fever|high fever|temperature|body fever|chills|shivering|feverish|viral fever)\b/i,
            /\b(bukhar|bukhar ki dawai|bukhar ki goli|tez bukhar|bukhar me kya le|bukhar ke liye)\b/i,
        ],
        targetProducts: ['paracetamol'],
        categories: ['Medicine & Health']
    },
    {
        label: "Sore Throat & Cough Relief",
        triggers: [
            /\b(sore throat|scratchy throat|dry throat|throat hurts|throat pain|throat infection|throat irritation|cough|coughing|strep throat)\b/i,
            /\b(gale me dard|gale me kharash|gala kharab|khansi|sukhi khansi|khansi ki dawai|gale ka dard)\b/i,
            /\b(sweet soothing liquid for dry sore throat|sweet for sore throat)\b/i
        ],
        targetProducts: ['cough drops', 'pure raw honey', 'vicks vaporub', 'ginger tea'],
        categories: ['Medicine & Health', 'Groceries & Gourmet']
    },
    {
        label: "Cold, Congestion & Flu Relief",
        triggers: [
            /\b(cold|flu|stuffy nose|blocked nose|runny nose|chest congestion|congestion|sinus|sneezing|nasal block|respiratory)\b/i,
            /\b(jukham|zukham|naak band|nazla|sardi jukham)\b/i,
        ],
        targetProducts: ['vicks vaporub', 'ginger tea', 'cough drops'],
        categories: ['Medicine & Health', 'Groceries & Gourmet']
    },
    {
        label: "Hydration, Electrolytes & Heat Relief",
        triggers: [
            /\b(dehydrated|dehydration|thirsty|extreme thirst|weakness|exhausted|fatigue|dizzy|dizziness|fainting|low energy|heat stroke|heat exhaustion|summer heat|sun stroke|lost fluids|instant energy)\b/i,
            /\b(kamzori|chakkar|kamzori lag rahi|pani ki kami|dhoop se thakan|thakavat|thakan|energy drink)\b/i,
        ],
        targetProducts: ['electrolyte powder', 'pure raw honey'],
        categories: ['Medicine & Health', 'Groceries & Gourmet']
    },
    {
        label: "Eye Strain, Vision & Optical Care",
        triggers: [
            /\b(eye strain|tired eyes|dry eyes|burning eyes|screen fatigue|cant see clearly|cant see text|blurry reading|reading small letters|blurred vision|trouble reading|reading essentials|spectacles|spects|glasses|reading glasses)\b/i,
            /\b(chasma|chashma|aankh me dard|aankhon me jalan|padhne ke liye chasma|aankh ki dawai)\b/i,
        ],
        targetProducts: ['spects', 'lubricant eye drops'],
        categories: ['Eyewear & Optical', 'Medicine & Health']
    },
    {
        label: "Hair, Scalp & Dandruff Care",
        triggers: [
            /\b(hair wash|itchy scalp|flaky scalp|dandruff|anti-dandruff|oily scalp|scalp infection|hair fall|greasy hair|hair cleanser|hair care)\b/i,
            /\b(baal dhone ka|baal dhona|dandruff ka ilaj|shampoo|sir me khujli)\b/i,
        ],
        targetProducts: ['shampoo'],
        categories: ['Personal Care & Hygiene']
    },
    {
        label: "Skin Cleansing & Bathing",
        triggers: [
            /\b(body wash|shower gel|bathing|soap|bath soap|skin cleanser|refreshing shower|moisturizing bath)\b/i,
            /\b(nahane ka sabun|nahane ke liye|sabun|body wash)\b/i,
        ],
        targetProducts: ['herbal body wash'],
        categories: ['Personal Care & Hygiene']
    },

    // ── CULINARY, MEALS & GROCERY INTENTS ──
    {
        label: "Breakfast & Morning Essentials",
        triggers: [
            /\b(breakfast|morning breakfast|morning meal|healthy breakfast|high protein breakfast|quick breakfast|breakfast items|breakfast food)\b/i,
            /\b(subah ka nasta|nasta|nashta|subah ka khana|breakfast ka saman)\b/i,
        ],
        targetProducts: ['farm fresh eggs', 'whole wheat bread', 'amul butter', 'amul doodh', 'greek yogurt'],
        categories: ['Dairy & Breakfast']
    },
    {
        label: "Italian Dinner & Pasta Night",
        triggers: [
            /\b(italian dinner|pasta dinner|pasta night|lasagna|spaghetti|macaroni|dinner with cheese|italian food|pasta with cheese|italian sauce)\b/i,
            /\b(pasta banana|italian khana)\b/i,
        ],
        targetProducts: ['fresh pasta', 'tomato sauce', 'mozzarella cheese', 'extra virgin olive oil'],
        categories: ['Groceries & Gourmet']
    },
    {
        label: "Dairy, Probiotics & Gut Health",
        triggers: [
            /\b(dairy|dairy products|probiotic|probiotics|gut health|cooling food for stomach|stomach cooling|curd|yogurt|dahi|calcium rich|fresh milk|pure milk)\b/i,
            /\b(doodh|dudh|dahi|makhan|pet thanda|pet kharab)\b/i,
        ],
        targetProducts: ['greek yogurt', 'amul doodh', 'amul butter', 'mozzarella cheese'],
        categories: ['Dairy & Breakfast', 'Groceries & Gourmet']
    },
    {
        label: "Tea & Warm Herbal Beverages",
        triggers: [
            /\b(tea|hot tea|milk tea|ginger tea|chai|herbal tea|warm beverage|hot drink|morning tea|evening tea|tea leaves)\b/i,
            /\b(chai patti|adrak chai|adrak wali chai|chai banane ka saman|garam chai)\b/i,
        ],
        targetProducts: ['ginger tea', 'amul doodh', 'pure raw honey'],
        categories: ['Groceries & Gourmet', 'Dairy & Breakfast']
    },
    {
        label: "Natural Honey & Sweeteners",
        triggers: [
            /\b(honey|pure honey|raw honey|organic honey|sweetener|natural sweetener|sweet soothing)\b/i,
            /\b(shahad|madhu|mitha madhu)\b/i,
        ],
        targetProducts: ['pure raw honey'],
        categories: ['Groceries & Gourmet']
    },
    {
        label: "Cooking Oils & Healthy Fats",
        triggers: [
            /\b(olive oil|cooking oil|extra virgin|frying oil|salad dressing|healthy oil)\b/i,
            /\b(khana banane ka tel|tel)\b/i,
        ],
        targetProducts: ['extra virgin olive oil', 'amul butter'],
        categories: ['Groceries & Gourmet', 'Dairy & Breakfast']
    },
    {
        label: "Spices & Fresh Chillies",
        triggers: [
            /\b(spicy|chillies|chili|mirchi|spices|hot spice|green chillies)\b/i,
        ],
        targetProducts: ['chillies', 'mirchi'],
        categories: ['Groceries & Gourmet', 'ingredient', 'reddish']
    }
];

export class SemanticIntentEngine {
    private cache = new Map<string, SemanticIntentResult>();
    private genAI: GoogleGenerativeAI | null = null;

    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
    }

    /**
     * Resolves the user's search query into semantic intent, target products, and categories.
     */
    public async analyzeIntent(rawQuery: string): Promise<SemanticIntentResult> {
        const query = (rawQuery || '').trim().toLowerCase();
        if (!query) {
            return {
                matched: false,
                intentLabel: 'Empty Query',
                targetProducts: [],
                targetCategories: [],
                isOutOfCatalog: false,
                confidence: 0
            };
        }

        // Check memory cache
        if (this.cache.has(query)) {
            return this.cache.get(query)!;
        }

        // 1. Out of Catalog Check
        for (const pattern of OOC_PATTERNS) {
            if (pattern.test(query)) {
                const oocResult: SemanticIntentResult = {
                    matched: true,
                    intentLabel: `Out-of-catalog request: "${rawQuery}"`,
                    targetProducts: [],
                    targetCategories: [],
                    isOutOfCatalog: true,
                    confidence: 1.0
                };
                this.cache.set(query, oocResult);
                return oocResult;
            }
        }

        // 2. Ontological Semantic Pattern Matching
        for (const intent of INTENT_PATTERNS) {
            for (const trigger of intent.triggers) {
                if (trigger.test(query)) {
                    const result: SemanticIntentResult = {
                        matched: true,
                        intentLabel: intent.label,
                        targetProducts: intent.targetProducts,
                        targetCategories: intent.categories,
                        isOutOfCatalog: false,
                        confidence: 0.95
                    };
                    this.cache.set(query, result);
                    return result;
                }
            }
        }

        // 3. Fallback: Check if query contains combinations of semantic tokens
        const tokens = query.split(/\s+/).filter(t => t.length > 2);
        for (const intent of INTENT_PATTERNS) {
            let matchedTokenCount = 0;
            for (const t of tokens) {
                if (intent.triggers.some(trig => trig.test(t))) {
                    matchedTokenCount++;
                }
            }
            if (matchedTokenCount >= 2 || (tokens.length === 1 && matchedTokenCount === 1)) {
                const result: SemanticIntentResult = {
                    matched: true,
                    intentLabel: intent.label,
                    targetProducts: intent.targetProducts,
                    targetCategories: intent.categories,
                    isOutOfCatalog: false,
                    confidence: 0.85
                };
                this.cache.set(query, result);
                return result;
            }
        }

        const defaultResult: SemanticIntentResult = {
            matched: false,
            intentLabel: `Search for "${rawQuery}"`,
            targetProducts: [],
            targetCategories: [],
            isOutOfCatalog: false,
            confidence: 0.3
        };
        this.cache.set(query, defaultResult);
        return defaultResult;
    }
}

export const semanticIntentEngine = new SemanticIntentEngine();
