export interface CatalogProductSeed {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    keywords: string[];
    similarTo: string[];
}

export const PRODUCTION_CATALOG: CatalogProductSeed[] = [
    // ── Dairy & Breakfast ──
    {
        name: 'amul doodh',
        description: 'Pasteurized homogenized fresh toned milk, rich in calcium and protein.',
        price: 20,
        category: 'Dairy & Breakfast',
        stock: 50,
        keywords: ['milk', 'doodh', 'dairy', 'fresh milk', 'calcium', 'beverage', 'tea ingredient', 'coffee ingredient', 'amul'],
        similarTo: ['milk', 'dairy', 'doodh', 'breakfast', 'curd', 'butter'],
    },
    {
        name: 'amul butter',
        description: 'Pure salted dairy butter made from fresh cream, ideal for toast and cooking.',
        price: 58,
        category: 'Dairy & Breakfast',
        stock: 40,
        keywords: ['butter', 'dairy', 'makhan', 'toast', 'cooking', 'amul', 'fat', 'breakfast'],
        similarTo: ['butter', 'dairy', 'milk', 'breakfast', 'bread'],
    },
    {
        name: 'farm fresh eggs',
        description: 'Pack of 6 farm-fresh grade-A brown eggs, rich in natural protein.',
        price: 48,
        category: 'Dairy & Breakfast',
        stock: 35,
        keywords: ['eggs', 'egg', 'anda', 'protein', 'breakfast', 'farm fresh', 'poultry'],
        similarTo: ['eggs', 'breakfast', 'protein', 'omelette', 'bread'],
    },
    {
        name: 'whole wheat bread',
        description: 'Freshly baked 100% whole wheat sliced bread with high dietary fiber.',
        price: 45,
        category: 'Dairy & Breakfast',
        stock: 30,
        keywords: ['bread', 'wheat bread', 'toast', 'bakery', 'roti', 'sandwich', 'breakfast'],
        similarTo: ['bread', 'bakery', 'breakfast', 'butter', 'eggs'],
    },
    {
        name: 'greek yogurt',
        description: 'Thick and creamy plain greek yogurt, rich in gut-friendly probiotics.',
        price: 85,
        category: 'Dairy & Breakfast',
        stock: 25,
        keywords: ['yogurt', 'curd', 'dahi', 'greek yogurt', 'probiotic', 'dairy', 'breakfast'],
        similarTo: ['curd', 'dahi', 'yogurt', 'dairy', 'milk'],
    },

    // ── Pharmacy & Healthcare ──
    {
        name: 'paracetamol',
        description: 'Paracetamol 650mg fast-acting tablets for fever reduction, headache, and body aches.',
        price: 32,
        category: 'Medicine & Health',
        stock: 100,
        keywords: ['paracetamol', 'crocin', 'dolo', 'calpol', 'fever', 'headache', 'pain relief', 'sard dard', 'bukhar', 'bukhar ki dawai', 'medicine', 'otc'],
        similarTo: ['paracetamol', 'fever', 'headache', 'pain relief', 'crocin', 'medicine'],
    },
    {
        name: 'vicks vaporub',
        description: 'Multi-symptom relief ointment with menthol, camphor, and eucalyptus oil for cold, cough, and nasal congestion.',
        price: 85,
        category: 'Medicine & Health',
        stock: 60,
        keywords: ['vicks vaporub', 'vicks', 'vaporub', 'cold', 'cough', 'congestion', 'runny nose', 'stuffy nose', 'chest rub', 'inhaler', 'balm'],
        similarTo: ['vicks', 'cold', 'cough', 'vaporub', 'medicine', 'congestion'],
    },
    {
        name: 'cough drops',
        description: 'Honey lemon soothing lozenges for rapid relief from sore throat, tickly cough, and irritation.',
        price: 35,
        category: 'Medicine & Health',
        stock: 80,
        keywords: ['cough drops', 'strepsils', 'lozenges', 'sore throat', 'cough', 'throat pain', 'gale me dard', 'honey lemon', 'gargle'],
        similarTo: ['cough drops', 'sore throat', 'throat relief', 'cough', 'medicine'],
    },
    {
        name: 'electrolyte powder',
        description: 'WHO-formula Oral Rehydration Salts (ORS) orange flavored drink for dehydration, recovery, and fatigue.',
        price: 25,
        category: 'Medicine & Health',
        stock: 90,
        keywords: ['electrolyte powder', 'ors', 'electral', 'dehydration', 'weakness', 'hydration', 'energy', 'fluids', 'glucose', 'fatigue'],
        similarTo: ['electrolyte', 'hydration', 'ors', 'energy', 'dehydrated'],
    },
    {
        name: 'pain relief balm',
        description: 'Herbal active pain relief balm for intense headaches, migraines, and muscular tension.',
        price: 55,
        category: 'Medicine & Health',
        stock: 50,
        keywords: ['balm', 'tiger balm', 'amrutanjan', 'headache', 'migraine', 'pain balm', 'sir dard', 'sard dard'],
        similarTo: ['balm', 'headache', 'pain relief', 'medicine'],
    },

    // ── Groceries & Cooking Ingredients ──
    {
        name: 'fresh pasta',
        description: 'Handcrafted artisan Italian durum wheat fresh penne pasta, cooks in 4 minutes.',
        price: 130,
        category: 'Groceries & Gourmet',
        stock: 45,
        keywords: ['pasta', 'fresh pasta', 'penne', 'spaghetti', 'macaroni', 'italian', 'dinner', 'noodles', 'lasagna', 'pazta'],
        similarTo: ['pasta', 'italian', 'dinner', 'sauce', 'lasagna'],
    },
    {
        name: 'tomato sauce',
        description: 'Slow-simmered classic Italian pasta sauce made with San Marzano tomatoes, garlic, and fresh basil.',
        price: 89,
        category: 'Groceries & Gourmet',
        stock: 55,
        keywords: ['tomato sauce', 'pasta sauce', 'sauce', 'pizza sauce', 'puree', 'italian', 'basil', 'ketchup', 'tomto sause'],
        similarTo: ['tomato sauce', 'pasta', 'sauce', 'italian', 'dinner'],
    },
    {
        name: 'ginger tea',
        description: 'Aromatic whole-leaf black tea infused with dried crushed ginger and warming cardamom.',
        price: 110,
        category: 'Groceries & Gourmet',
        stock: 65,
        keywords: ['ginger tea', 'tea', 'chai', 'chai patti', 'adrak chai', 'gingr tea', 'beverage', 'hot drink', 'cold relief'],
        similarTo: ['tea', 'chai', 'ginger', 'beverage', 'honey'],
    },
    {
        name: 'pure raw honey',
        description: '100% pure organic wildflower raw honey, natural antibacterial sweetener for teas and remedies.',
        price: 195,
        category: 'Groceries & Gourmet',
        stock: 50,
        keywords: ['honey', 'madhu', 'mitha madhu', 'shahad', 'raw honey', 'sweetener', 'organic', 'sore throat remedy'],
        similarTo: ['honey', 'madhu', 'sweetener', 'ginger tea', 'sore throat'],
    },
    {
        name: 'mozzarella cheese',
        description: 'Fresh shredded mozzarella cheese with high meltability for pizzas, lasagna, and pasta bakes.',
        price: 145,
        category: 'Groceries & Gourmet',
        stock: 30,
        keywords: ['mozzarella', 'cheese', 'paneer', 'pizza cheese', 'dairy', 'pasta cheese', 'lasagna ingredient'],
        similarTo: ['cheese', 'dairy', 'pasta', 'lasagna', 'pizza'],
    },
    {
        name: 'extra virgin olive oil',
        description: 'Cold-pressed extra virgin olive oil for Italian cooking, dressings, and sautés.',
        price: 240,
        category: 'Groceries & Gourmet',
        stock: 25,
        keywords: ['olive oil', 'cooking oil', 'oil', 'extra virgin', 'italian', 'dressing', 'healthy oil'],
        similarTo: ['oil', 'cooking oil', 'pasta', 'italian'],
    },

    // ── Personal Care & Hygiene ──
    {
        name: 'shampoo',
        description: 'Gentle sulfate-free anti-dandruff daily cleansing hair wash shampoo with tea tree oil.',
        price: 180,
        category: 'Personal Care & Hygiene',
        stock: 45,
        keywords: ['shampoo', 'hair wash', 'hair care', 'baal dhone ka', 'scalp', 'anti-dandruff', 'cleanser', 'bath'],
        similarTo: ['shampoo', 'hair wash', 'personal care', 'hygiene'],
    },
    {
        name: 'herbal body wash',
        description: 'Moisturizing aloe vera and neem body wash gel for complete daily shower hygiene.',
        price: 165,
        category: 'Personal Care & Hygiene',
        stock: 35,
        keywords: ['body wash', 'shower gel', 'soap', 'sabun', 'bathing', 'hygiene', 'skin cleanser'],
        similarTo: ['body wash', 'soap', 'bath', 'hygiene', 'personal care'],
    },

    // ── Optical & Daily Essentials ──
    {
        name: 'spects',
        description: 'Lightweight anti-glare blue-light filtering reading glasses/spectacles for digital screens and reading.',
        price: 499,
        category: 'Eyewear & Optical',
        stock: 30,
        keywords: ['spects', 'glasses', 'spectacles', 'chasma', 'reading glasses', 'eyewear', 'optical', 'eye strain', 'vision', 'frames', 'specks'],
        similarTo: ['spects', 'glasses', 'chasma', 'eyewear', 'optical', 'reading essentials'],
    },
    {
        name: 'lubricant eye drops',
        description: 'Soothing preservative-free eye lubricant drops for digital screen fatigue, dry eyes, and eye strain.',
        price: 120,
        category: 'Medicine & Health',
        stock: 40,
        keywords: ['eye drops', 'tears', 'dry eyes', 'eye strain', 'tired eyes', 'optical care', 'refresh'],
        similarTo: ['eye drops', 'spects', 'eye strain', 'medicine', 'optical'],
    },
];
