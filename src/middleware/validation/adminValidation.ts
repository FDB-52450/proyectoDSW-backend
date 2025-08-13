import { body } from 'express-validator';

export const validateAdmin = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres'),

  body('password')
    .trim()
    .hide('******')
    .notEmpty().withMessage('La contraseña es obligatoria').bail()
    .isLength({ max: 50 }).withMessage('La contraseña no puede tener más de 50 caracteres'),
  
  body().custom(body => {
    const allowed = ['nombre', 'password']
    const extraKeys = Object.keys(body).filter(key => !allowed.includes(key))

    if (extraKeys.length) {
      throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
    }

    return true
  })
]