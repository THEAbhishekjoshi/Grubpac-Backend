import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import authRoutes from './routes/auth.routes.js';
import contentRoutes from './routes/content.routes.js'
import principalRoutes from './routes/principal.route.js'
import broadcastingRoutes from './routes/boradcast.route.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// middleware
app.use(cors())
app.use(express.json())

// Rate Limiting Configuration
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, // limit each IP to 100 requests per windowMs
    message: { message: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
})

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hr
    max: 20, // limit each IP to 20 login/register attempts per hour
    message: { message: "Too many authentication attempts, please try again after an hour" },
    standardHeaders: true,
    legacyHeaders: false,
})

app.get("/", (req, res) => {
    res.send("API is running 🙆‍♂️")
})

// Auth Routes
app.use('/auth', authLimiter, authRoutes)
app.use('/content/teacher', contentRoutes)


app.use('/content/live', publicLimiter, broadcastingRoutes)
app.use('/content', principalRoutes)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})