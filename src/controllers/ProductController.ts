import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService.js';
import { Worker } from 'worker_threads';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        is_seller: boolean;
        role?: 'customer' | 'seller'; 
    }
}

export class ProductController {

    public static async createProduct(req: AuthenticatedRequest, res: Response) {
        const sellerId = req.user?.id;
        const isSeller = req.user?.is_seller;

        console.log("Verificação de permissão para createProduct:");
        console.log("  - sellerId:", sellerId);
        console.log("  - isSeller:", isSeller);

    if (!sellerId || !isSeller) {
        console.error("ERRO 403: Acesso negado. Motivo: sellerId ou isSeller não está presente/true.");
        return res.status(403).json({ message: "Acesso negado. Apenas vendedores podem cadastrar produtos." });
    }

        try {
            const productData = req.body;

            const productToCreate: Omit<Product, 'id' | 'createdAt'> = {
                ...productData,
                profile_id: sellerId
            };

            const newProduct = await ProductService.createOne(productToCreate);
            return res.status(201).json(newProduct);
        } catch (error) {
            const errorMessage = (error as Error).message;
            return res.status(400).json({ message: `Erro ao criar produto: ${errorMessage}` });
        }
    }

    public static async uploadCsv(req: AuthenticatedRequest, res: Response) {
        const sellerId = req.user?.id; 

        const isSeller = (req.user as any)?.is_seller; 

        if (!sellerId || !isSeller) {
            return res.status(403).json({ message: "Acesso negado. Apenas vendedores podem realizar upload em massa." });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Nenhum arquivo CSV encontrado." });
        }

        const filePath = req.file.path;

        const worker = new Worker(
            path.resolve(__dirname, '../services/CsvProcessorWorker.ts'), 
            {
                workerData: { filePath, sellerId },
                execArgv: ['--loader', 'ts-node/esm'],
            }
        );

        worker.on('message', async (result) => {
            if (result.status === 'done') {
                const productsWithSellerId = result.products.map((p: any) => ({
                    ...p,
                    profile_id: sellerId,
                }));

                const addedProducts = await ProductService.createMany(productsWithSellerId);
                console.log(`Sucesso! ${addedProducts.length} produtos adicionados.`);
            } else if (result.status === 'error') {
                console.error('Erro no processamento do Worker:', result.message);
            }
            worker.terminate(); 
        });

        worker.on('error', (err) => {
            console.error('Erro fatal no Worker:', err);
        });

        return res.status(202).json({ 
            message: "Upload aceito. Processamento em massa iniciado.",
            filename: req.file.originalname
        });
    }

    public static async getProducts(req: AuthenticatedRequest, res: Response) {
        const sellerId = req.user?.id;       
        const isSeller = (req.user as any)?.is_seller;

        console.log("Verificação de permissão para getProducts (Inventário):");
        console.log("  - sellerId:", sellerId);
        console.log("  - isSeller:", isSeller);

        if (!sellerId || !isSeller) {
            console.error("ERRO 403: Inventário negado. Motivo: sellerId ou isSeller não está presente/true.");
            return res.status(403).json({ message: "Acesso negado. Apenas vendedores podem visualizar seu inventário." });
        }

        console.log(`Buscando produtos para o vendedor ID: ${sellerId}`);
        
        try {
            const products = await ProductService.findBySellerId(sellerId);
            return res.json(products);
        
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            return res.status(500).json({ message: "Erro interno ao buscar produtos." });
        }
    }

    public static async updateProduct(req: AuthenticatedRequest, res: Response) {
        const id = req.params.id;
        const updatedData = req.body;
        const sellerId = req.user?.id;
        const isSeller = (req.user as any)?.is_seller; 

        if (!sellerId || !isSeller) {
            return res.status(403).json({ message: "Acesso negado. Apenas vendedores podem realizar upload em massa." });
        }

        if (!id || !sellerId) {
            return res.status(400).json({ message: "ID do produto e autenticação são obrigatórios." });
        }
    
        try {
            const updatedProduct = await ProductService.update(id, updatedData, sellerId);

            if (!updatedProduct) {
                return res.status(404).json({ message: `Produto com ID ${id} não encontrado.` });
            }

            return res.json(updatedProduct);
        } catch (error) {
            console.error("Erro ao atualizar produto:", error);
            return res.status(500).json({ message: "Erro interno ao atualizar produto." });
        }
    }

    public static async deleteProduct(req: AuthenticatedRequest, res: Response) {
        const id = req.params.id;
        const sellerId = req.user?.id;

        const isSeller = (req.user as any)?.is_seller; 

        if (!sellerId || !isSeller) {
            return res.status(403).json({ message: "Acesso negado. Apenas vendedores podem excluir produtos." });
        }

        if (!id || !sellerId) {
            return res.status(400).json({ message: "ID do produto e autenticação são obrigatórios." });
        }

        try {
            const deleted = await ProductService.delete(id, sellerId);

            if (!deleted) {
                return res.status(404).json({ message: `Produto com ID ${id} não encontrado.` });
            }

            return res.status(204).send(); 
        } catch (error) {
            console.error("Erro ao excluir produto:", error);
            return res.status(500).json({ message: "Erro interno ao excluir produto." });
        }
    }

    public static async getAllProducts(req: AuthenticatedRequest, res: Response) {
        console.log(`Buscando todos os produtos.`);

        const filterProductName = req.query.name as string | undefined;

        console.log(`Buscando produtos. Filtro de nome: ${filterProductName || 'Nenhum'}`);
        
        try {
            const products = await ProductService.findAllProducts(filterProductName);
            return res.json(products);
        
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            return res.status(500).json({ message: "Erro interno ao buscar produtos." });
        }
    }

    public static async getProductById(req: AuthenticatedRequest, res: Response) {
        try {
            const productId = req.params.id;

            if (!productId) {
                return res.status(400).json({ message: 'ID do produto é obrigatório na rota.' });
            }

            const product = await ProductService.findProductById(productId);

            if (!product) {
                return res.status(404).json({ message: 'Produto não encontrado.' });
            }
            return res.status(200).json(product);
        } catch (error) {
            console.error('Erro no controller getProductById:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
}