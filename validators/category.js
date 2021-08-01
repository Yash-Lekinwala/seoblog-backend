import { check } from "express-validator";

export const categoryCreateValidator = [
    check('name').isLength({min:3}).withMessage('Name must be 3 characters or more.')
]
