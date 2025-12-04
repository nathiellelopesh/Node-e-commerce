import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService.js';
import { Worker } from 'worker_threads';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProductController {

    public static createProduct(req: Request, res: Response) {
        try {
            const productData = req.body;
            const newProduct = ProductService.createOne(productData);
            return res.status(201).json(newProduct);
        } catch (error) {
            return res.status(400).json({ message: "Erro ao criar produto." });
        }
    }

    public static uploadCsv(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ message: "Nenhum arquivo CSV encontrado." });
        }

        const filePath = req.file.path;

        const worker = new Worker(
            path.resolve(__dirname, '../services/CsvProcessorWorker.ts'), 
            {
                workerData: { filePath },
                execArgv: ['--loader', 'ts-node/esm'],
            }
        );

        worker.on('message', async (result) => {
            if (result.status === 'done') {
                const addedProducts = await ProductService.createMany(result.products);
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
            message: "Upload aceito. Processamento em massa iniciado em background.",
            filename: req.file.originalname
        });
    }

    public static async getProducts(req: Request, res: Response) {
        console.log("Acessando produtos pelo GET:")
        try {
            const products = await ProductService.findAll(); 
            return res.json(products);
        
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            return res.status(500).json({ message: "Erro interno ao buscar produtos." });
        }
    }

    public static async updateProduct(req: Request, res: Response) {
        const id = req.params.id;
        const updatedData = req.body;

        if (!id) {
        return res.status(400).json({ message: "ID do produto é obrigatório." });
    }

        try {
            const updatedProduct = await ProductService.update(id, updatedData);

            if (!updatedProduct) {
                return res.status(404).json({ message: `Produto com ID ${id} não encontrado.` });
            }

            return res.json(updatedProduct);
        } catch (error) {
            console.error("Erro ao atualizar produto:", error);
            return res.status(500).json({ message: "Erro interno ao atualizar produto." });
        }
    }

    public static async deleteProduct(req: Request, res: Response) {
        const id = req.params.id;

        if (!id) {
        return res.status(400).json({ message: "ID do produto é obrigatório." });
    }

        try {
            const deleted = await ProductService.delete(id);

            if (!deleted) {
                return res.status(404).json({ message: `Produto com ID ${id} não encontrado.` });
            }

            return res.status(204).send(); 
        } catch (error) {
            console.error("Erro ao excluir produto:", error);
            return res.status(500).json({ message: "Erro interno ao excluir produto." });
        }
    }
}