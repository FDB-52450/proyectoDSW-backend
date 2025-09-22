import { body } from 'express-validator'

export const validateBan = [
    body('duracion')
        .custom((value) => {
            if (value != null) {
                const num = parseInt(value)

                if (!isNaN(num) && num > 0) {
                    return true
                } else {
                    throw new Error('La duración debe ser un número positivo mayor a 0 o null')
                }
            }

            return true
        }),

    body('razon')
        .trim()
        .notEmpty().withMessage('La razon de suspension es obligatoria').bail()
        .isLength({ max: 100 }).withMessage('La razon de suspension  no puede tener más de 50 caracteres'),
    
    body().custom(body => {
        const allowed = ['duracion', 'razon']
        const extraKeys = Object.keys(body).filter(key => !allowed.includes(key))

        if (extraKeys.length) {
            throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
        }

        return true
    })
]