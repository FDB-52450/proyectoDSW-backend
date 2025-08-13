import { query } from 'express-validator';

export const validateProductoFilters = [
  query('page')
    .optional()
    .toInt()
    .isInt({ min: 1 }).withMessage('precioMin debe ser un número positivo mayor a 0'),
  
  query('view')
    .optional()
    .isIn(['admin', 'view']).withMessage('Vista invalida.'),

  query('precioMin')
    .optional()
    .toInt()
    .isInt({ min: 0 }).withMessage('precioMin debe ser un número positivo'),

  query('precioMax')
    .optional()
    .toInt()
    .isInt({ min: 0 }).withMessage('precioMax debe ser un número positivo'),

  query('stockMin')
    .optional()
    .toInt()
    .isInt({ min: 0 }).withMessage('stockMin debe ser un número entero no negativo'),

  query('stockMax')
    .optional()
    .toInt()
    .isInt({ min: 0 }).withMessage('stockMax debe ser un número entero no negativo'),

  query('nombre')
    .optional()
    .isString().withMessage('nombre debe ser un texto'),

  query('destacado')
    .optional()
    .toBoolean()
    .isBoolean().withMessage('destacado debe ser "true" o "false"'),

  query('marca')
    .optional()
    .isString().withMessage('marca debe ser un texto'),

  query('categoria')
    .optional()
    .isString().withMessage('categoria debe ser un texto'),

  query('sort')
    .optional()
    .isIn(['precio-asc', 'precio-desc', 'destacado']).withMessage('sort debe ser "precio-asc", "precio-desc" o "destacado"'),

  query()
    .custom(query => {
      const allowed = ['precioMin', 'precioMax', 'stockMin', 'stockMax', 'nombre', 'destacado', 'marca', 'categoria', 
                       'sort', 'page', 'view']
      const extraKeys = Object.keys(query).filter(key => !allowed.includes(key))

      if (extraKeys.length) {
          throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
      }

      return true
      })
];