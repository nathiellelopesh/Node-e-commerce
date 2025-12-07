export interface Favorites {
    id: string;
    product_id: string;
    user_id: string;
    created_at: Date;
}

export type FavoriteItemInsert = Omit<Favorites, 'id' | 'created_at'>;