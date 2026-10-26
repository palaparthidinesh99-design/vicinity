import { Request, Response } from 'express';
import { hybridSearchService } from '../services/hybridSearchService';

export const searchIntent = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = (req.query.q as string || '').trim();
        const buyerLat = req.query.lat ? Number(req.query.lat) : null;
        const buyerLng = req.query.lng ? Number(req.query.lng) : null;

        if (!query) {
            res.status(400).json({ message: 'Query parameter q is required' });
            return;
        }

        const searchResult = await hybridSearchService.search(query, buyerLat, buyerLng);

        const items = searchResult.products.map(p => {
            const estTimeMinutes = p.distance != null ? Math.max(10, Math.round(p.distance * 4 + 8)) : 15;
            return {
                id: p.productId,
                name: p.name,
                price: p.price,
                seller: p.shopName,
                time: `${estTimeMinutes} min`,
                stock: p.stock,
                distance: p.distance,
                category: p.category,
            };
        });

        const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
        const fastestDelivery = items.length > 0
            ? Math.min(...items.map(i => parseInt(i.time))) + ' min'
            : '15 min';

        res.status(200).json({
            intent: searchResult.intent,
            isOutOfCatalog: searchResult.isOutOfCatalog,
            totalMatches: searchResult.totalMatches,
            items,
            totalPrice,
            fastestDelivery,
            latencyMs: searchResult.latencyMs,
        });
    } catch (error) {
        console.error('searchIntent error:', error);
        res.status(500).json({ message: 'Failed to process intent search' });
    }
};
