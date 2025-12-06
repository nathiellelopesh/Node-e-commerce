import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { upload } from '../middlewares/UploadMiddleware.js';
import { protect } from '../middlewares/AuthMiddleware.js';

const router = Router();

router.use(protect);

router.post('/', ProductController.createProduct); //ok

router.post('/upload-csv', upload.single('file'), ProductController.uploadCsv); //ok

router.get('/inventory', ProductController.getProducts); //ok

router.get('/:id', ProductController.getProductById);

router.get('/', ProductController.getAllProducts)

router.put('/:id', ProductController.updateProduct); //ok

router.delete('/:id', ProductController.deleteProduct); //ok

export default router;