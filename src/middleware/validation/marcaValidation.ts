import { body } from 'express-validator';

export function validateMarca(mode = "create") {
  const isUpdate = (mode === "update")

  const validations = [
    body('nombre')
      .if((value, { req }) => {return !isUpdate || req.body.nombre !== undefined})
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio').bail()
      .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres'),

    body('keepImage')
      .if(() => isUpdate)
      .optional()
      .toBoolean()
      .isBoolean().withMessage('El campo destacado debe ser "true" o "false"'),
           
    body().custom(body => {
      const allowed = isUpdate ? ['nombre', 'keepImage', 'imagen'] : ['nombre', 'imagen', 'keepImage']
      const extraKeys = Object.keys(body).filter(key => !allowed.includes(key))

      if (extraKeys.length) {
        throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
      }

      return true
    })
  ]

  return validations
}