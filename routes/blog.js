import express from 'express';
import { create, list, listAllBlogsCategoriesTags, listByUser, listRelated, listSearch, photo, read, remove, update } from "../controllers/blog.js"; 
import { adminMiddileware, authMiddileware, canUpdateDeleteBlog, requireSignIn } from '../controllers/auth.js';

const router = express.Router();

router.post('/blog', requireSignIn, adminMiddileware, create);
router.get('/blogs', list);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', requireSignIn, adminMiddileware, remove);
router.put('/blog/:slug', requireSignIn, adminMiddileware, update);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);
router.get('/blogs/blog-search', listSearch);

// auth user blog route
router.post('/user/blog', requireSignIn, authMiddileware, create);
router.delete('/user/blog/:slug', requireSignIn, authMiddileware, canUpdateDeleteBlog, remove);
router.put('/user/blog/:slug', requireSignIn, authMiddileware, canUpdateDeleteBlog, update);
router.get('/:username/blogs', listByUser);

export default router;