import { query } from 'express-validator';

export const validateProductoFilters = [
  query('page')
    .optional({ nullable: false, checkFalsy: false })
    .toInt()
    .isInt({ min: 1 }).withMessage('precioMin debe ser un número positivo mayor a 0'),

  query('precioMin')
    .optional({ nullable: false, checkFalsy: false })
    .toInt()
    .isInt({ min: 0 }).withMessage('precioMin debe ser un número positivo'),

  query('precioMax')
    .optional({ nullable: false, checkFalsy: false })
    .toInt()
    .isInt({ min: 0 }).withMessage('precioMax debe ser un número positivo'),

  query('stockMin')
    .optional({ nullable: false, checkFalsy: false })
    .toInt()
    .isInt({ min: 0 }).withMessage('stockMin debe ser un número entero no negativo'),

  query('stockMax')
    .optional({ nullable: false, checkFalsy: false })
    .toInt()
    .isInt({ min: 0 }).withMessage('stockMax debe ser un número entero no negativo'),

  query('nombre')
    .optional({ nullable: false, checkFalsy: false })
    .isString().withMessage('nombre debe ser un texto'),

  query('destacado')
    .optional({ nullable: false, checkFalsy: false })
    .toBoolean()
    .isBoolean().withMessage('destacado debe ser "true" o "false"'),

  query('marca')
    .optional({ nullable: false, checkFalsy: false })
    .isString().withMessage('marca debe ser un texto'),

  query('categoria')
    .optional({ nullable: false, checkFalsy: false })
    .isString().withMessage('categoria debe ser un texto'),

  query('sort')
    .optional({ nullable: false, checkFalsy: false })
    .isIn(['precio-asc', 'precio-desc', 'destacado']).withMessage('sort debe ser "precio-asc", "precio-desc" o "destacado"'),

  query()
    .custom(query => {
      const allowed = ['precioMin', 'precioMax', 'stockMin', 'stockMax', 'nombre', 'destacado', 'marca', 'categoria', 'sort', 'page']
      const extraKeys = Object.keys(query).filter(key => !allowed.includes(key))

      if (extraKeys.length) {
          throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
      }

      return true
      })
];