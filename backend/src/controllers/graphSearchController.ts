import { Request, Response } from 'express';
import { hybridSearchService } from '../services/hybridSearchService';

export const graphSearch = async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.q as string || '').trim();
    const buyerLat = req.query.lat ? Number(req.query.lat) : null;
    const buyerLng = req.query.lng ? Number(req.query.lng) : null;

    if (!query) {
        res.status(200).json({ intent: 'Please provide a search query', products: [] });
        return;
    }

    try {
        const searchResult = await hybridSearchService.search(query, buyerLat, buyerLng);

        res.status(200).json({
            intent: searchResult.intent,
            products: searchResult.products,
            totalMatches: searchResult.totalMatches,
            isOutOfCatalog: searchResult.isOutOfCatalog,
            latencyMs: searchResult.latencyMs,
        });
    } catch (error) {
        console.error('Search error in graphSearchController:', error);
        res.status(200).json({
            intent: `Results for "${query}"`,
            products: [],
            totalMatches: 0,
            isOutOfCatalog: false,
        });
    }
};
