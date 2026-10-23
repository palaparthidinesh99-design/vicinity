import { Request, Response } from 'express';
import { searchProductsByIntent } from '../graph/graphService';
import { Product } from '../models/product.model';

interface ProductResult {
    productId: string;
    name: string;
    price: number;
    shopName: string;
    shopId: string;
    distance?: number; // km, if buyer location provided
    stock?: number;
}

export const graphSearch = async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.q as string || '').trim();
    const buyerLat = req.query.lat ? Number(req.query.lat) : null;
    const buyerLng = req.query.lng ? Number(req.query.lng) : null;

    if (!query) {
        res.status(200).json({ intent: 'Please provide a search query', products: [] });
        return;
    }

    try {
        let graphProductNames: string[] = [];
        let intent = `Results for "${query}"`;

        // 1. Try Neo4j graph intent search safely (non-blocking if Neo4j is paused or offline)
        try {
            const graphResult = await searchProductsByIntent(query);
            if (graphResult && Array.isArray(graphResult.products) && graphResult.products.length > 0) {
                graphProductNames = graphResult.products;
                if (graphResult.intent) {
                    intent = graphResult.intent;
                }
            }
        } catch (graphError) {
            console.warn('Neo4j graph search offline/unavailable, falling back to database search:', graphError);
        }

        // 2. Build MongoDB query conditions
        // Search by:
        // - Graph product names (if any matched)
        // - Direct match on product name, category, description, keywords
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const queryRegex = new RegExp(escapedQuery, 'i');
        const tokens = query.split(/\s+/).filter(t => t.length > 1);

        const orConditions: any[] = [
            { name: queryRegex },
            { category: queryRegex },
            { description: queryRegex },
            { keywords: queryRegex },
            { similarTo: queryRegex },
        ];

        if (graphProductNames.length > 0) {
            orConditions.push({ name: { $in: graphProductNames } });
        }

        tokens.forEach(tok => {
            const tokRegex = new RegExp(tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            orConditions.push({ name: tokRegex });
            orConditions.push({ category: tokRegex });
            orConditions.push({ keywords: tokRegex });
            orConditions.push({ similarTo: tokRegex });
        });

        // 3. Fetch products from MongoDB
        const mongoProducts = await Product.find({
            $or: orConditions,
            stock: { $gt: 0 },
        }).populate('shop', 'name address location isOpen');

        // 4. Build enriched product list with shop info + distance
        const enriched: ProductResult[] = [];
        for (const p of mongoProducts) {
            const shop = p.shop as any;
            // Skip only if shop does not exist or is explicitly closed
            if (!shop || shop.isOpen === false) continue;

            let distance: number | undefined;
            if (buyerLat != null && buyerLng != null && shop.location?.coordinates && shop.location.coordinates.length >= 2) {
                const [shopLng, shopLat] = shop.location.coordinates;
                distance = haversineKm(buyerLat, buyerLng, shopLat, shopLng);
            }

            enriched.push({
                productId: p._id.toString(),
                name: p.name,
                price: p.price,
                shopName: shop.name || 'Local Shop',
                shopId: shop._id.toString(),
                distance,
                stock: p.stock || 0,
            });
        }

        // 5. Deduplicate: if same product at same price from multiple shops,
        //    keep only the nearest shop's entry
        const deduped = deduplicateProducts(enriched);

        // 6. Sort: nearest first (if distance available), then by name
        deduped.sort((a, b) => {
            if (a.distance != null && b.distance != null) return a.distance - b.distance;
            return a.name.localeCompare(b.name);
        });

        res.status(200).json({
            intent,
            products: deduped,
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(200).json({
            intent: `Results for "${query}"`,
            products: [],
        });
    }
};

/**
 * Deduplicate products: if same name + same price exists from multiple shops,
 * keep only the one from the nearest shop (or first found if no distance).
 * If prices differ, keep both (buyer sees both options).
 */
function deduplicateProducts(products: ProductResult[]): ProductResult[] {
    const map = new Map<string, ProductResult>(); // key: "name|price"

    for (const p of products) {
        const key = `${p.name.toLowerCase().trim()}|${p.price}`;
        const existing = map.get(key);
        if (!existing) {
            map.set(key, p);
        } else {
            // Keep the one from the nearer shop
            if (p.distance != null && existing.distance != null) {
                if (p.distance < existing.distance) {
                    map.set(key, p);
                }
            }
        }
    }

    return Array.from(map.values());
}

/**
 * Haversine distance between two lat/lng points, in km.
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}
