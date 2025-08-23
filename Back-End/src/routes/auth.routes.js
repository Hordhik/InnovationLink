import { Router } from 'express'

const router = Router()

// Placeholder auth route
router.get('/ping', (req, res) => {
    res.json({ status: 'ok', route: 'auth' })
})

export default router
