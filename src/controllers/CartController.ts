import { Request, Response } from 'express';
import { CartService } from '../services/cartService.js';

const cartService = new CartService();

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

export class CartController {
    
    public static async addItem(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user?.id;
        const { product_id, quantity } = req.body; 

        if (!userId) {
             return res.status(401).json({ error: 'Não autorizado. Usuário não autenticado.' });
        }
        if (!product_id) {
            return res.status(400).json({ error: 'Product ID é obrigatório.' });
        }
        
        try {
            const quantityValue = quantity ? parseInt(quantity) : 1;
            
            const result = await cartService.addItemToCart(
                userId, 
                product_id, 
                quantityValue
            );
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    public static async getCart(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado. Usuário não autenticado.' });
        }
        
        try {
            const items = await cartService.getCartItems(userId!);
            return res.status(200).json({ userId, items });
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar o carrinho.' });
        }
    }

    public static async removeItem(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user?.id;
        const product_id = req.params.id;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado. Usuário não autenticado.' });
        }
        if (!product_id) {
            return res.status(400).json({ error: 'ProductID é obrigatório no parâmetro da rota.' });
        }

        try {
            await cartService.removeItem(userId, product_id);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao remover o item.' });
        }
    }

    public static async clearCart(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado. Usuário não autenticado.' });
        }

        try {
            await cartService.clearCart(userId!);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao limpar o carrinho.' });
        }
    }

    public static async updateItemQuantity(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user?.id;
        const product_id = req.params.id;
        const { quantity } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado. Usuário não autenticado.' });
        }
        if (!product_id || !quantity) {
            return res.status(400).json({ error: 'ID do produto e nova quantidade são obrigatórios.' });
        }
        
        try {
            const quantityValue = parseInt(quantity, 10);
            if (isNaN(quantityValue) || quantityValue <= 0) {
                return res.status(400).json({ error: 'A quantidade deve ser um número positivo válido.' });
            }

            const updatedItem = await cartService.updateQuantity(
                userId, 
                product_id, 
                quantityValue
            );

            return res.status(200).json(updatedItem);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

}