import { supabase } from './supabase.js';
import { User, Session } from '@supabase/supabase-js';

export const AuthService = {
    async registerUser(email: string, password: string, customer: boolean): Promise<User | null> {
        // O Supabase lida automaticamente com o hashing da senha
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    is_customer: customer 
                }
            }
        });

        if (error) {
            console.error("Erro no registro:", error);
            throw new Error(error.message || 'Falha ao registrar usuário.');
        }
        return data.user; 
    },

    async loginUser(email: string, password: string): Promise<{ session: Session; user: User }> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Erro no login:", error);
            throw new Error('Credenciais inválidas ou conta não confirmada.');
        }

        const { session, user } = data;

        if (!session || !user) {
             throw new Error('Falha ao criar sessão de usuário. Tente novamente.');
        }

        return { session, user };
    },

    async logoutUser(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Erro no logout:", error);
            throw new Error('Falha ao encerrar a sessão.');
        }
    },

    async getUserByToken(access_token: string): Promise<User | null> {
        
        const { data: { user }, error } = await supabase.auth.getUser(access_token);

        if (error) {
            console.error("Erro ao validar token:", error.message);
            return null;
        }
        return user;
    },

    async deactivateAccount(userId: string): Promise<void> {
        const now = new Date().toISOString();

        const { error: profileError } = await supabase
            .from('profiles') //tabela users
            .update({ deletedAt: now })
            .eq('id', userId);

        if (profileError) {
            console.error("Erro ao desativar conta (Soft Delete):", profileError);
            throw new Error('Falha ao desativar a conta do usuário.');
        }

        await this.logoutUser(); 
    },
};