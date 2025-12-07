import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { upload } from '../middlewares/UploadMiddleware.js';
import { protect } from '../middlewares/AuthMiddleware.js';

const router = Router();

router.use(protect);

router.post('/', ProductController.createProduct);

router.post('/upload-csv', upload.single('file'), ProductController.uploadCsv);

router.get('/inventory', ProductController.getProducts); 

router.get('/:id', ProductController.getProductById);

router.get('/', ProductController.getAllProducts)

router.put('/:id', ProductController.updateProduct); 

router.delete('/:id', ProductController.deleteProduct); 

export default router;