import { Product } from '../models/Product.js';
import {save, update, drop, get, list} from './supabase.js'
import { supabase } from './supabase.js';

const PRODUCT_TABLE = 'Products';

//supabase gera id e createdAt
type ProductCreateData = Omit<Product, 'id' | 'createdAt'>;

export class ProductService {

    public static async createOne(product: ProductCreateData): Promise<Product> {
        const addedProducts = await save<Product, ProductCreateData>(PRODUCT_TABLE, product);
        const newProduct = addedProducts[0];

        if (!newProduct) {
            throw new Error("Falha ao criar o produto. Nenhum item retornado.");
        }
        return newProduct;
    }

    public static async createMany(newProducts: ProductCreateData[]): Promise<Product[]> {
        const addedProducts = await save<Product, ProductCreateData>(PRODUCT_TABLE, newProducts);
        return addedProducts;
    }

    public static async findBySellerId(sellerId: string): Promise<Product[]> {
         const { data, error } = await supabase
            .from(PRODUCT_TABLE)
            .select('*')
            .eq('profile_id', sellerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao buscar produtos por vendedor:", error);
            throw error;
        }
        return data as Product[] || [];
    }

    public static async findAllProducts(productName?: string): Promise<Product[]> {

        let query = supabase
            .from(PRODUCT_TABLE)
            .select('*')
            .order('created_at', { ascending: false });

        if (productName) {
            console.log(`Filtro aplicado: nome = ${productName}`);
            // Usa 'ilike' para busca parcial e case-insensitive (ignorando maiúsculas/minúsculas)
            query = query.ilike('name', `%${productName}%`); 
        }

        const { data, error } = await query;

        if (error) {
            console.error("Erro ao buscar produtos:", error);
            throw error;
        }
        return data as Product[] || [];
        /*
        const { data, error } = await supabase
            .from(PRODUCT_TABLE)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao buscar produtos:", error);
            throw error;
        }
        return data as Product[] || [];
        */
    }

    public static async findProductById(productId: string): Promise<Product | undefined> {
        const {data, error} = await supabase
            .from(PRODUCT_TABLE)
            .select('*')
            .eq('id', productId) //filtra pelo id
            .single(); //unico registro
        
        if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "No rows found"
            console.error('Erro ao buscar produto no Supabase:', error);
            throw new Error('Erro de serviço ao buscar produto.'); 
        }

        if (!data) {
            return undefined;
        }

        return data as Product;
    }

    public static async update(id: string, updatedFields: Partial<ProductCreateData>, sellerId: string): Promise<Product | undefined> {
        const [updatedProduct] = await update<Product, Partial<ProductCreateData>>(
            PRODUCT_TABLE, 
            updatedFields, 
            id, 
            { profile_id: sellerId }
        );
        return updatedProduct;
    }

    public static async delete(id: string, sellerId: string): Promise<boolean> {
        const { error, status } = await drop(PRODUCT_TABLE, id, { profile_id: sellerId });
        
        if (error) {
            console.error("Erro ao excluir no Supabase:", error);
            return false;
        }
        return status === 204;
    }
}