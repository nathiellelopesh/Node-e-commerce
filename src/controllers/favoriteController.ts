import { Request, Response } from 'express';
import { FavoriteService } from '../services/favoriteService.js';

const favoriteService = new FavoriteService();

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

export class FavoriteController {
    public static async addFavorite(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user?.id;
        const { product_id } = req.body; 

        if (!userId) {
             return res.status(401).json({ error: 'Não autorizado. Usuário não autenticado.' });
        }
        if (!product_id) {
            return res.status(400).json({ error: 'Product ID é obrigatório.' });
        }
        
        try {
            const result = await favoriteService.addFavorite(userId, product_id);
            return res.status(201).json(result); 
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
    
    public static async removeFavorite(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user?.id;
        const product_id = req.params.id;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado. Usuário não autenticado.' });
        }
        if (!product_id) {
            return res.status(400).json({ error: 'ProductID é obrigatório no parâmetro da rota.' });
        }

        try {
            await favoriteService.removeFavorite(userId, product_id);
            return res.status(204).send(); 
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao remover o item dos favoritos.' });
        }
    }

    public static async getFavorites(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado. Usuário não autenticado.' });
        }

        try {
            const items = await favoriteService.getFavorites(userId!);
            return res.status(200).json(items);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar os favoritos.' });
        }
    }
}