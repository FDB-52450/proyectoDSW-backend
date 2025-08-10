import { body } from 'express-validator';

export function validateCliente(prefix = '', mode = 'create') {
    const isUpdate = (mode === "update")

    const validations = [    
        body(`${prefix}dni`)
            .if(() => !isUpdate)
            .trim()
            .notEmpty().withMessage('El DNI es obligatorio').bail()
            .matches(/^\d{7,8}$/).withMessage('DNI invalido'),

        body(`${prefix}nombre`)
            .if(() => !isUpdate)
            .trim()
            .notEmpty().withMessage('El nombre es obligatorio').bail()
            .isLength({ min: 2, max: 50 }).withMessage('El nombre no cumple con los estandares de longitud')
            .toLowerCase(),

        body(`${prefix}apellido`)
            .if(() => !isUpdate)
            .trim()
            .notEmpty().withMessage('El apellido es obligatorio').bail()
            .isLength({ min: 2, max: 50 }).withMessage('El apellido no cumple con los estandares de longitud')
            .toLowerCase(),

        body(`${prefix}email`)
            .if(() => !isUpdate)
            .trim()
            .isEmail().withMessage('El email debe ser valido').bail()
            .isLength({ max: 100 }).withMessage('El email no cumple con los estandares de longitud').bail()
            .normalizeEmail(),

        body(`${prefix}telefono`)
            .if(() => !isUpdate)
            .optional()
            .trim()
            .matches(/^(?:\+54\s?9\s?)(\d{2,4})[\s\-]*(\d{2,4})[\s\-]*(\d{4})$/).withMessage('Numero de telefono invalido'),

        body(`${prefix}provincia`)
            .if(() => !isUpdate)
            .trim()
            .notEmpty().withMessage('La provincia es requerida').bail()
            .isLength({ min: 2, max: 30 }).withMessage('La provincia no cumple con los estandares de longitud').bail()
            .toLowerCase(),

        body(`${prefix}ciudad`)
            .if(() => !isUpdate)
            .trim()
            .notEmpty().withMessage('La ciudad es requerida').bail()
            .isLength({ min: 2, max: 50 }).withMessage('La ciudad no cumple con los estandares de longitud').bail()
            .toLowerCase(),

        body(`${prefix}direccion`)
            .if(() => !isUpdate)
            .trim()
            .notEmpty().withMessage('La direccion es requerida').bail()
            .isLength({ min: 2, max: 100 }).withMessage('La direccion no cumple con los estandares de longitud').bail(),

        body(`${prefix}codigoPostal`)
            .if(() => !isUpdate)
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