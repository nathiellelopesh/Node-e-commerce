import { Product } from '../models/Product.js';
import {save, update, drop, get, list} from './supabase.js'


const PRODUCT_TABLE = 'Products';

//let products: Product[] = [];
//let nextId = 1;

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

    public static async findAll(): Promise<Product[]> {
        return (await list(PRODUCT_TABLE)) as Product[];
    }

    public static async findById(id: string): Promise<Product | undefined> {
        return (await get(PRODUCT_TABLE, id)) as Product | undefined;
    }

    public static async update(id: string, updatedFields: Partial<ProductCreateData>): Promise<Product | undefined> {
        const [updatedProduct] = await update<Product, Partial<ProductCreateData>>(PRODUCT_TABLE, updatedFields, id);
        return updatedProduct;
    }

    public static async delete(id: string): Promise<boolean> {
        const { error, status } = await drop(PRODUCT_TABLE, id);
        
        if (error) {
            console.error("Erro ao excluir no Supabase:", error);
            return false;
        }
        return status === 204;
    }
}