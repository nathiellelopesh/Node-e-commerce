export interface User {
    id: string;
    email: string;
    password_hash: string;
    createdAt: Date,
    deletedAt: Date,
    customer: true
}