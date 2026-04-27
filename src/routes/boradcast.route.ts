import Router from "express"
import { getLiveTeacherContent } from "../controllers/broadcasting.controller.js"

const router = Router()

router.get("/:teacherId", getLiveTeacherContent)

export default router