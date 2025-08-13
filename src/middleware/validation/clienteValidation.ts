import { body } from 'express-validator';

export function validateCliente(prefix = '', mode = 'create') {
    const isUpdate = (mode === "update")

    const validations = [    
        body(`${prefix}dni`)
            .if((value, { req }) => {return !isUpdate || (prefix === '' ? req.body.dni !== undefined : req.body.cliente.dni !== undefined)})
            .trim()
            .notEmpty().withMessage('El DNI es obligatorio').bail()
            .matches(/^\d{7,8}$/).withMessage('DNI invalido'),

        body(`${prefix}nombre`)
            .if((value, { req }) => {return !isUpdate || (prefix === '' ? req.body.nombre !== undefined : req.body.cliente.nombre !== undefined)})
            .trim()
            .notEmpty().withMessage('El nombre es obligatorio').bail()
            .isLength({ min: 2, max: 50 }).withMessage('El nombre no cumple con los estandares de longitud')
            .toLowerCase(),

        body(`${prefix}apellido`)
            .if((value, { req }) => {return !isUpdate || (prefix === '' ? req.body.apellido !== undefined : req.body.cliente.apellido !== undefined)})
            .trim()
            .notEmpty().withMessage('El apellido es obligatorio').bail()
            .isLength({ min: 2, max: 50 }).withMessage('El apellido no cumple con los estandares de longitud')
            .toLowerCase(),

        body(`${prefix}email`)
            .if((value, { req }) => {return !isUpdate || (prefix === '' ? req.body.email !== undefined : req.body.cliente.email !== undefined)})
            .trim()
            .isEmail().withMessage('El email debe ser valido').bail()
            .isLength({ max: 100 }).withMessage('El email no cumple con los estandares de longitud').bail()
            .normalizeEmail(),

        body(`${prefix}telefono`)
            .if((value, { req }) => {return !isUpdate || (prefix === '' ? req.body.telefono !== undefined : req.body.cliente.telefono !== undefined)})
            .optional()
            .trim()
            .matches(/^(?:\+54\s?9\s?)(\d{2,4})[\s\-]*(\d{2,4})[\s\-]*(\d{4})$/).withMessage('Numero de telefono invalido'),

        body(`${prefix}provincia`)
            .if((value, { req }) => {return !isUpdate || (prefix === '' ? req.body.provincia !== undefined : req.body.cliente.provincia !== undefined)})
            .trim()
            .notEmpty().withMessage('La provincia es requerida').bail()
            .isLength({ min: 2, max: 30 }).withMessage('La provincia no cumple con los estandares de longitud').bail()
            .toLowerCase(),

        body(`${prefix}ciudad`)
            .if((value, { req }) => {return !isUpdate || (prefix === '' ? req.body.ciudad !== undefined : req.body.cliente.ciudad !== undefined)})
            .trim()
            .notEmpty().withMessage('La ciudad es requerida').bail()
            .isLength({ min: 2, max: 50 }).withMessage('La ciudad no cumple con los estandares de longitud').bail()
            .toLowerCase(),

        body(`${prefix}direccion`)
            .if((value, { req }) => {return !isUpdate || (prefix === '' ? req.body.direccion !== undefined : req.body.cliente.direccion !== undefined)})
            .trim()
            .notEmpty().withMessage('La direccion es requerida').bail()
            .isLength({ min: 2, max: 100 }).withMessage('La direccion no cumple con los estandares de longitud').bail(),

        body(`${prefix}codigoPostal`)
            .if((value, { req }) => {return !isUpdate || (prefix === '' ? req.body.codigoPostal !== undefined : req.body.cliente.codigoPostal !== undefined)})
            .trim()
            .notEmpty().withMessage('El codigo postal es requerido').bail()
            .matches(/^[A-Z]\d{4}[A-Z]{3}$|^\d{4}$/).withMessage('Codigo postal invalido')
            .toUpperCase(),
        
        body()
            .custom(body => {
                const allowed = ['dni', 'nombre', 'apellido', 'email', 'telefono', 'provincia', 'ciudad', 'direccion', 'codigoPostal']

                if (isUpdate) {
                    allowed.splice(0, 1)
                }

                const extraKeysBody = prefix == '' ? body : body.cliente
                const extraKeys = Object.keys(extraKeysBody).filter(key => !allowed.includes(key))

                if (extraKeys.length) {
                    console.log(extraKeysBody)
                    throw new Error(`Campos no válidos: ${extraKeys.join(', ')}`)
                }

                return true
            })
    ]

    
  if (isUpdate) {
        validations.push(
            body()
            .custom(body => {
                const allowedFields = ['dni', 'nombre', 'apellido', 'email', 'telefono', 'provincia', 'ciudad', 'direccion', 'codigoPostal']

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