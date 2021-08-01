import { check } from "express-validator";

export const tagCreateValidator = [
    check('name').isLength({min:3}).withMessage('Name must be 3 characters or more.')
]
