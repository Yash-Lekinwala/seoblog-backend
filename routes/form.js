import express from 'express';
import { contactBlogAuthorForm, contactForm } from '../controllers/form.js';
import { contactFormValidator } from '../validators/form.js';
import { runValidation } from "../validators/index.js";

const router = express.Router();

router.post('/contact', contactFormValidator, runValidation, contactForm);
router.post('/contact-blog-author', contactFormValidator, runValidation, contactBlogAuthorForm);

export default router;