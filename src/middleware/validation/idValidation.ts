import { param } from 'express-validator';

export const validateId = [
    param('id')
      .toInt()
      .isInt({ min: 1 }).withMessage('El ID debe ser un número positivo mayor a 0'),
];