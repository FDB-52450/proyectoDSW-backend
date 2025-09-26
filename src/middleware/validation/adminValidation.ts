import { body } from 'express-validator';

export function validateAdmin(mode = "create") {
    const isUpdate = (mode === "update")

    const validations = [
        body('nombre')
            .if((value, { req }) => {return !isUpdate || req.body.nombre !== undefined})
            .trim()
            .notEmpty().withMessage('El nombre es obligatorio').bail()
            .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres'),

        body('password')
            .if((value, { req }) => {return !isUpdate || req.body.password !== undefined})
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
 
    if (isUpdate) {
        validations.push(
            body()
            .custom(body => {
                const allowedFields = ['nombre', 'password']

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