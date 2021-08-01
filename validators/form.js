import { check } from "express-validator";

export const contactFormValidator = [
    check('name').isLength({min:3}).withMessage('Name must be 3 characters or more.'),
    check('email').isEmail().withMessage('Email must be valid.'),
    check('message').isLength({min:20}).withMessage('Message must be 20 characters or more.'),
]
