export interface Sale {
    id: string;
    customer_id: string;
    seller_id: string;
    totalAmount: number;
    saleDate: Date;
    status: "Pendente" | "Concluída" | "Cancelada" | "Processando";
    created_at: Date;
}