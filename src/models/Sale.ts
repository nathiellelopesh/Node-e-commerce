export interface Sale {
    id: number;
    customerName: string;
    totalAmount: number;
    saleDate: Date;
    status: "Pendente" | "Concluída" | "Cancelada"
}