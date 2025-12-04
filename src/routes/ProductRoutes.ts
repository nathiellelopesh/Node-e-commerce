import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { upload } from '../middlewares/UploadMiddleware.js';

const router = Router();

router.post('/', ProductController.createProduct); //ok

router.post('/upload-csv', upload.single('file'), ProductController.uploadCsv); //ok

router.get('/', ProductController.getProducts); //ok

router.put('/:id', ProductController.updateProduct); //ok

router.delete('/:id', ProductController.deleteProduct); //ok

export default router;