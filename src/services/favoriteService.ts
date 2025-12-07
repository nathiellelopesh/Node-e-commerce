import { FavoriteItemInsert, Favorites } from "../models/Favorites.js";
import { list, save, drop } from './supabase.js';

const TABLE_NAME = 'FavoriteItem';

export class FavoriteService {
    
    private async getExistingFavorite(userId: string, productId: string): Promise<Favorites | null> {
        const allItems = await list<Favorites>(TABLE_NAME);
        
        const existingItem = allItems.find(
            item => item.user_id === userId && item.product_id === productId
        );

        return existingItem || null;
    }

    public async addFavorite(userId: string, productId: string): Promise<Favorites> {
        const existingItem = await this.getExistingFavorite(userId, productId);

        if (existingItem) {
            return existingItem; 
        }

        const itemToSave: FavoriteItemInsert = {
            user_id: userId,
            product_id: productId,
        };
        
        const newItems = await save<Favorites, FavoriteItemInsert>(TABLE_NAME, itemToSave);

        if (newItems && newItems.length > 0) {
            return newItems[0]!;
        } else {
            throw new Error('Falha ao adicionar produto aos favoritos.');
        }
    }

    public async removeFavorite(userId: string, productId: string): Promise<void> {
        const existingItem = await this.getExistingFavorite(userId, productId);
        
        if (existingItem) {
            await drop(TABLE_NAME, existingItem.id, { user_id: userId });
        }
    }
    
    public async getFavorites(userId: string): Promise<Favorites[]> {
         const allItems = await list<Favorites>(TABLE_NAME);
         return allItems.filter(item => item.user_id === userId);
    }
}