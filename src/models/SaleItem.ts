export interface SaleItem {
    id: number;
    saleId: number; //chave estrangeira
    productId: number; //chave estrangeira
    quantity: number;
    unitPriceAtSale: number;
    subTotal: number;
}