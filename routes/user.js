import express from 'express';
import { authMiddileware, requireSignIn } from "../controllers/auth.js"; 
import { photo, publicProfile, read, update } from '../controllers/user.js';

const router = express.Router();

router.get('/user/profile', requireSignIn, authMiddileware, read);
router.get('/user/:username', publicProfile);
router.put('/user/update', requireSignIn, authMiddileware, update);
router.get('/user/photo/:username', photo);

export default router;