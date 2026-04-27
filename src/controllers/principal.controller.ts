import type { Response } from 'express';
import prisma from '../config/db.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

// Get all content 
export const getAllContent = async (req: AuthRequest, res: Response) => {
    try {
        const content = await prisma.content.findMany({
            include: {
                uploadedBy: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(content)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

// 
export const getPendingContent = async (req: AuthRequest, res: Response) => {
    try {
        const pending = await prisma.content.findMany({
            where: { status: 'pending' },
            include: {
                uploadedBy: { select: { name: true } }
            }
        })
        res.json(pending)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

// 
export const approveContent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid ID" })
        }
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const updatedContent = await prisma.content.update({
            where: { id },
            data: {
                status: 'approved',
                approvedById: req.user?.id,
                approvedAt: new Date(),
                rejectionReason: null // Clear reason if it was previously rejected
            }
        })

        res.json({ message: "Content approved successfully", content: updatedContent })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

// 10. Reject content
export const rejectContent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body; // Expecting { "reason": "..." }

        if (!reason) {
            return res.status(400).json({ message: "Rejection reason is required" })
        }

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid ID" })
        }
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const updatedContent = await prisma.content.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectionReason: reason,
                approvedById: req.user?.id,
                approvedAt: new Date()
            }
        })

        res.json({ message: "Content rejected", content: updatedContent })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}