import { body } from 'express-validator';

export const validateCategoria = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio').bail()
        .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres'),
    
    body().custom(body => {
      const allowed = ['nombre']
      const extraKeys = Object.keys(body).filter(key => !allowed.includes(key))

      if (extraKeys.length) {
        throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
      }

      return true
    })
]