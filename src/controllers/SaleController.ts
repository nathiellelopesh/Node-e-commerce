import { Request, Response } from 'express';
import { SaleService } from '../services/saleService.js';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

export class SalesController {
    
    public static async createSale(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const customerId = req.user?.id;
        const { items } = req.body;

        if (!customerId) {
            return res.status(401).json({ error: 'Não autorizado. Usuário não autenticado.' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'O corpo da requisição deve conter itens para a venda.' });
        }

        try {
            const saleResult = await SaleService.processSale(customerId, items);

            return res.status(201).json(saleResult); 

        } catch (error: any) {
            if (error.message.includes('Estoque insuficiente')) {
                 return res.status(409).json({ error: error.message });
            }
            if (error.message.includes('não encontrado')) {
                 return res.status(404).json({ error: error.message });
            }

            return res.status(500).json({ error: 'Falha interna ao processar a venda.' });
        }
    }

    public static async getSalesByUserId(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado. Usuário não autenticado.' });
        }

        try {
            const sales = await SaleService.findSalesByUserId(userId);
            return res.status(200).json(sales);
            
        } catch (error: any) {
            console.error(`Erro ao buscar vendas do usuário ${userId}:`, error);
            return res.status(500).json({ error: 'Falha interna ao buscar o histórico de vendas.' });
        }
    }
}