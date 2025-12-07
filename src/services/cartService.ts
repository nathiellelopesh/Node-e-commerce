import { CartItem } from '../models/CartItem.js';
import { update, list, save, drop } from '../services/supabase.js';

const TABLE_NAME = 'CartItem';

type CartItemUpdate = Partial<Omit<CartItem, 'id' | 'user_id' | 'product_id' >>;
type CartItemInsert = Omit<CartItem, 'id' | 'created_at'>;

export class CartService {
    private async getExistingItem(userId: string, productId: string): Promise<CartItem | null> {
        const allItems = await list<CartItem>(TABLE_NAME);
        
        const existingItem = allItems.find(
            item => item.user_id === userId && item.product_id === productId
        );

        return existingItem || null;
    }

    public async addItemToCart(
        userId: string, 
        productId: string, 
        quantityToAdd: number = 1
    ): Promise<CartItem> {
        if (quantityToAdd <= 0) {
            throw new Error('A quantidade deve ser maior que zero.');
        }

        const existingItem = await this.getExistingItem(userId, productId);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantityToAdd;
            const now = new Date();
            
            const updateData: CartItemUpdate = {
                quantity: newQuantity
            };
            const updatedItems = await update<CartItem, CartItemUpdate>(
                TABLE_NAME, 
                updateData, 
                existingItem.id,
                { user_id: userId, product_id: productId } 
            );

            if (updatedItems && updatedItems.length > 0) {
                return updatedItems[0]!;
            } else {
                 throw new Error('Falha ao atualizar o item no carrinho.');
            }

        } else {
            const itemToSave: CartItemInsert = {
                user_id: userId,
                product_id: productId,
                quantity: quantityToAdd,
            };
            
            const newItems = await save<CartItem, CartItemInsert>(TABLE_NAME, itemToSave);

            if (newItems && newItems.length > 0) {
                return newItems[0]!;
            } else {
                throw new Error('Falha ao adicionar novo item ao carrinho.');
            }
        }
    }

    public async getCartItems(userId: string): Promise<CartItem[]> {
        const allItems = await list<CartItem>(TABLE_NAME);
        return allItems.filter(item => item.user_id === userId);
    }

    public async removeItem(userId: string, productId: string): Promise<void> {
        const existingItem = await this.getExistingItem(userId, productId);
        
        if (existingItem) {
            await drop(TABLE_NAME, existingItem.id, { user_id: userId });
        }
    }

    public async clearCart(userId: string): Promise<void> {
        const userItems = await this.getCartItems(userId);
        
        for (const item of userItems) {
             await drop(TABLE_NAME, item.id, { user_id: userId });
        }
    }

    public async updateQuantity(userId: string, productId: string, newQuantity: number): Promise<CartItem> {
        if (newQuantity <= 0) {
            throw new Error('A nova quantidade deve ser maior que zero.');
        }

        const existingItem = await this.getExistingItem(userId, productId);

        if (!existingItem) {
            throw new Error('Item não encontrado no carrinho.');
        }

        const updateData: CartItemUpdate = {quantity: newQuantity};
        
        const updatedItems = await update<CartItem, CartItemUpdate>(
            TABLE_NAME, 
            updateData, 
            existingItem.id,
            { user_id: userId, product_id: productId } 
        );

        if (updatedItems && updatedItems.length > 0) {
            return updatedItems[0]!;
        } else {
            throw new Error('Falha ao atualizar a quantidade do item.');
        }
    }
}