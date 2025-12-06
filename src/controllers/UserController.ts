import { Request, Response } from 'express';
import { AuthService } from '../services/authentication.js';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware.js'

export const AuthController = {
    async handleRegistration(req: Request, res: Response) {
        const { email, password, is_seller, name } = req.body;

        if (!email || !password || typeof is_seller === 'undefined' || !name) {
            return res.status(400).json({ message: "Email, senha, nome e tipo são obrigatórios." });
        }

        try {
            const user = await AuthService.registerUser(email, password, is_seller, name);
            
            if (user) {
                return res.status(201).json({ 
                    message: "Usuário registrado com sucesso.",
                    userId: user.id
                });
            }

        } catch (error) {
            const errorMessage = (error as Error).message;
            return res.status(400).json({ message: errorMessage });
        }
    },
    
    async handleLogin(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }

        try {
            const { session, user } = await AuthService.loginUser(email, password);

            console.log(user)

            return res.status(200).json({
                message: "Login bem-sucedido.",
                access_token: session.access_token,
                user_id: user.id,
                is_seller: user.is_seller,
                name: user.name, 
                deleted_at: user.deletedAt
            });

        } catch (error) {
            const errorMessage = (error as Error).message;
            return res.status(401).json({ message: errorMessage });
        }
    },

    async handleLogout(req: Request, res: Response) {
        try {
            await AuthService.logoutUser();         
            return res.status(200).json({ message: "Sessão encerrada com sucesso." });
        } catch (error) {
            const errorMessage = (error as Error).message;
            return res.status(500).json({ message: `Falha no logout: ${errorMessage}` });
        }
    },

    async handleAccountDeactivation(req: AuthenticatedRequest, res: Response) {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({ message: "O ID do usuário é obrigatório para desativar a conta." });
        }

        try {
            await AuthService.deactivateAccount(userId);            
            return res.status(204).json({ message: "Conta desativada com sucesso." });
        } catch (error) {
            const errorMessage = (error as Error).message;
            console.error("Erro na desativação de conta:", errorMessage);
            return res.status(500).json({ message: errorMessage });
        }
    },
};