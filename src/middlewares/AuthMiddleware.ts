import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authentication.js';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        is_seller: boolean;
    }
}

console.log("MÓDULO AUTH MIDDLEWARE CARREGADO");

/**
Middleware para verificar a autenticação via token JWT.
O Token é esperado no formato: Authorization: Bearer <token>
 */
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    console.log("Header Authorization recebido:", req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log("Token extraído:", token);
    }

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const user = await AuthService.getUserByToken(token);

        console.log("Status de busca do usuário (AuthService):", user ? 'Encontrado' : 'Não Encontrado ou Inválido');

        if (!user) {
            return res.status(401).json({ message: 'Token inválido ou expirado.' });
        }

        console.log("Valor de is_seller no objeto 'user' (após getUserByToken):", user.is_seller);

        req.user = { 
            id: user.id,
            email: user.email || '',
            is_seller: user.is_seller
        };

        console.log("req.user ANEXADO (ID e is_seller):", req.user.id, " - ", req.user.is_seller);

        next();

    } catch (error) {
        console.error("Erro no middleware de autenticação:", error);
        return res.status(401).json({ message: 'Acesso não autorizado.' });
    }
};