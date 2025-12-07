import { Request, Response } from 'express';
import { ReportService } from '../services/ReportService.js';

export class ReportController {

    public static async getSalesMetrics(req: Request, res: Response): Promise<Response> {
        try {
            const [totalRevenue, productsBySeller, bestSeller] = await Promise.all([
                ReportService.getTotalRevenue(),
                ReportService.getTotalProductsSoldBySeller(),
                ReportService.getBestSellingProduct(),
            ]);

            return res.status(200).json({
                totalRevenue,
                productsBySeller,
                bestSeller,
            });

        } catch (error) {
            console.error("Erro no ReportController:", error);
            return res.status(500).json({ error: 'Falha ao gerar relatórios de vendas.' });
        }
    }
}