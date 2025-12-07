import { supabase } from './supabase.js';

export class ReportService {
    public static async getTotalRevenue(): Promise<number> {
        const { data, error } = await supabase.rpc('get_total_revenue');

        if (error) {
            console.error("Erro ao calcular o faturamento total:", error);
            throw error;
        }
        return data as number || 0;
    }

    public static async getTotalProductsSoldBySeller(): Promise<any[]> {
        const { data, error } = await supabase.rpc('get_products_sold_by_seller');
        
        if (error) {
            console.error("Erro ao buscar produtos vendidos por vendedor:", error);
            throw error;
        }
        
        return data || [];
    }

    public static async getBestSellingProduct(): Promise<any> {
       const { data, error } = await supabase.rpc('get_best_selling_product');

        if (error) {
            console.error("Erro ao buscar produto mais vendido:", error);
            throw error;
        }
        
        return data?.[0] || null;
    }
}