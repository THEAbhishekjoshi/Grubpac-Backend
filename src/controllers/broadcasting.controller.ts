import type { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getLiveTeacherContent = async (req: Request, res: Response) => {
    try {
        const { teacherId } = req.params
        const now = new Date()


        if (!teacherId || Array.isArray(teacherId)) {
            return res.status(400).json({
                message: "Invalid teacherId"
            })
        }

        const activeContents = await prisma.content.findMany({
            where: {
                uploadedById: teacherId,
                status: 'approved',
                startTime: { lte: now },
                endTime: { gte: now },
            },
            include: {
                schedules: {
                    orderBy: { rotationOrder: 'asc' }
                }
            }
        })

        if (activeContents.length === 0) {
            return res.status(200).json({ message: "No content available" })
        }

        //  Group contents by Subject
        const subjectGroups: Record<string, any[]> = {}

        activeContents.forEach(content => {
            const subjectKey = content.subject


            if (!subjectGroups[subjectKey]) {
                subjectGroups[subjectKey] = []
            }


            const group = subjectGroups[subjectKey]
            if (group) {
                group.push(content)
            }
        })

        const liveBroadcast: Record<string, any> = {}

        //for each subject's rotation
        for (const subject in subjectGroups) {
            const contents = subjectGroups[subject] || []


            contents.sort((a, b) => (a.schedules[0]?.rotationOrder || 0) - (b.schedules[0]?.rotationOrder || 0));


            const totalCycleDuration = contents.reduce((acc, curr) => acc + (curr.schedules[0]?.duration || 5), 0);


            const currentMinutes = Math.floor(Date.now() / 60000)
            let timeInCycle = currentMinutes % totalCycleDuration


            let runningSum = 0
            let activeContent = contents[0]

            for (const item of contents) {
                const duration = item.schedules[0]?.duration || 5
                if (timeInCycle >= runningSum && timeInCycle < runningSum + duration) {
                    activeContent = item
                    break
                }
                runningSum += duration
            }

            liveBroadcast[subject] = {
                id: activeContent.id,
                title: activeContent.title,
                fileUrl: activeContent.fileUrl,
                subject: activeContent.subject,
                endsInMinutes: (runningSum + (activeContent.schedules[0]?.duration || 5)) - timeInCycle
            }
        }

        return res.json({
            teacherId,
            currentTime: now,
            liveContent: liveBroadcast
        })

    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}