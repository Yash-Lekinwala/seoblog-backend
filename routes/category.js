import express from 'express';
import { adminMiddileware, requireSignIn } from '../controllers/auth.js';
import { create, list, read, remove } from '../controllers/category.js';
import { categoryCreateValidator } from '../validators/category.js';
import { runValidation } from "../validators/index.js";

const router = express.Router();

router.post('/category', categoryCreateValidator, runValidation, requireSignIn, adminMiddileware, create);
router.get('/categories', list);
router.get('/category/:slug', read);
router.delete('/category/:slug', requireSignIn, adminMiddileware, remove);

export default router;