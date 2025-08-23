import { Router } from 'express'
import { z } from 'zod'
import { findInvestorByEmail, findInvestorByUsername } from '../repositories/investorlogin.repo.js'
import { signToken } from '../utils/jwt.util.js'

const router = Router()

const loginSchema = z.object({
    email: z.string().email().optional(),
    username: z.string().min(1).optional(),
    password: z.string().min(1)
}).refine((data) => data.email || data.username, {
    message: 'Either email or username is required',
    path: ['email']
})

router.post('/login', async (req, res, next) => {
    try {
        const { email, username, password } = loginSchema.parse(req.body)
        const user = email ? await findInvestorByEmail(email) : await findInvestorByUsername(username)
        if (!user) return res.status(401).json({ status: 'error', message: 'Invalid credentials' })
        const ok = user.password === password
        if (!ok) return res.status(401).json({ status: 'error', message: 'Invalid credentials' })
        const token = signToken({ sid: user.sno, role: 'investor' })
        res.json({ token, investor: { sno: user.sno, email: user.email, username: user.username } })
    } catch (err) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors })
        }
        next(err)
    }
})

export default router
