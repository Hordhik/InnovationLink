import { Router } from 'express'
import authRouter from './auth.routes.js'
import startupRouter from './startup.routes.js'
import investorRouter from './investor.routes.js'

const router = Router()

// placeholder routes - will expand later
router.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() })
})

router.use('/auth', authRouter)
router.use('/startup', startupRouter)
router.use('/investor', investorRouter)

export default router
