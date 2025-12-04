// src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/authentication.js';

export const AuthController = {
    async handleRegistration(req: Request, res: Response) {
        const { email, password, customer } = req.body;

        if (!email || !password || !customer) {
            return res.status(400).json({ message: "Email, senha e tipo são obrigatórios." });
        }

        try {
            const user = await AuthService.registerUser(email, password, customer);
            
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

            return res.status(200).json({
                message: "Login bem-sucedido.",
                access_token: session.access_token,
                user_id: user.id
            });

        } catch (error) {
            const errorMessage = (error as Error).message;
            // 401 (Unauthorized)
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

    async handleAccountDeactivation(req: Request, res: Response) {
        const { userId } = req.body; 

        if (!userId) {
            return res.status(400).json({ message: "O ID do usuário é obrigatório para desativar a conta." });
        }

        try {
            await AuthService.deactivateAccount(userId);            
            return res.status(200).json({ message: "Conta desativada com sucesso." });
        } catch (error) {
            const errorMessage = (error as Error).message;
            return res.status(500).json({ message: errorMessage });
        }
    },
};