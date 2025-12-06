import { parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import csv from 'csv-parser';
import { Product } from '../models/Product.js';

const filePath = workerData.filePath;
const sellerId = workerData.sellerId;
const processedProducts: Omit<Product, 'id' | 'createdAt'>[] = [];

fs.createReadStream(filePath)
    .pipe(csv({
        separator: ',',
        skipComments: true,
        headers: ['name', 'description', 'price', 'stock', 'createdAt', 'image'],
    }))
    .on('data', (data) => {
        const productData: Omit<Product, 'id' | 'createdAt'> = {
            name: data.name,
            description: data.description,
            price: parseFloat(data.price),
            stock: parseInt(data.stock, 10),
            image: data.image || null,
            profile_id: sellerId,
        };
        processedProducts.push(productData);
    })
    .on('end', () => {
        console.log(`Worker: Leitura de ${processedProducts.length} produtos concluída.`);
        if (parentPort) {
            console.log('Worker: Enviando os primeiros 2 produtos:', processedProducts.slice(0, 2));
            parentPort.postMessage({ status: 'done', products: processedProducts });
        }
        fs.unlinkSync(filePath);
    })
    .on('error', (err) => {
        if (parentPort) {
            parentPort.postMessage({ status: 'error', message: err.message });
        }
        fs.unlinkSync(filePath);
    });