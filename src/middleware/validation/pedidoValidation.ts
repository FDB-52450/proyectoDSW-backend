import { body } from "express-validator";
import { validateCliente } from "./clienteValidation.js";

export function validatePedido(mode = "create") {
    const isUpdate = (mode === "update")
    const isValidate = (mode === "validate")

    const validations = [
      body('tipoEntrega')
        .if((value, { req }) => {return !isUpdate || req.body.tipoEntrega !== undefined})
        .isIn(['retiro', 'envio']).withMessage('El tipoEntrega debe ser "retiro" o "envio".'),

      body('tipoPago')
        .if((value, { req }) => {return !isUpdate || req.body.tipoPago !== undefined})
        .isIn(['efectivo', 'credito']).withMessage('El tipoPago debe ser "efectivo" o "credito".'),

      body('fechaEntrega')
        .if(() => isUpdate)
        .optional()
        .isISO8601().withMessage('La fechaEntrega debe ser una fecha valida.')
        .toDate(),

      body('detalle')
        .if(() => !isUpdate)
        .isArray({ min: 1 }).withMessage('El detalle debe ser un array no vacio.')
        .custom((detalle) => {
            for (const item of detalle) {
              if (typeof item !== 'object' || !('productoId' in item) || !('cantidad' in item) ||
                typeof item.productoId !== 'number' || typeof item.cantidad !== 'number' || item.cantidad < 0
              ) {
                throw new Error('El detalle especificado es invalido.');
              }
            }
            return true;
        }),
    
      body('estado')
        .if(() => isUpdate)
        .optional()
        .isIn(['confirmado', 'cancelado']).withMessage('El estado debe ser "confirmado" o "enviado".'),
    
      body().custom(body => {
        let allowed: string[] = []

        switch (mode) {
            case "create": allowed = ['tipoEntrega', 'tipoPago', 'detalle', 'cliente']
            case "validate": allowed = ['tipoEntrega', 'tipoPago', 'estado']
            case "update": allowed = ['tipoEntrega', 'tipoPago', 'fechaEntrega', 'detalle']
            default: allowed = ['tipoEntrega', 'tipoPago', 'detalle', 'cliente']
        }

        const extraKeys = Object.keys(body).filter(key => !allowed.includes(key))

        if (extraKeys.length) {
            throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
        }

        return true
        })
    ]

    if (!(isUpdate || isValidate)) validations.push(...validateCliente('cliente.'))

    if (isUpdate) {
        validations.push(
            body().custom(body => {
              const allowedFields = ['tipoEntrega', 'tipoPago', 'fechaEntrega', 'estado']

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