import { body } from 'express-validator';

export function validateMarca(mode = "create") {
  const isUpdate = (mode === "update")

  const validations = [
    body('nombre')
      .if(() => !isUpdate)
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio').bail()
      .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres'),
    body('keepImage')
      .if(() => isUpdate)
      .optional({ nullable: false, checkFalsy: false })
      .toBoolean()
      .isBoolean().withMessage('El campo destacado debe ser "true" o "false"'),
  ]

  return validations
}