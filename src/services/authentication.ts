import { supabase } from './supabase.js';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User as LocalUser } from '../models/User.js';
import { ProductService } from './ProductService.js';

export const AuthService = {
    async registerUser(email: string, password: string, is_seller: boolean, name: string): Promise<SupabaseUser | null> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    is_seller: is_seller,
                    name: name
                }
            }
        });

        if (error) {
            console.error("Erro no registro:", error);
            throw new Error(error.message || 'Falha ao registrar usuário.');
        }

        const user = data.user;
        
        if (user) {
            console.log(`Auth User criado. ID: ${user.id}. Iniciando atualização do perfil...`);
            const { error: profileError } = await supabase
                .from('profiles') 
                .update({ 
                    name: name, 
                    is_seller: is_seller,
                    deletedAt: null
                })
                .eq('id', user.id)
                .select(); 

            if (profileError) {
                console.error("Erro ao atualizar perfil:", profileError);
                throw new Error('Falha ao finalizar o cadastro do perfil (Erro de atualização).');
            }
        }

        return user; 
    },

    async loginUser(email: string, password: string): Promise<{ session: Session; user: SupabaseUser & { is_seller: boolean, name: string | null, deletedAt: string | null } }> {
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

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, deletedAt')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("Erro ao buscar perfil:", profileError);
        }

        const is_seller = (user.user_metadata?.is_seller as boolean) || false;

        const userWithSellerAndProfile = { 
            ...user, 
            is_seller,
            name: profileData?.name || null,
            deletedAt: profileData?.deletedAt || null
        } as SupabaseUser & { is_seller: boolean, name: string | null, deletedAt: string | null };

        if (userWithSellerAndProfile.deletedAt) {
             await this.logoutUser();
             throw new Error('Conta desativada. Entre em contato com o suporte.');
        }

        return { session, user: userWithSellerAndProfile };
    },

    async logoutUser(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Erro no logout:", error);
            throw new Error('Falha ao encerrar a sessão.');
        }
    },

    async getUserByToken(access_token: string): Promise<LocalUser | null> {
        const { data: { user }, error } = await supabase.auth.getUser(access_token);

        if (error) {
            console.error("Erro ao validar token:", error.message);
            return null;
        }

        if (user) {
            const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('name, deletedAt')
                    .eq('id', user.id)
                    .single();
                
                if (profileError) {
                    console.warn("Aviso: Falha ao carregar perfil do usuário:", profileError.message);
                }

            if (profileData?.deletedAt) {
                return null;
            }

            const is_seller_value = (user.user_metadata?.is_seller as boolean) || false;
            
            return {
                id: user.id,
                email: user.email!, 
                is_seller: is_seller_value,
                name: profileData?.name || user.email!.split('@')[0],
                password_hash: '',
                createdAt: new Date(user.created_at!),
                deletedAt: profileData?.deletedAt || null,
            } as LocalUser;
        }
        return null;
    },

    async deactivateAccount(userId: string): Promise<void> {
        const now = new Date().toISOString();

        const { data, error: profileError } = await supabase
            .from('profiles')
            .update({ deletedAt: now })
            .eq('id', userId);

        if (profileError) {
            throw new Error('Falha ao desativar a conta do usuário.');
        }

        try {
            await ProductService.deactivateProductsBySeller(userId); 
            console.log(`Sucesso: Todos os produtos de ${userId} marcados como inativos.`);
        } catch (productError) {
            console.error("AVISO: Falha ao desativar produtos:", productError);
        }
        await this.logoutUser(); 
    }
};