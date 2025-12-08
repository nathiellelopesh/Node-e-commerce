import express from 'express';
import productRoutes from './routes/ProductRoutes.js';
import authRoutes from './routes/UserRoutes.js';
import cartRoutes from './routes/CartRoutes.js'
import favoriteRoutes from './routes/FavoriteRoutes.js'
import salesRoutes from './routes/SalesRoutes.js'
import reportRoutes from './routes/ReportRoutes.js'
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3030;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use('/products', productRoutes);

app.use('/users', authRoutes);

app.use('/cart', cartRoutes);

app.use('/favorites', favoriteRoutes);

app.use('/sales', salesRoutes)

app.use('/metrics', reportRoutes)

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});