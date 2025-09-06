import { body } from 'express-validator';

export const validateCategoria = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio').bail()
        .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres'),

    body('duracionGar')
        .toInt()
        .isInt({ min: 1}).withMessage('La duracion de la garantia debe ser un número entero no negativo mayor a 0'),

    body('stockLimit')
        .toInt()
        .isInt({ min: 1}).withMessage('El limite de stock debe ser un número entero no negativo mayor a 0'),
  
    body().custom(body => {
        const allowed = ['nombre', 'duracionGar', 'stockLimit']
        const extraKeys = Object.keys(body).filter(key => !allowed.includes(key))

        if (extraKeys.length) {
        throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
        }

        return true
    })
]