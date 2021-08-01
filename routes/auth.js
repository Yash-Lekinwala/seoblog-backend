import express from 'express';
import { signup, signin, signout, forgotPassword, resetPassword, preSignup, googleLogin } from "../controllers/auth.js"; 

// validators
import {runValidation} from '../validators/index.js';
import {forgotPasswordValidator, resetPasswordValidator, userSignInValidator, userSignUpValidator} from '../validators/auth.js';

const router = express.Router();

router.post('/pre-signup', userSignUpValidator, runValidation, preSignup);
router.post('/signup', signup);
router.post('/signin', userSignInValidator, runValidation, signin);
router.get('/signout', signout);
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword);

//google login
router.post('/google-login', googleLogin);

export default router;