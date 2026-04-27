import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';


const JWT_SECRET = process.env.JWT_SECRET_CODE || 'your_fallback_secret'

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) return res.status(400).json({ message: "User already exists" })

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: role // 'principal' or 'teacher'
            }
        })

        res.status(201).json({ message: "User registered successfully", userId: user.id })
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return res.status(404).json({ message: "User not found" })

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" })

        // Create Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, role: user.role }
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}