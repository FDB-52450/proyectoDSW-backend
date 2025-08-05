import { fileTypeFromBuffer } from 'file-type';
import { Request, Response, NextFunction } from 'express';

const maxFileSizeMB = 5;
const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp'];

export async function validateImagen(req: Request, res: Response, next: NextFunction) {
    try {
        const files = []
        const validatedImages = []

        if (req.file) {
            files.push(req.file);
        } else if (Array.isArray(req.files)) {
            files.push(...req.files);
        }

        for (const file of files) {
            const fileType = await fileTypeFromBuffer(file.buffer);
            const fileSizeMB = file.size / (1024 * 1024)

            if (fileSizeMB > maxFileSizeMB) {
                res.status(400).json({ error: `La imagen '${file.originalname}' excede el tamaño máximo de ${maxFileSizeMB}MB.` })
                return
            }

            if (!fileType || !allowedFileTypes.includes(fileType.mime)) {
                res.status(400).json({ error: `El archivo '${file.originalname}' no es un tipo de imagen permitido.` })
                return
            }

            validatedImages.push(file)
        }

        if (req.file) {
            req.body.imagen = validatedImages[0]
        } else if (Array.isArray(req.files) && req.files.length > 0) {
            req.body.imagenes = validatedImages
        }

        next()
    }
    catch {
        res.status(500).json({ error: 'Error interno al validar las imágenes.' })
        return
    }
}