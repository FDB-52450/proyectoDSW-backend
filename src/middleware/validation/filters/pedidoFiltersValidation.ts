import { query } from 'express-validator';

export const validatePedidoFilters= [
    query('page')
        .optional()
        .toInt()
        .isInt({ min: 1 }).withMessage('precioMin debe ser un número positivo mayor a 0'),
    
    query('estado')
        .optional()
        .isIn(['pendiente', 'confirmado', 'cancelado']).withMessage('estado debe ser "true" o "false"')
        .toBoolean(),

    query('sort')
        .optional()
        .isIn(['precio-asc', 'precio-desc']).withMessage('sort debe ser "precio-asc" o "precio-desc"'),

    query()
        .custom(query => {
        const allowed = ['page', 'estado', 'sort']
        const extraKeys = Object.keys(query).filter(key => !allowed.includes(key))

        if (extraKeys.length) {
            throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
        }

        return true
    })
];