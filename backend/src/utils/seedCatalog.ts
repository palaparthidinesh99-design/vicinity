import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Shop } from '../models/shop.model';
import { Product } from '../models/product.model';
import User from '../models/user.model';
import { PRODUCTION_CATALOG } from './catalogData';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export async function syncProductionCatalog(): Promise<{ inserted: number; updated: number; total: number }> {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGO_URI is missing');
    }

    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(mongoUri);
    }

    // 1. Ensure at least one verified active merchant shop exists
    let shop = await Shop.findOne({ isOpen: true });
    if (!shop) {
        let seller = await User.findOne({ role: 'seller' });
        if (!seller) {
            seller = await User.create({
                name: 'Neighborhood Mart',
                email: 'merchant@vicinity.local',
                password: 'Password@123',
                role: 'seller',
            });
        }
        shop = await Shop.create({
            name: 'Vicinity SuperStore & Pharmacy',
            owner: seller._id,
            location: {
                type: 'Point',
                coordinates: [75.8205, 26.8627], // Default neighborhood coordinates
            },
            address: 'Main Market Square, Sector 4',
            isOpen: true,
            rating: 4.8,
            ratingCount: 124,
        });
    }

    let inserted = 0;
    let updated = 0;

    for (const item of PRODUCTION_CATALOG) {
        const existing = await Product.findOne({
            name: { $regex: new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });

        if (existing) {
            existing.description = item.description;
            existing.price = item.price;
            existing.category = item.category;
            existing.stock = item.stock;
            existing.keywords = Array.from(new Set([...(existing.keywords || []), ...item.keywords]));
            existing.similarTo = Array.from(new Set([...(existing.similarTo || []), ...item.similarTo]));
            if (!existing.shop) existing.shop = shop._id;
            await existing.save();
            updated++;
        } else {
            await Product.create({
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                shop: shop._id,
                stock: item.stock,
                keywords: item.keywords,
                similarTo: item.similarTo,
            });
            inserted++;
        }
    }

    const total = await Product.countDocuments();
    return { inserted, updated, total };
}

if (require.main === module) {
    syncProductionCatalog()
        .then(res => {
            console.log(`Catalog Sync Complete! Inserted: ${res.inserted}, Updated: ${res.updated}, Total: ${res.total}`);
            process.exit(0);
        })
        .catch(err => {
            console.error('Catalog Sync Failed:', err);
            process.exit(1);
        });
}
