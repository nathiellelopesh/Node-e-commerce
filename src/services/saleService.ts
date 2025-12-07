import { supabase } from './supabase.js';

//DTO

interface CheckoutItem {
    product_id: string;
    quantity: number;
    unit_price_at_sale: number;
}

interface ProductDetails {
    id: string;
    name: string;
    price: number;
    image_url: string;
}

interface SaleItemWithProduct {
    quantity: number;
    unit_price_at_sale: number;
    product: ProductDetails[];
}

interface SaleWithDetails {
    id: string;
    customer_id: string;
    seller_id: string | null;
    totalAmount: number;
    status: string;
    saleDate: string; // Mapeado de 'created_at' na query
    sale_items: SaleItemWithProduct[]; // Itens aninhados
}

export class SaleService {
    public static async processSale(customerId: string, rawCartItems: CheckoutItem[]): Promise<any> {
        console.log(`Iniciando processamento de venda para o cliente: ${customerId}`);

        if (rawCartItems.length === 0) {
            throw new Error('A lista de itens para checkout está vazia.');
        }

        const itemsForRpc = rawCartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
        }));

        try {
            const { data, error } = await supabase.rpc('create_sale_transaction', {
                p_customer_id: customerId, 
                p_items: itemsForRpc,
            });

            if (error) {
                console.error("Erro na transação de venda (RPC):", error);
                
                if (error.message.includes('Estoque insuficiente')) {
                    throw new Error(error.message);
                }

                throw new Error(`Falha na finalização da compra. Detalhes: ${error.message}`);
            }

            if (!data || data.length === 0) {
                 throw new Error("Transação concluída, mas nenhum registro de venda foi retornado.");
            }

            console.log(`Venda finalizada com sucesso! Sale ID: ${data[0].sale_id}`);
            return data;

        } catch (error) {
            throw error;
        }
    }

    public static async findSalesByUserId(userId: string): Promise<SaleWithDetails[]> {
        const { data, error } = await supabase
            .from('sales')
            .select(`
                id,
                customer_id,
                seller_id,
                totalAmount,
                status,
                saleDate: created_at,
                sale_items ( 
                    quantity,
                    unit_price_at_sale: "unitPriceAtSale",
                    product: "Products" (
                        id,
                        name,
                        price,
                        image_url: image
                    )
                )
            `)
            .eq('customer_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao buscar vendas:", error);
            throw error;
        }

        return data as SaleWithDetails[] || [];
    }

}