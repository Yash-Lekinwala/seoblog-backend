import express from 'express';
import { adminMiddileware, requireSignIn } from '../controllers/auth.js';
import { create, list, read, remove } from '../controllers/tag.js';
import { runValidation } from "../validators/index.js";
import { tagCreateValidator } from '../validators/tag.js';

const router = express.Router();

router.post('/tag', tagCreateValidator, runValidation, requireSignIn, adminMiddileware, create);
router.get('/tags', list);
router.get('/tag/:slug', read);
router.delete('/tag/:slug', requireSignIn, adminMiddileware, remove);

export default router;