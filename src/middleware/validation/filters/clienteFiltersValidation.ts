import { query } from 'express-validator';

export const validateClienteFilters = [
    query('page')
        .optional()
        .toInt()
        .isInt({ min: 1 }).withMessage('precioMin debe ser un número positivo mayor a 0'),

    query('sort')
        .optional()
        .isIn([]).withMessage('sort debe ser "precio-asc", "precio-desc" o "destacado"'),

    query()
        .custom(query => {
        const allowed = ['page', 'sort']
        const extraKeys = Object.keys(query).filter(key => !allowed.includes(key))

        if (extraKeys.length) {
            throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
        }

        return true
    })
];