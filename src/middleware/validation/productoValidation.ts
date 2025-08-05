import { body } from 'express-validator';

export function validateProducto(mode = "create") {
  const isUpdate = (mode === "update")

  const validations = [
    body('nombre')
      .if(() => !isUpdate)
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio').bail()
      .isLength({ max: 100 }).withMessage('El nombre no puede tener más de 100 caracteres'),

    body('desc')
      .trim()
      .optional({ nullable: false, checkFalsy: false })
      .isLength({ max: 1000 }).withMessage('La descripción no puede tener más de 1000 caracteres'),

    body('precio')
      .if(() => !isUpdate)
      .notEmpty().withMessage('El precio es obligatorio').bail()
      .toInt()
      .isInt({ min: 0 }).withMessage('El precio debe ser un número positivo'),

    body('descuento')
      .optional({ nullable: false, checkFalsy: false })
      .toInt()
      .isInt({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0 y 100'),

    body('stock')
      .if(() => !isUpdate)
      .notEmpty().withMessage('El stock es obligatorio').bail()
      .toInt()
      .isInt({ min: 0 }).withMessage('El stock debe ser un número entero no negativo'),

    body('destacado')
      .optional({ nullable: false, checkFalsy: false })
      .toBoolean()
      .isBoolean().withMessage('El campo destacado debe ser "true" o "false"'),

    body('marcaId')
      .if(() => !isUpdate)
      .notEmpty().withMessage('El ID de la marca es obligatorio').bail()
      .toInt()
      .isInt({ min: 1 }).withMessage('El ID de la marca debe ser un número entero válido'),

    body('categoriaId')
      .if(() => !isUpdate)
      .notEmpty().withMessage('El ID de la categoría es obligatorio').bail()
      .toInt()
      .isInt({ min: 1 }).withMessage('El ID de la categoría debe ser un número entero válido'),

    body('imagesToRemove')
      .optional({ nullable: false, checkFalsy: false })
      .customSanitizer(value => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return [value];
        return [];
      })
      .isArray().withMessage('imagesToRemove debe ser un array'),

    body().custom(body => {
      const allowed = ['nombre', 'desc', 'precio', 'descuento', 'stock', 'destacado', 'marcaId', 'categoriaId', 'imagesToRemove', 'imagenes', 'imagen']
      const extraKeys = Object.keys(body).filter(key => !allowed.includes(key))

      if (extraKeys.length) {
        throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
      }

      return true
    })
  ]

  if (isUpdate) {
    validations.push(
      body().custom(body => {
        const allowedFields = [
          'nombre', 'desc', 'precio', 'descuento',
          'stock', 'destacado', 'marcaId', 'categoriaId', 'imagesToRemove', 'imagenes', 'imagen'
        ];

        if (!body || typeof body !== 'object') {
          throw new Error('Debe proporcionar al menos un campo para actualizar')
        }

        const hasValidField = Object.keys(body).some(key => allowedFields.includes(key))
        
        if (!hasValidField) {
          throw new Error('Debe proporcionar al menos un campo para actualizar')
        }
        
        return true;
      })
    );
  }

  return validations
}