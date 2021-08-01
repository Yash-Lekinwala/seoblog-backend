import { check } from "express-validator";

export const userSignUpValidator = [
    check('name').isLength({min:3}).withMessage('Name must be 3 characters or more.'),
    check('email').isEmail().withMessage('Email address must be valid.'),
    check('password').isLength({min:6}).withMessage('Password must be 6 characters or more.')
];

export const userSignInValidator = [
    check('email').isEmail().withMessage('Email address must be valid.'),
    check('password').isLength({min:6}).withMessage('Password must be 6 characters or more.')
];

export const forgotPasswordValidator = [
    check('email').isEmail().withMessage('Email address must be valid.')
];

export const resetPasswordValidator = [
    check('newPassword').isLength({min:6}).withMessage('Password must be 6 characters or more.')
];


