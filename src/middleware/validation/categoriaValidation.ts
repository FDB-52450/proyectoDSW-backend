import { body } from 'express-validator';

export function validateCategoria(mode = "create") {
    const isUpdate = (mode === "update")

    const validations = [
        body('nombre')
            .if((value, { req }) => {return !isUpdate || req.body.nombre !== undefined})
            .trim()
            .notEmpty().withMessage('El nombre es obligatorio').bail()
            .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres'),

        body('duracionGarantia')
            .if((value, { req }) => {return !isUpdate || req.body.duracionGarantia !== undefined})
            .toInt()
            .isInt({ min: 1}).withMessage('La duracion de la garantia debe ser un número entero no negativo mayor a 0'),

        body('stockLimit')
            .if((value, { req }) => {return !isUpdate || req.body.stockLimit !== undefined})
            .toInt()
            .isInt({ min: 1}).withMessage('El limite de stock debe ser un número entero no negativo mayor a 0'),
    
        body().custom(body => {
            const allowed = ['nombre', 'duracionGarantia', 'stockLimit']
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
                const allowedFields = ['nombre', 'duracionGarantia', 'stockLimit']

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