export interface SaleItem {
    id: string;
    sale_id: string; 
    product_id: string;
    quantity: number;
    unitPriceAtSale: number;
    subTotal: number;
    created_at: Date;
}