import type { Response } from 'express';
import prisma from '../config/db.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { uploadToSupabase } from '../utils/supabaseStorage.js';

export const uploadContent = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, subject, startTime, endTime, duration } = req.body
        const file = req.file

        if (!file) return res.status(400).json({ message: "File is required" })
        if (!req.user) return res.status(401).json({ message: "Unauthorized" })


        const start = startTime ? new Date(startTime.toString().trim()) : null
        const end = endTime ? new Date(endTime.toString().trim()) : null

        // if the dates are actually valid
        if ((startTime && isNaN(start?.getTime() ?? 0)) || (endTime && isNaN(end?.getTime() ?? 0))) {
            return res.status(400).json({
                message: "Invalid date format. Please use ISO format (YYYY-MM-DDTHH:mm:ssZ)"
            })
        }

        // Upload file to Supabase
        const { url, path } = await uploadToSupabase(file)

        // Content Entry
        const content = await prisma.content.create({
            data: {
                title: title.trim(),
                description: description ? description.trim() : null,
                subject: subject.trim(),
                fileUrl: url,
                filePath: path,
                fileType: file.mimetype,
                fileSize: file.size,
                status: 'pending',
                uploadedById: req.user.id,
                startTime: start,
                endTime: end,
            }
        })

        let slot = await prisma.contentSlot.findFirst({ where: { subject } })
        if (!slot) {
            slot = await prisma.contentSlot.create({ data: { subject } })
        }


        const scheduleCount = await prisma.contentSchedule.count({ where: { slotId: slot.id } })

        await prisma.contentSchedule.create({
            data: {
                contentId: content.id,
                slotId: slot.id,
                rotationOrder: scheduleCount + 1,
                duration: parseInt(duration) || 5, // Default 5 mins if not provided
            }
        })

        res.status(201).json({ message: "Content uploaded and pending approval", content })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

export const getMyContent = async (req: AuthRequest, res: Response) => {
    try {
        const contents = await prisma.content.findMany({
            where: { uploadedById: req.user?.id as string },
            include: { schedules: true },
            orderBy: { createdAt: 'desc' }
        })
        res.json(contents)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

export const getContentById = async (req: AuthRequest, res: Response) => {
    try {
        const content = await prisma.content.findUnique({
            where: { id: req.params.id as string },
            include: { uploadedBy: { select: { name: true, email: true } } }
        });
        if (!content) return res.status(404).json({ message: "Content not found" })
        res.json(content)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}