import { Router } from 'express';
import {
    getAllContent,
    getPendingContent,
    approveContent,
    rejectContent
} from '../controllers/principal.controller.js';
import { authMiddleware, isPrincipal } from '..//middlewares/auth.middleware.js';

const router = Router()

// Apply security: Must be logged in AND must be a Principal
router.use(authMiddleware, isPrincipal)

router.get('/', getAllContent)              // GET /content
router.get('/pending', getPendingContent)   // GET /content/pending
router.post('/:id/approve', approveContent) // POST /content/:id/approve
router.post('/:id/reject', rejectContent)   // POST /content/:id/reject

export default router;