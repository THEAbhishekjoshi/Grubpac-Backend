import { Router } from 'express';
import multer from 'multer';
import { uploadContent, getMyContent, getContentById } from '../controllers/content.controller.js';
import { authMiddleware, isTeacher } from '../middlewares/auth.middleware.js';
import type { Request, Response, NextFunction } from "express"

const router = Router()

// Multer Configuration for Validation
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB Limit
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.'))
        }
    }
})


const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: "File is too large. Max limit is 10MB" })
            }
            return res.status(400).json({ message: err.message })
        } else if (err) {
            return res.status(400).json({ message: err.message })
        }
        next()
    })
}



// All routes here require being a Teacher
router.use(authMiddleware)

router.post('/', isTeacher, uploadMiddleware, uploadContent)
router.get('/my', isTeacher, getMyContent)
router.get('/:id', getContentById)

export default router